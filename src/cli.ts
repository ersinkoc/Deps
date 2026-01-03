#!/usr/bin/env node
/**
 * @oxog/deps CLI
 *
 * Zero-dependency CLI implementation
 *
 * @packageDocumentation
 */

import { resolve } from 'node:path';
import { deps, createAnalyzer } from './index.js';

/**
 * CLI error codes
 */
const EXIT_CODES = {
  SUCCESS: 0,
  ERROR: 1,
  FAILURE_FOUND: 1
} as const;

/**
 * Print help message
 */
function printHelp(command?: string): void {
  const helps: Record<string, string> = {
    default: `
@oxog/deps - Zero-dependency analyzer for Node.js projects

USAGE:
  deps <command> [options]

COMMANDS:
  tree       Show dependency tree
  circular   Detect circular dependencies
  unused     Find unused dependencies
  missing    Find missing dependencies
  duplicates Find duplicate package versions
  size       Analyze dependency sizes
  updates    Check for available updates
  security   Run security audit
  report     Generate full report
  watch      Watch for changes
  mcp        Start MCP server
  help       Show this help message

GLOBAL OPTIONS:
  --cwd <path>      Working directory (default: current directory)
  --no-cache        Disable cache
  --verbose         Show verbose output
  --version         Show version number

EXAMPLES:
  deps tree --depth=3
  deps circular --fail-on-circular
  deps report --format=html > report.html

For more information:
  https://deps.oxog.dev
`,
    tree: `
USAGE:
  deps tree [options]

OPTIONS:
  --depth <n>       Maximum tree depth (default: unlimited)
  --format <fmt>    Output format: json, md, html (default: ascii)

EXAMPLES:
  deps tree
  deps tree --depth=3
  deps tree --format=json
`,
    circular: `
USAGE:
  deps circular [options]

OPTIONS:
  --fail-on-circular    Exit with error if circular deps found

EXAMPLES:
  deps circular
  deps circular --fail-on-circular
`,
    unused: `
USAGE:
  deps unused [options]

OPTIONS:
  --ignore <patterns>    Comma-separated ignore patterns

EXAMPLES:
  deps unused
  deps unused --ignore="*.test.ts,*.spec.ts"
`,
    missing: `
USAGE:
  deps missing

EXAMPLES:
  deps missing
`,
    duplicates: `
USAGE:
  deps duplicates [options]

OPTIONS:
  --json    Output as JSON

EXAMPLES:
  deps duplicates
  deps duplicates --json
`,
    size: `
USAGE:
  deps size [options]

OPTIONS:
  --limit <size>    Fail if total size exceeds limit (e.g., 500kb)
  --sort <field>    Sort by: size, name (default: size)
  --json            Output as JSON

EXAMPLES:
  deps size
  deps size --limit=500kb
  deps size --sort=name
`,
    updates: `
USAGE:
  deps updates [options]

OPTIONS:
  --major    Show only major updates
  --minor    Show only minor updates
  --patch    Show only patch updates

EXAMPLES:
  deps updates
  deps updates --major
`,
    security: `
USAGE:
  deps security [options]

OPTIONS:
  --fail-on-high        Fail if high severity vulnerabilities found
  --fail-on-critical    Fail if critical severity vulnerabilities found

EXAMPLES:
  deps security
  deps security --fail-on-high
`,
    report: `
USAGE:
  deps report [options]

OPTIONS:
  --format <fmt>    Output format: json, md, html (default: md)
  --monorepo        Enable monorepo mode

EXAMPLES:
  deps report
  deps report --format=html > report.html
  deps report --monorepo
`,
    watch: `
USAGE:
  deps watch

EXAMPLES:
  deps watch
`,
    mcp: `
USAGE:
  deps mcp

Starts the MCP server for AI assistant integration.

EXAMPLES:
  deps mcp
`
  };

  console.log(helps[command ?? 'default'] ?? helps.default);
}

/**
 * Parse command line arguments
 */
function parseArgs(args: string[]): {
  command: string;
  options: Record<string, string | boolean>;
  positional: string[];
} {
  const command = args[0] ?? 'help';
  const options: Record<string, string | boolean> = {};
  const positional: string[] = [];

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');

      if (value !== undefined) {
        options[key] = value;
      } else {
        options[key] = true;
      }
    } else if (arg.startsWith('-')) {
      options[arg.slice(1)] = true;
    } else {
      positional.push(arg);
    }
  }

  return { command, options, positional };
}

/**
 * Main CLI entry point
 */
async function main(): Promise<number> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    printHelp(args[1]);
    return EXIT_CODES.SUCCESS;
  }

  if (args[0] === '--version' || args[0] === '-v') {
    console.log('@oxog/deps v1.0.0');
    return EXIT_CODES.SUCCESS;
  }

  const { command, options } = parseArgs(args);

  // Get working directory
  const cwd = options.cwd ? resolve(options.cwd as string) : process.cwd();

  // Build analysis options
  const analyzeOptions: any = {
    cwd,
    cache: !options['no-cache']
  };

  // Handle commands
  switch (command) {
    case 'tree': {
      const result = await deps.analyze(cwd, analyzeOptions);

      if (options.format === 'json') {
        console.log(result.toJSON());
      } else if (options.format === 'md') {
        console.log(result.toMarkdown());
      } else if (options.format === 'html') {
        console.log(result.toHTML());
      } else {
        console.log(result.toTree());
      }

      return EXIT_CODES.SUCCESS;
    }

    case 'circular': {
      analyzeOptions.plugins = ['tree', 'circular'];

      const result = await deps.analyze(cwd, analyzeOptions);

      if (result.circular.length > 0) {
        console.log(`Found ${result.circular.length} circular dependencies:\n`);

        for (let i = 0; i < result.circular.length; i++) {
          const chain = result.circular[i];
          console.log(`${i + 1}. ${chain.join(' → ')} → ${chain[0]}`);
        }

        if (options['fail-on-circular']) {
          return EXIT_CODES.FAILURE_FOUND;
        }
      } else {
        console.log('No circular dependencies found.');
      }

      return EXIT_CODES.SUCCESS;
    }

    case 'unused': {
      analyzeOptions.full = true;

      const result = await deps.analyze(cwd, analyzeOptions);

      if (result.unused && result.unused.length > 0) {
        console.log(`Found ${result.unused.length} unused dependencies:\n`);

        for (const dep of result.unused) {
          console.log(`  - ${dep}`);
        }
      } else {
        console.log('No unused dependencies found.');
      }

      return EXIT_CODES.SUCCESS;
    }

    case 'missing': {
      analyzeOptions.full = true;

      const result = await deps.analyze(cwd, analyzeOptions);

      if (result.missing && result.missing.length > 0) {
        console.log(`Found ${result.missing.length} missing dependencies:\n`);

        for (const dep of result.missing) {
          console.log(`  - ${dep}`);
        }
      } else {
        console.log('No missing dependencies found.');
      }

      return EXIT_CODES.SUCCESS;
    }

    case 'duplicates': {
      analyzeOptions.full = true;

      const result = await deps.analyze(cwd, analyzeOptions);

      if (result.duplicates && Object.keys(result.duplicates).length > 0) {
        if (options.json) {
          console.log(JSON.stringify(result.duplicates, null, 2));
        } else {
          console.log(`Found ${Object.keys(result.duplicates).length} packages with duplicates:\n`);

          for (const [pkg, versions] of Object.entries(result.duplicates)) {
            console.log(`  - ${pkg}: ${versions.join(', ')}`);
          }
        }
      } else {
        console.log('No duplicate versions found.');
      }

      return EXIT_CODES.SUCCESS;
    }

    case 'size': {
      analyzeOptions.full = true;

      const result = await deps.analyze(cwd, analyzeOptions);

      if (result.size) {
        console.log(`Total size: ${result.size.totalFormatted}\n`);

        let packages = [...result.size.packages];

        if (options.sort === 'name') {
          packages.sort((a, b) => a.name.localeCompare(b.name));
        }

        for (const pkg of packages) {
          console.log(`  ${pkg.name}: ${pkg.sizeFormatted} (${pkg.percentage}%)`);
        }

        // Check size limit
        if (options.limit) {
          const { parseSize } = await import('./utils/size.js');
          const limit = parseSize(options.limit as string);

          if (result.size.total > limit) {
            console.log(`\nSize limit exceeded: ${result.size.totalFormatted} > ${options.limit}`);
            return EXIT_CODES.FAILURE_FOUND;
          }
        }
      }

      return EXIT_CODES.SUCCESS;
    }

    case 'updates': {
      analyzeOptions.full = true;

      const result = await deps.analyze(cwd, analyzeOptions);

      if (result.updates && result.updates.length > 0) {
        let updates = result.updates;

        // Filter by type
        if (options.major) {
          updates = updates.filter(u => u.type === 'major');
        } else if (options.minor) {
          updates = updates.filter(u => u.type === 'minor');
        } else if (options.patch) {
          updates = updates.filter(u => u.type === 'patch');
        }

        console.log(`Found ${updates.length} available updates:\n`);

        for (const update of updates) {
          console.log(`  ${update.name}: ${update.current} → ${update.latest} (${update.type})`);
        }
      } else {
        console.log('No updates available.');
      }

      return EXIT_CODES.SUCCESS;
    }

    case 'security': {
      analyzeOptions.full = true;

      const result = await deps.analyze(cwd, analyzeOptions);

      if (result.security && result.security.total > 0) {
        console.log(`Found ${result.security.total} vulnerabilities\n`);
        console.log(`  Critical: ${result.security.bySeverity.critical}`);
        console.log(`  High: ${result.security.bySeverity.high}`);
        console.log(`  Moderate: ${result.security.bySeverity.moderate}`);
        console.log(`  Low: ${result.security.bySeverity.low}`);

        // Check fail conditions
        if (options['fail-on-critical'] && result.security.bySeverity.critical > 0) {
          return EXIT_CODES.FAILURE_FOUND;
        }

        if (options['fail-on-high'] && result.security.bySeverity.high > 0) {
          return EXIT_CODES.FAILURE_FOUND;
        }
      } else {
        console.log('No vulnerabilities found.');
      }

      return EXIT_CODES.SUCCESS;
    }

    case 'report': {
      analyzeOptions.full = true;
      analyzeOptions.monorepo = options.monorepo;

      const result = await deps.analyze(cwd, analyzeOptions);

      const format = (options.format as 'json' | 'md' | 'html') ?? 'md';

      console.log(result.toReport(format));

      return EXIT_CODES.SUCCESS;
    }

    case 'watch': {
      console.log('Watch mode - press Ctrl+C to stop');

      const analyzer = createAnalyzer({
        cwd,
        cache: false,
        watch: true
      });

      analyzer.on('change', (result) => {
        console.log('\n--- Dependencies changed ---\n');
        console.log(`Total: ${result.tree.count} dependencies`);
        console.log(`Circular: ${result.circular.length} chains`);

        if (result.unused) {
          console.log(`Unused: ${result.unused.length} packages`);
        }

        if (result.missing) {
          console.log(`Missing: ${result.missing.length} packages`);
        }

        console.log('');
      });

      await analyzer.run();

      // Keep running
      return new Promise(() => {});
    }

    case 'mcp': {
      const { createMCPServer } = await import('./mcp/index.js');

      const server = createMCPServer();
      await server.start();

      // Keep running
      return new Promise(() => {});
    }

    default: {
      console.error(`Unknown command: ${command}`);
      console.error('Run "deps help" for usage information');
      return EXIT_CODES.ERROR;
    }
  }
}

// Run CLI
main()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('Error:', error.message);
    process.exit(EXIT_CODES.ERROR);
  });

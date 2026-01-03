/**
 * Missing plugin - Detect missing dependencies
 *
 * Zero-dependency implementation
 *
 * @packageDocumentation
 */

import { listFiles, readFileSafe } from '../../utils/fs.js';
import { ignore } from '../../utils/glob.js';
import type { AnalyzerPlugin, AnalyzerContext } from '../../types.js';

// Node.js built-in modules
const BUILTIN_MODULES = new Set([
  'assert', 'async_hooks', 'buffer', 'child_process', 'cluster', 'console',
  'constants', 'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http',
  'http2', 'https', 'inspector', 'module', 'net', 'os', 'path', 'perf_hooks',
  'process', 'punycode', 'querystring', 'readline', 'repl', 'stream',
  'string_decoder', 'sys', 'timers', 'tls', 'trace_events', 'tty', 'url',
  'util', 'v8', 'vm', 'worker_threads', 'zlib',
  // Node.js prefixed with node:
  'node:assert', 'node:async_hooks', 'node:buffer', 'node:child_process',
  'node:cluster', 'node:console', 'node:constants', 'node:crypto', 'node:dgram',
  'node:dns', 'node:domain', 'node:events', 'node:fs', 'node:http', 'node:http2',
  'node:https', 'node:inspector', 'node:module', 'node:net', 'node:os',
  'node:path', 'node:perf_hooks', 'node:process', 'node:punycode',
  'node:querystring', 'node:readline', 'node:repl', 'node:stream',
  'node:string_decoder', 'node:sys', 'node:timers', 'node:tls',
  'node:trace_events', 'node:tty', 'node:url', 'node:util', 'node:v8',
  'node:vm', 'node:worker_threads', 'node:zlib'
]);

/**
 * Import statement patterns
 */
const IMPORT_PATTERNS = [
  // ES6 imports
  /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"`]([^'"`]+)['"`]/g,
  // Dynamic imports
  /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
  // CommonJS require
  /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g
];

/**
 * Extract all imported package names from source code
 * @param content - Source file content
 */
function extractImports(content: string): Set<string> {
  const imports = new Set<string>();

  for (const pattern of IMPORT_PATTERNS) {
    let match: RegExpExecArray | null;

    // Reset regex state
    pattern.lastIndex = 0;

    while ((match = pattern.exec(content)) !== null) {
      const importPath = match[1];

      // Only capture package imports (not relative paths)
      if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
        // Get the package name (handle scoped packages)
        const parts = importPath.split('/');
        const packageName = importPath.startsWith('@')
          ? `${parts[0]}/${parts[1]}`
          : parts[0];

        // Skip built-in modules
        if (!BUILTIN_MODULES.has(packageName) && !BUILTIN_MODULES.has(`node:${packageName}`)) {
          imports.add(packageName);
        }
      }
    }
  }

  return imports;
}

/**
 * Missing dependency detection plugin
 */
export const missingPlugin: AnalyzerPlugin<AnalyzerContext> = {
  name: 'missing',
  version: '1.0.0',

  install(kernel) {
    kernel.on('analyze', async (context) => {
      kernel.reportProgress('missing', 0, 'Scanning for missing dependencies');

      // Get all dependencies from package.json
      const pkg = context.package;
      const allDeps = new Set<string>([
        ...Object.keys(pkg.dependencies ?? {}),
        ...Object.keys(pkg.devDependencies ?? {}),
        ...Object.keys(pkg.peerDependencies ?? {}),
        ...Object.keys(pkg.optionalDependencies ?? {})
      ]);

      // Get ignore patterns from config
      const ignorePatterns = kernel.config.ignore ?? [];

      // Scan source files
      const sourceFiles = await listFiles(context.cwd, true);
      const filteredFiles = ignore(sourceFiles, [...ignorePatterns, '**/node_modules/**']);

      const importedPackages = new Set<string>();

      for (const file of filteredFiles) {
        // Only scan source files
        if (/\.(js|jsx|ts|tsx|mts|mjs|cjs)$/.test(file)) {
          const content = await readFileSafe(file);

          if (content) {
            const fileImports = extractImports(content);

            for (const imp of fileImports) {
              importedPackages.add(imp);
            }
          }
        }
      }

      // Find missing dependencies
      const missing: string[] = [];

      for (const imp of importedPackages) {
        if (!allDeps.has(imp)) {
          missing.push(imp);
        }
      }

      // Store result
      (kernel as any).setResult('missing', missing);

      // Report findings
      for (const dep of missing) {
        kernel.reportFinding('missing', 'warning', `Missing dependency: ${dep}`, dep);
      }

      kernel.reportProgress('missing', 100, `Found ${missing.length} missing dependencies`);
    });
  }
};

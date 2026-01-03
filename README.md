# @oxog/deps

> Zero-dependency analyzer for Node.js projects with circular, unused, duplicate detection, security audit, and monorepo support

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm version](https://badge.fury.io/js/%40oxog%2Fdeps.svg)](https://www.npmjs.com/package/@oxog/deps)

A comprehensive dependency analysis toolkit that helps developers understand, optimize, and maintain their project dependencies. Features include dependency tree visualization, circular dependency detection, unused and missing dependency identification, duplicate version detection, bundle size analysis, update suggestions, security auditing via npm audit, and full monorepo support. Available as both CLI and programmatic API with caching and watch mode.

## Features

- **Zero Runtime Dependencies** - Every feature implemented from scratch
- **Plugin Architecture** - Extensible micro-kernel design
- **15+ Analysis Features** - Tree, circular, unused, missing, duplicates, size, updates, security
- **Monorepo Support** - pnpm, npm, yarn, Lerna, Turborepo, Nx
- **CLI + API** - Use as command-line tool or programmatically
- **Multiple Output Formats** - JSON, ASCII tree, Markdown, HTML
- **CI/CD Integration** - Exit codes for automated workflows
- **MCP Server** - AI assistant integration via Model Context Protocol

## Installation

```bash
npm install @oxog/deps
```

## Quick Start

### CLI Usage

```bash
# Generate full report
npx @oxog/deps report

# Show dependency tree
npx @oxog/deps tree --depth=3

# Detect circular dependencies
npx @oxog/deps circular --fail-on-circular

# Find unused dependencies
npx @oxog/deps unused

# Check size impact
npx @oxog/deps size --limit=500kb

# Security audit
npx @oxog/deps security --fail-on-high
```

### Programmatic Usage

```typescript
import { deps, createAnalyzer } from '@oxog/deps';

// Quick analysis
const result = await deps.analyze('./package.json');
console.log(result.tree);       // Dependency tree
console.log(result.circular);   // Circular dependencies

// Full analysis with all plugins
const full = await deps.analyze('./package.json', { full: true });
console.log(full.unused);       // Unused dependencies
console.log(full.missing);      // Missing dependencies
console.log(full.duplicates);   // Duplicate versions
console.log(full.size);         // Size analysis
console.log(full.updates);      // Update suggestions
console.log(full.security);     // Security audit

// Advanced usage with custom configuration
const analyzer = createAnalyzer({
  cwd: './my-project',
  plugins: ['tree', 'circular', 'unused', 'size'],
  cache: true,
  cacheTTL: 3600000
});

// Event listeners
analyzer.on('progress', ({ plugin, percent }) => {
  console.log(`${plugin}: ${percent}%`);
});

analyzer.on('finding', ({ type, severity, message }) => {
  console.log(`[${severity}] ${type}: ${message}`);
});

const result = await analyzer.run();
```

## Documentation

Full documentation available at [deps.oxog.dev](https://deps.oxog.dev)

## CLI Commands

| Command | Description |
|---------|-------------|
| `tree` | Show dependency tree |
| `circular` | Detect circular dependencies |
| `unused` | Find unused dependencies |
| `missing` | Find missing dependencies |
| `duplicates` | Find duplicate versions |
| `size` | Analyze dependency sizes |
| `updates` | Check for updates |
| `security` | Run security audit |
| `report` | Generate full report |
| `watch` | Watch for changes |
| `mcp` | Start MCP server |

## Plugin System

@oxog/deps uses a micro-kernel plugin architecture:

### Core Plugins (always loaded)
- `tree` - Dependency tree visualization
- `circular` - Circular dependency detection

### Optional Plugins (opt-in)
- `unused` - Unused dependency detection
- `missing` - Missing dependency detection
- `duplicates` - Duplicate version detection
- `size` - Size impact analysis
- `updates` - Update suggestions
- `security` - npm audit wrapper
- `monorepo` - Workspace support

### Custom Plugins

```typescript
import { createAnalyzer } from '@oxog/deps';

const analyzer = createAnalyzer();

analyzer.use({
  name: 'custom',
  version: '1.0.0',
  install: (kernel) => {
    kernel.on('analyze', (context) => {
      // Access dependency graph
      const graph = context.graph;

      // Report findings
      kernel.reportFinding('custom', 'info', 'My finding');
    });
  }
});

await analyzer.run();
```

## Output Formats

Generate reports in multiple formats:

```typescript
const result = await deps.analyze('./package.json', { full: true });

// JSON
console.log(result.toJSON());

// ASCII tree
console.log(result.toTree());

// Markdown
console.log(result.toMarkdown());

// HTML
console.log(result.toHTML());

// Full report
console.log(result.toReport('html'));
```

## CI/CD Integration

Exit codes for automated workflows:

```bash
# Fail if circular dependencies found
npx @oxog/deps circular --fail-on-circular

# Fail if size exceeds limit
npx @oxog/deps size --limit=500kb

# Fail if high severity vulnerabilities
npx @oxog/deps security --fail-on-high
```

## Monorepo Support

Auto-detects and supports all major monorepo tools:

- pnpm workspaces
- npm workspaces
- yarn workspaces
- Lerna
- Turborepo
- Nx

```typescript
const result = await deps.analyze('./', { monorepo: true });
```

## MCP Server

Model Context Protocol server for AI assistant integration:

```bash
npx @oxog/deps mcp
```

Available tools:
- `analyze_dependencies` - Full dependency analysis
- `get_circular_deps` - Get circular dependencies
- `get_unused_deps` - Get unused dependencies
- `check_size_budget` - Check size against budget
- `security_audit` - Run security audit

## License

MIT © 2025 Ersin Koç

## Links

- GitHub: [https://github.com/ersinkoc/deps](https://github.com/ersinkoc/deps)
- Documentation: [https://deps.oxog.dev](https://deps.oxog.dev)

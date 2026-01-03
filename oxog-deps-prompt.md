# @oxog/deps - Zero-Dependency NPM Package

## Package Identity

| Field | Value |
|-------|-------|
| **NPM Package** | `@oxog/deps` |
| **GitHub Repository** | `https://github.com/ersinkoc/deps` |
| **Documentation Site** | `https://deps.oxog.dev` |
| **License** | MIT |
| **Author** | Ersin Koç (ersinkoc) |

> **NO social media, Discord, email, or external links allowed.**

---

## Package Description

**One-line:** Zero-dependency analyzer for Node.js projects with circular, unused, duplicate detection, security audit, and monorepo support

A comprehensive dependency analysis toolkit that helps developers understand, optimize, and maintain their project dependencies. Features include dependency tree visualization, circular dependency detection, unused and missing dependency identification, duplicate version detection, bundle size analysis, update suggestions, security auditing via npm audit, and full monorepo support for pnpm/npm/yarn workspaces, Lerna, Turborepo, and Nx. Available as both CLI and programmatic API with caching and watch mode.

---

## NON-NEGOTIABLE RULES

These rules are **ABSOLUTE** and must be followed without exception.

### 1. ZERO RUNTIME DEPENDENCIES

```json
{
  "dependencies": {}  // MUST BE EMPTY - NO EXCEPTIONS
}
```

- Implement EVERYTHING from scratch
- No lodash, no axios, no moment - nothing
- Write your own utilities, parsers, validators
- If you think you need a dependency, you don't

**Allowed devDependencies only:**
```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^2.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "tsup": "^8.0.0",
    "@types/node": "^20.0.0",
    "prettier": "^3.0.0",
    "eslint": "^9.0.0"
  }
}
```

### 2. 100% TEST COVERAGE

- Every line of code must be tested
- Every branch must be tested
- Every function must be tested
- **All tests must pass** (100% success rate)
- Use Vitest for testing
- Coverage thresholds enforced in config

### 3. MICRO-KERNEL ARCHITECTURE

All packages MUST use plugin-based architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                        User Code                            │
├─────────────────────────────────────────────────────────────┤
│     CLI: tree · circular · unused · size · report · watch   │
├─────────────────────────────────────────────────────────────┤
│       Programmatic: deps.analyze() · createAnalyzer()       │
├─────────────────────────────────────────────────────────────┤
│                     Plugin Registry                          │
│        use() · register() · unregister() · list()           │
├────────┬────────┬─────────┬──────────┬──────────┬───────────┤
│  tree  │circular│ unused  │ missing  │duplicates│   size    │
│ (core) │ (core) │  (opt)  │  (opt)   │  (opt)   │   (opt)   │
├────────┴────────┼─────────┼──────────┼──────────┼───────────┤
│                 │ updates │ security │ monorepo │ community │
│                 │  (opt)  │  (opt)   │  (opt)   │  plugins  │
├─────────────────┴─────────┴──────────┴──────────┴───────────┤
│                       Micro Kernel                           │
│   PackageParser · NodeModulesTraverser · EventBus ·         │
│   Cache · ProgressReporter · ErrorBoundary                  │
└─────────────────────────────────────────────────────────────┘
```

**Kernel responsibilities (minimal):**
- Package.json parsing and validation
- node_modules traversal and caching
- Plugin registration and lifecycle
- Event bus for progress/findings/errors
- Cache management (.deps-cache)
- Configuration management

### 4. DEVELOPMENT WORKFLOW

Create these documents **FIRST**, before any code:

1. **SPECIFICATION.md** - Complete package specification
2. **IMPLEMENTATION.md** - Architecture and design decisions  
3. **TASKS.md** - Ordered task list with dependencies

Only after all three documents are complete, implement code following TASKS.md sequentially.

### 5. TYPESCRIPT STRICT MODE

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "moduleResolution": "bundler",
    "target": "ES2022",
    "module": "ESNext"
  }
}
```

### 6. LLM-NATIVE DESIGN

Package must be designed for both humans AND AI assistants:

- **llms.txt** file in root (< 2000 tokens)
- **Predictable API** naming (`create`, `get`, `set`, `use`, `remove`)
- **Rich JSDoc** with @example on every public API
- **15+ examples** organized by category
- **README** optimized for LLM consumption

### 7. NO EXTERNAL LINKS

- ✅ GitHub repository URL
- ✅ Custom domain (deps.oxog.dev)
- ✅ npm package URL
- ❌ Social media (Twitter, LinkedIn, etc.)
- ❌ Discord/Slack links
- ❌ Email addresses
- ❌ Donation/sponsor links

---

## CORE FEATURES

### 1. Dependency Tree Visualization

Build and display the complete dependency tree of a project with configurable depth.

**API Example:**
```typescript
import { deps } from '@oxog/deps';

const result = await deps.analyze('./package.json');
console.log(result.tree);
// Output: Hierarchical tree structure with all dependencies

// CLI
// npx @oxog/deps tree --depth=3 --json
```

### 2. Circular Dependency Detection

Detect circular dependencies in the project that can cause runtime issues.

**API Example:**
```typescript
const result = await deps.analyze('./package.json');
console.log(result.circular);
// Output: [['a', 'b', 'c', 'a'], ['x', 'y', 'x']]

// CLI with CI exit code
// npx @oxog/deps circular --fail-on-circular
```

### 3. Unused Dependency Detection

Find dependencies listed in package.json but not imported anywhere in the codebase.

**API Example:**
```typescript
const result = await deps.analyze('./package.json');
console.log(result.unused);
// Output: ['lodash', 'moment', 'underscore']

// CLI with ignore patterns
// npx @oxog/deps unused --ignore="*.test.ts"
```

### 4. Missing Dependency Detection

Find imports that reference packages not listed in package.json.

**API Example:**
```typescript
const result = await deps.analyze('./package.json');
console.log(result.missing);
// Output: ['missing-peer-dep', 'forgotten-package']

// CLI
// npx @oxog/deps missing
```

### 5. Duplicate Version Detection

Find packages installed with multiple versions, causing bundle bloat.

**API Example:**
```typescript
const result = await deps.analyze('./package.json');
console.log(result.duplicates);
// Output: { 'lodash': ['4.17.0', '4.17.21'], 'chalk': ['4.0.0', '5.0.0'] }

// CLI
// npx @oxog/deps duplicates --json
```

### 6. Size Impact Analysis

Analyze the size impact of each dependency on the final bundle.

**API Example:**
```typescript
const result = await deps.analyze('./package.json');
console.log(result.size);
// Output: { total: '2.5MB', packages: [{ name: 'moment', size: '500KB' }, ...] }

// CLI with size limit for CI
// npx @oxog/deps size --limit=500kb --sort=size
```

### 7. Update Suggestions

Check for available updates for all dependencies.

**API Example:**
```typescript
const result = await deps.analyze('./package.json');
console.log(result.updates);
// Output: [{ name: 'lodash', current: '4.17.0', latest: '4.17.21', type: 'patch' }]

// CLI filtered by type
// npx @oxog/deps updates --major
// npx @oxog/deps updates --minor
// npx @oxog/deps updates --patch
```

### 8. Security Audit Integration

Wrapper around npm audit for vulnerability detection.

**API Example:**
```typescript
const result = await deps.analyze('./package.json');
console.log(result.security);
// Output: { vulnerabilities: [{ package: 'lodash', severity: 'high', ... }] }

// CLI with CI exit code
// npx @oxog/deps security --fail-on-high
```

### 9. Monorepo Support

Full support for all major monorepo tools.

**API Example:**
```typescript
const analyzer = createAnalyzer({
  cwd: './my-monorepo',
  monorepo: true  // Auto-detect: pnpm/npm/yarn workspaces, Lerna, Turborepo, Nx
});

const result = await analyzer.run();
// Analyzes all packages in the monorepo

// CLI
// npx @oxog/deps report --monorepo
```

### 10. Watch Mode

Automatically re-analyze when package.json or dependencies change.

**API Example:**
```typescript
const analyzer = createAnalyzer({ watch: true });

analyzer.on('change', (result) => {
  console.log('Dependencies changed:', result);
});

await analyzer.start();

// CLI
// npx @oxog/deps watch
```

### 11. Caching

Cache analysis results for faster subsequent runs.

**API Example:**
```typescript
const analyzer = createAnalyzer({
  cache: true,
  cacheTTL: 3600000  // 1 hour
});

// Cache stored in .deps-cache file
// Automatically invalidated when node_modules changes
```

### 12. Multiple Output Formats

Support for JSON, ASCII tree, Markdown, and HTML output.

**API Example:**
```typescript
const result = await deps.analyze('./package.json');

// Programmatic
const json = result.toJSON();
const tree = result.toTree();
const markdown = result.toMarkdown();
const html = result.toHTML();

// CLI
// npx @oxog/deps tree --format=json
// npx @oxog/deps tree --format=tree
// npx @oxog/deps tree --format=md
// npx @oxog/deps tree --format=html
```

### 13. Full Report Generation

Generate a comprehensive report combining all analyses.

**API Example:**
```typescript
const result = await deps.analyze('./package.json', { full: true });
const report = result.toReport('html');

// CLI
// npx @oxog/deps report --format=html > report.html
// npx @oxog/deps report --format=md > report.md
// npx @oxog/deps report --format=json > report.json
```

### 14. CI/CD Integration

Exit codes for CI pipeline integration.

**API Example:**
```typescript
const analyzer = createAnalyzer({
  failOn: {
    circular: true,
    unused: false,
    sizeLimit: '500kb',
    securityHigh: true
  }
});

const result = await analyzer.run();
process.exit(result.exitCode);  // 0 = pass, 1 = fail

// CLI
// npx @oxog/deps circular --fail-on-circular
// npx @oxog/deps size --limit=500kb
// npx @oxog/deps security --fail-on-high
```

### 15. Event-Based Progress

Real-time progress events for long-running analyses.

**API Example:**
```typescript
const analyzer = createAnalyzer();

analyzer.on('progress', ({ plugin, percent, message }) => {
  console.log(`[${plugin}] ${percent}% - ${message}`);
});

analyzer.on('finding', ({ type, severity, message, package: pkg }) => {
  console.log(`Found ${severity} ${type}: ${message} in ${pkg}`);
});

analyzer.on('error', (error) => {
  console.error('Analysis error:', error);
});

await analyzer.run();
```

---

## PLUGIN SYSTEM

### Plugin Interface

```typescript
/**
 * Plugin interface for extending analyzer functionality.
 * 
 * @typeParam TContext - Shared context type between plugins
 * 
 * @example
 * ```typescript
 * const customPlugin: AnalyzerPlugin = {
 *   name: 'custom',
 *   version: '1.0.0',
 *   install: (kernel) => {
 *     kernel.on('analyze', (context) => {
 *       // Custom analysis logic
 *     });
 *   }
 * };
 * ```
 */
export interface AnalyzerPlugin<TContext = AnalyzerContext> {
  /** Unique plugin identifier (kebab-case) */
  name: string;
  
  /** Semantic version (e.g., "1.0.0") */
  version: string;
  
  /** Other plugins this plugin depends on */
  dependencies?: string[];
  
  /**
   * Called when plugin is registered.
   * @param kernel - The kernel instance
   */
  install: (kernel: AnalyzerKernel<TContext>) => void;
  
  /**
   * Called after all plugins are installed.
   * @param context - Shared context object
   */
  onInit?: (context: TContext) => void | Promise<void>;
  
  /**
   * Called when plugin is unregistered.
   */
  onDestroy?: () => void | Promise<void>;
  
  /**
   * Called on error in this plugin.
   * @param error - The error that occurred
   */
  onError?: (error: Error) => void;
}
```

### Core Plugins (Always Loaded)

| Plugin | Description |
|--------|-------------|
| `tree` | Dependency tree visualization with configurable depth |
| `circular` | Circular dependency detection using Tarjan's algorithm |

### Optional Plugins (Opt-in)

| Plugin | Description | Enable |
|--------|-------------|--------|
| `unused` | Detect dependencies not imported in codebase | `analyzer.use(unusedPlugin)` |
| `missing` | Detect imports without package.json entry | `analyzer.use(missingPlugin)` |
| `duplicates` | Find packages with multiple installed versions | `analyzer.use(duplicatesPlugin)` |
| `size` | Analyze size impact of each dependency | `analyzer.use(sizePlugin)` |
| `updates` | Check for available dependency updates | `analyzer.use(updatesPlugin)` |
| `security` | npm audit wrapper for vulnerability detection | `analyzer.use(securityPlugin)` |
| `monorepo` | Support for pnpm/npm/yarn/lerna/turbo/nx workspaces | `analyzer.use(monorepoPlugin)` |

---

## API DESIGN

### Main Export

```typescript
import { deps, createAnalyzer } from '@oxog/deps';

// Quick API - analyze with all core plugins
const result = await deps.analyze('./package.json');
console.log(result.tree);      // Dependency tree
console.log(result.circular);  // Circular dependencies

// Full analysis with all plugins
const fullResult = await deps.analyze('./package.json', { full: true });
console.log(fullResult.unused);
console.log(fullResult.duplicates);
console.log(fullResult.size);

// Advanced API - fine-grained control
const analyzer = createAnalyzer({
  cwd: './my-project',
  plugins: ['tree', 'circular', 'unused', 'size'],
  cache: true,
  cacheTTL: 3600000,
  ignore: ['**/node_modules/**', '**/dist/**'],
  monorepo: false
});

// Register custom plugin
analyzer.use(myCustomPlugin);

// Event listeners
analyzer.on('progress', ({ plugin, percent }) => {
  console.log(`${plugin}: ${percent}%`);
});

analyzer.on('finding', ({ type, severity, message }) => {
  console.log(`[${severity}] ${type}: ${message}`);
});

// Run analysis
const result = await analyzer.run();

// Output formats
console.log(result.toJSON());
console.log(result.toTree());
console.log(result.toMarkdown());
console.log(result.toHTML());
```

### Type Definitions

```typescript
/**
 * Options for creating an analyzer instance.
 */
export interface AnalyzerOptions {
  /** Working directory (default: process.cwd()) */
  cwd?: string;
  
  /** Plugins to enable (default: ['tree', 'circular']) */
  plugins?: PluginName[];
  
  /** Enable caching (default: false) */
  cache?: boolean;
  
  /** Cache TTL in milliseconds (default: 3600000 = 1 hour) */
  cacheTTL?: number;
  
  /** Glob patterns to ignore */
  ignore?: string[];
  
  /** Enable monorepo mode (default: auto-detect) */
  monorepo?: boolean;
  
  /** Enable watch mode (default: false) */
  watch?: boolean;
  
  /** CI failure conditions */
  failOn?: FailOnOptions;
}

/**
 * CI failure conditions.
 */
export interface FailOnOptions {
  /** Fail if circular dependencies found */
  circular?: boolean;
  
  /** Fail if unused dependencies found */
  unused?: boolean;
  
  /** Fail if total size exceeds limit (e.g., '500kb') */
  sizeLimit?: string;
  
  /** Fail if high severity vulnerabilities found */
  securityHigh?: boolean;
  
  /** Fail if critical severity vulnerabilities found */
  securityCritical?: boolean;
}

/**
 * Analysis result containing all findings.
 */
export interface AnalysisResult {
  /** Dependency tree */
  tree: DependencyTree;
  
  /** Circular dependency chains */
  circular: CircularChain[];
  
  /** Unused dependencies (if plugin enabled) */
  unused?: string[];
  
  /** Missing dependencies (if plugin enabled) */
  missing?: string[];
  
  /** Duplicate versions (if plugin enabled) */
  duplicates?: Record<string, string[]>;
  
  /** Size analysis (if plugin enabled) */
  size?: SizeAnalysis;
  
  /** Update suggestions (if plugin enabled) */
  updates?: UpdateSuggestion[];
  
  /** Security audit results (if plugin enabled) */
  security?: SecurityAudit;
  
  /** CI exit code (0 = pass, 1 = fail) */
  exitCode: number;
  
  /** Convert to JSON */
  toJSON(): string;
  
  /** Convert to ASCII tree */
  toTree(): string;
  
  /** Convert to Markdown */
  toMarkdown(): string;
  
  /** Convert to HTML */
  toHTML(): string;
  
  /** Generate full report */
  toReport(format: 'json' | 'md' | 'html'): string;
}

/**
 * Dependency tree node.
 */
export interface DependencyNode {
  /** Package name */
  name: string;
  
  /** Installed version */
  version: string;
  
  /** Dependency type */
  type: 'prod' | 'dev' | 'peer' | 'optional';
  
  /** Nested dependencies */
  dependencies: DependencyNode[];
  
  /** Size in bytes (if size plugin enabled) */
  size?: number;
}

/**
 * Dependency tree.
 */
export interface DependencyTree {
  /** Root package */
  root: DependencyNode;
  
  /** Total dependency count */
  count: number;
  
  /** Maximum depth */
  depth: number;
}

/**
 * Circular dependency chain.
 */
export type CircularChain = string[];

/**
 * Size analysis result.
 */
export interface SizeAnalysis {
  /** Total size in bytes */
  total: number;
  
  /** Human-readable total */
  totalFormatted: string;
  
  /** Per-package size breakdown */
  packages: PackageSize[];
}

/**
 * Per-package size.
 */
export interface PackageSize {
  /** Package name */
  name: string;
  
  /** Size in bytes */
  size: number;
  
  /** Human-readable size */
  sizeFormatted: string;
  
  /** Percentage of total */
  percentage: number;
}

/**
 * Update suggestion.
 */
export interface UpdateSuggestion {
  /** Package name */
  name: string;
  
  /** Current installed version */
  current: string;
  
  /** Latest available version */
  latest: string;
  
  /** Update type */
  type: 'major' | 'minor' | 'patch';
}

/**
 * Security audit result.
 */
export interface SecurityAudit {
  /** Total vulnerabilities */
  total: number;
  
  /** Vulnerabilities by severity */
  bySeverity: {
    critical: number;
    high: number;
    moderate: number;
    low: number;
  };
  
  /** Individual vulnerabilities */
  vulnerabilities: Vulnerability[];
}

/**
 * Individual vulnerability.
 */
export interface Vulnerability {
  /** Package name */
  package: string;
  
  /** Severity level */
  severity: 'critical' | 'high' | 'moderate' | 'low';
  
  /** Vulnerability title */
  title: string;
  
  /** CVE identifier if available */
  cve?: string;
  
  /** Affected version range */
  range: string;
  
  /** Fixed in version */
  fixedIn?: string;
}

/**
 * Plugin names.
 */
export type PluginName = 
  | 'tree' 
  | 'circular' 
  | 'unused' 
  | 'missing' 
  | 'duplicates' 
  | 'size' 
  | 'updates' 
  | 'security' 
  | 'monorepo';

/**
 * Event types.
 */
export interface AnalyzerEvents {
  progress: { plugin: string; percent: number; message?: string };
  finding: { type: string; severity: string; message: string; package?: string };
  error: Error;
  change: AnalysisResult;
}
```

### CLI Interface

```bash
# Dependency tree
npx @oxog/deps tree
npx @oxog/deps tree --depth=3
npx @oxog/deps tree --format=json
npx @oxog/deps tree --format=md
npx @oxog/deps tree --format=html

# Circular dependencies
npx @oxog/deps circular
npx @oxog/deps circular --fail-on-circular  # Exit 1 if found

# Unused dependencies
npx @oxog/deps unused
npx @oxog/deps unused --ignore="*.test.ts"

# Missing dependencies
npx @oxog/deps missing

# Duplicate versions
npx @oxog/deps duplicates
npx @oxog/deps duplicates --json

# Size analysis
npx @oxog/deps size
npx @oxog/deps size --limit=500kb  # Exit 1 if exceeded
npx @oxog/deps size --sort=size
npx @oxog/deps size --sort=name

# Update suggestions
npx @oxog/deps updates
npx @oxog/deps updates --major
npx @oxog/deps updates --minor
npx @oxog/deps updates --patch

# Security audit
npx @oxog/deps security
npx @oxog/deps security --fail-on-high
npx @oxog/deps security --fail-on-critical

# Full report
npx @oxog/deps report
npx @oxog/deps report --format=html > report.html
npx @oxog/deps report --format=md > DEPENDENCIES.md
npx @oxog/deps report --format=json > deps.json

# Watch mode
npx @oxog/deps watch

# Monorepo mode
npx @oxog/deps report --monorepo

# Global options
npx @oxog/deps <command> --cwd=/path/to/project
npx @oxog/deps <command> --no-cache
npx @oxog/deps <command> --verbose
npx @oxog/deps <command> --help
```

---

## TECHNICAL REQUIREMENTS

| Requirement | Value |
|-------------|-------|
| Runtime | Node.js only |
| Module Format | ESM + CJS (dual) |
| Node.js Version | >= 18 |
| TypeScript Version | >= 5.0 |
| Bundle Size (core) | < 5KB gzipped |
| Bundle Size (all plugins) | < 25KB gzipped |

---

## LLM-NATIVE REQUIREMENTS

### 1. llms.txt File

Create `/llms.txt` in project root (< 2000 tokens):

```markdown
# @oxog/deps

> Zero-dependency analyzer for Node.js projects with circular, unused, duplicate detection, security audit, and monorepo support

## Install

npm install @oxog/deps

## Quick Start

npx @oxog/deps report

## Basic Usage

import { deps } from '@oxog/deps';
const result = await deps.analyze('./package.json');
console.log(result.tree);     // Dependency tree
console.log(result.circular); // Circular deps

## API Summary

### Quick API
- `deps.analyze(path, options?)` - Analyze dependencies

### Advanced API
- `createAnalyzer(options)` - Create analyzer instance
- `analyzer.use(plugin)` - Register plugin
- `analyzer.on(event, handler)` - Add event listener
- `analyzer.run()` - Run analysis

### Core Plugins
- `tree` - Dependency tree visualization
- `circular` - Circular dependency detection

### Optional Plugins
- `unused` - Unused dependency detection
- `missing` - Missing dependency detection
- `duplicates` - Duplicate version detection
- `size` - Size impact analysis
- `updates` - Update suggestions
- `security` - npm audit wrapper
- `monorepo` - Workspace support

## CLI Commands

npx @oxog/deps tree [--depth=N] [--format=json|md|html]
npx @oxog/deps circular [--fail-on-circular]
npx @oxog/deps unused [--ignore=pattern]
npx @oxog/deps missing
npx @oxog/deps duplicates
npx @oxog/deps size [--limit=500kb]
npx @oxog/deps updates [--major|--minor|--patch]
npx @oxog/deps security [--fail-on-high]
npx @oxog/deps report [--format=json|md|html]
npx @oxog/deps watch

## Common Patterns

### CI Pipeline
npx @oxog/deps circular --fail-on-circular
npx @oxog/deps size --limit=500kb
npx @oxog/deps security --fail-on-high

### Monorepo Analysis
const analyzer = createAnalyzer({ monorepo: true });
const result = await analyzer.run();

### Custom Plugin
analyzer.use({
  name: 'custom',
  version: '1.0.0',
  install: (kernel) => {
    kernel.on('analyze', (ctx) => { /* ... */ });
  }
});

## Errors

| Code | Meaning | Solution |
|------|---------|----------|
| PACKAGE_NOT_FOUND | package.json not found | Check cwd path |
| INVALID_PACKAGE_JSON | Invalid JSON | Fix package.json syntax |
| NODE_MODULES_NOT_FOUND | node_modules missing | Run npm install |
| CIRCULAR_DETECTED | Circular deps found | Review circular chains |
| PLUGIN_NOT_FOUND | Unknown plugin name | Check plugin spelling |

## Links

- Docs: https://deps.oxog.dev
- GitHub: https://github.com/ersinkoc/deps
```

### 2. API Naming Standards

Use predictable patterns LLMs can infer:

```typescript
// ✅ GOOD - Predictable
deps.analyze()      // Main analysis function
createAnalyzer()    // Factory function
analyzer.use()      // Register plugin
analyzer.run()      // Execute analysis
analyzer.on()       // Event listener
result.toJSON()     // Convert to JSON
result.toTree()     // Convert to tree
result.toMarkdown() // Convert to Markdown
result.toHTML()     // Convert to HTML
result.toReport()   // Generate report

// ❌ BAD - Unpredictable
deps.exec()
deps.process()
analyzer.go()
result.fmt()
```

### 3. Example Organization

```
examples/
├── 01-basic/
│   ├── quick-analysis.ts
│   ├── tree-visualization.ts
│   └── circular-detection.ts
├── 02-plugins/
│   ├── using-core-plugins.ts
│   ├── using-optional-plugins.ts
│   └── custom-plugin.ts
├── 03-error-handling/
│   ├── graceful-errors.ts
│   └── error-recovery.ts
├── 04-typescript/
│   ├── typed-results.ts
│   └── generic-plugins.ts
├── 05-integrations/
│   ├── ci-pipeline.ts
│   ├── github-action.ts
│   └── pre-commit-hook.ts
├── 06-real-world/
│   ├── monorepo-analysis.ts
│   ├── security-workflow.ts
│   ├── size-budget-check.ts
│   ├── dependency-report.ts
│   └── watch-development.ts
```

### 4. Type Documentation

Every public API MUST have:

```typescript
/**
 * Analyze dependencies of a Node.js project.
 * 
 * Parses package.json, traverses node_modules, and runs enabled plugins
 * to detect issues like circular dependencies, unused packages, and more.
 * 
 * @param path - Path to package.json or directory containing it
 * @param options - Analysis options
 * @returns Analysis result with all findings
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const result = await deps.analyze('./package.json');
 * console.log(result.tree);
 * console.log(result.circular);
 * ```
 * 
 * @example
 * ```typescript
 * // Full analysis with all plugins
 * const result = await deps.analyze('./package.json', { full: true });
 * console.log(result.unused);
 * console.log(result.size);
 * ```
 * 
 * @example
 * ```typescript
 * // With options
 * const result = await deps.analyze('./', {
 *   plugins: ['tree', 'circular', 'size'],
 *   cache: true
 * });
 * ```
 * 
 * @throws {PackageNotFoundError} If package.json not found
 * @throws {InvalidPackageJsonError} If package.json is invalid
 */
export async function analyze(
  path: string,
  options?: AnalyzeOptions
): Promise<AnalysisResult>;
```

---

## MCP SERVER

Include an MCP server for AI assistant integration.

### MCP Tools

```typescript
// Tool: analyze_dependencies
{
  name: 'analyze_dependencies',
  description: 'Analyze dependencies of a Node.js project',
  parameters: {
    path: { type: 'string', description: 'Path to package.json or project directory' },
    plugins: { type: 'array', items: { type: 'string' }, description: 'Plugins to enable' }
  }
}

// Tool: get_circular_deps
{
  name: 'get_circular_deps',
  description: 'Get circular dependencies in a project',
  parameters: {
    path: { type: 'string', description: 'Path to package.json or project directory' }
  }
}

// Tool: get_unused_deps
{
  name: 'get_unused_deps',
  description: 'Get unused dependencies in a project',
  parameters: {
    path: { type: 'string', description: 'Path to package.json or project directory' }
  }
}

// Tool: check_size_budget
{
  name: 'check_size_budget',
  description: 'Check if dependencies exceed size budget',
  parameters: {
    path: { type: 'string', description: 'Path to package.json or project directory' },
    limit: { type: 'string', description: 'Size limit (e.g., "500kb")' }
  }
}

// Tool: security_audit
{
  name: 'security_audit',
  description: 'Run security audit on dependencies',
  parameters: {
    path: { type: 'string', description: 'Path to package.json or project directory' }
  }
}
```

### MCP Server Entry

```typescript
// src/mcp/index.ts
import { createMCPServer } from './server';

export { createMCPServer };

// CLI: npx @oxog/deps mcp
// Starts MCP server on stdio
```

---

## MONOREPO DETECTION

Auto-detect and support:

| Tool | Detection |
|------|-----------|
| pnpm workspaces | `pnpm-workspace.yaml` |
| npm workspaces | `package.json` → `workspaces` field |
| yarn workspaces | `package.json` → `workspaces` field |
| Lerna | `lerna.json` |
| Turborepo | `turbo.json` |
| Nx | `nx.json` |

---

## WEBSITE REQUIREMENTS

Documentation site at `deps.oxog.dev`:

### Technology Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Syntax Highlighting**: Prism React Renderer
- **Icons**: Lucide React

### Required Pages

1. **Home** - Hero, features, install, quick example
2. **Getting Started** - Installation, basic usage, CLI
3. **API Reference** - Complete documentation
4. **Plugins** - Core, optional, custom plugin guide
5. **CLI Reference** - All commands documented
6. **Examples** - Organized by category
7. **Playground** - Interactive analyzer (if feasible)

### IDE-Style Code Blocks

All code blocks MUST have:
- Line numbers (muted, non-selectable)
- Syntax highlighting
- Header bar with filename/language
- Copy button with "Copied!" feedback
- Rounded corners, subtle border
- Dark/light theme support

### Footer

- Package name: @oxog/deps
- MIT License
- © 2025 Ersin Koç
- GitHub link only

---

## GITHUB ACTIONS

Single workflow file: `.github/workflows/deploy.yml`

```yaml
name: Deploy Website

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Build package
        run: npm run build
      
      - name: Build website
        working-directory: ./website
        run: |
          npm ci
          npm run build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './website/dist'
  
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## CONFIG FILES

### package.json

```json
{
  "name": "@oxog/deps",
  "version": "1.0.0",
  "description": "Zero-dependency analyzer for Node.js projects with circular, unused, duplicate detection, security audit, and monorepo support",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "bin": {
    "deps": "./dist/cli.js"
  },
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    },
    "./plugins": {
      "import": {
        "types": "./dist/plugins/index.d.ts",
        "default": "./dist/plugins/index.js"
      },
      "require": {
        "types": "./dist/plugins/index.d.cts",
        "default": "./dist/plugins/index.cjs"
      }
    },
    "./mcp": {
      "import": {
        "types": "./dist/mcp/index.d.ts",
        "default": "./dist/mcp/index.js"
      },
      "require": {
        "types": "./dist/mcp/index.d.cts",
        "default": "./dist/mcp/index.cjs"
      }
    }
  },
  "files": ["dist"],
  "sideEffects": false,
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src/",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build && npm run test:coverage"
  },
  "keywords": [
    "dependency-analyzer",
    "dependency-tree",
    "circular-dependency",
    "unused-dependencies",
    "duplicate-dependencies",
    "bundle-size",
    "monorepo",
    "security-audit",
    "npm-audit",
    "package-analyzer",
    "dependency-graph",
    "dead-code"
  ],
  "author": "Ersin Koç",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ersinkoc/deps.git"
  },
  "bugs": {
    "url": "https://github.com/ersinkoc/deps/issues"
  },
  "homepage": "https://deps.oxog.dev",
  "engines": {
    "node": ">=18"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0",
    "vitest": "^2.0.0"
  }
}
```

### tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts', 
    'src/plugins/index.ts',
    'src/cli.ts',
    'src/mcp/index.ts'
  ],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  shims: true,
});
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'website/',
        'examples/',
        '*.config.*',
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
```

---

## PROJECT STRUCTURE

```
deps/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/
│   ├── index.ts              # Main entry: deps, createAnalyzer
│   ├── kernel.ts             # Micro kernel core
│   ├── types.ts              # All type definitions
│   ├── errors.ts             # Custom error classes
│   ├── cli.ts                # CLI entry point
│   ├── core/
│   │   ├── parser.ts         # package.json parser
│   │   ├── traverser.ts      # node_modules traverser
│   │   ├── cache.ts          # Cache management
│   │   ├── watcher.ts        # Watch mode
│   │   └── formats/          # Output formatters
│   │       ├── json.ts
│   │       ├── tree.ts
│   │       ├── markdown.ts
│   │       └── html.ts
│   ├── plugins/
│   │   ├── index.ts          # Plugin exports
│   │   ├── core/
│   │   │   ├── tree.ts
│   │   │   └── circular.ts
│   │   └── optional/
│   │       ├── unused.ts
│   │       ├── missing.ts
│   │       ├── duplicates.ts
│   │       ├── size.ts
│   │       ├── updates.ts
│   │       ├── security.ts
│   │       └── monorepo.ts
│   ├── mcp/
│   │   ├── index.ts          # MCP server entry
│   │   ├── server.ts         # MCP server implementation
│   │   └── tools.ts          # MCP tools definitions
│   └── utils/
│       ├── fs.ts             # File system utilities
│       ├── glob.ts           # Glob pattern matching
│       ├── size.ts           # Size formatting
│       └── semver.ts         # Semver comparison
├── tests/
│   ├── unit/
│   │   ├── kernel.test.ts
│   │   ├── parser.test.ts
│   │   ├── traverser.test.ts
│   │   └── plugins/
│   │       ├── tree.test.ts
│   │       ├── circular.test.ts
│   │       └── ...
│   ├── integration/
│   │   ├── analyze.test.ts
│   │   ├── cli.test.ts
│   │   └── monorepo.test.ts
│   └── fixtures/
│       ├── simple-project/
│       ├── circular-deps/
│       ├── monorepo-pnpm/
│       ├── monorepo-npm/
│       └── ...
├── examples/
│   ├── 01-basic/
│   ├── 02-plugins/
│   ├── 03-error-handling/
│   ├── 04-typescript/
│   ├── 05-integrations/
│   └── 06-real-world/
├── website/
│   ├── public/
│   │   ├── CNAME             # deps.oxog.dev
│   │   └── llms.txt
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── llms.txt
├── SPECIFICATION.md
├── IMPLEMENTATION.md
├── TASKS.md
├── README.md
├── CHANGELOG.md
├── LICENSE
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
└── .gitignore
```

---

## IMPLEMENTATION CHECKLIST

### Before Starting
- [ ] Create SPECIFICATION.md with complete spec
- [ ] Create IMPLEMENTATION.md with architecture
- [ ] Create TASKS.md with ordered task list
- [ ] All three documents reviewed and complete

### During Implementation
- [ ] Follow TASKS.md sequentially
- [ ] Write tests before or with each feature
- [ ] Maintain 100% coverage throughout
- [ ] JSDoc on every public API with @example
- [ ] Create examples as features are built

### Package Completion
- [ ] All tests passing (100%)
- [ ] Coverage at 100% (lines, branches, functions)
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] Package builds without errors
- [ ] CLI works correctly

### LLM-Native Completion
- [ ] llms.txt created (< 2000 tokens)
- [ ] llms.txt copied to website/public/
- [ ] README first 500 tokens optimized
- [ ] All public APIs have JSDoc + @example
- [ ] 15+ examples in organized folders
- [ ] package.json has 12 keywords
- [ ] API uses standard naming patterns
- [ ] MCP server implemented

### Website Completion
- [ ] All pages implemented
- [ ] IDE-style code blocks with line numbers
- [ ] Copy buttons working
- [ ] Dark/Light theme toggle
- [ ] CNAME file with deps.oxog.dev
- [ ] Mobile responsive
- [ ] Footer with Ersin Koç, MIT, GitHub only

### Final Verification
- [ ] `npm run build` succeeds
- [ ] `npm run test:coverage` shows 100%
- [ ] Website builds without errors
- [ ] All examples run successfully
- [ ] README is complete and accurate
- [ ] CLI help is comprehensive

---

## BEGIN IMPLEMENTATION

Start by creating **SPECIFICATION.md** with the complete package specification based on everything above.

Then create **IMPLEMENTATION.md** with architecture decisions.

Then create **TASKS.md** with ordered, numbered tasks.

Only after all three documents are complete, begin implementing code by following TASKS.md sequentially.

**Remember:**
- This package will be published to npm
- It must be production-ready
- Zero runtime dependencies
- 100% test coverage
- Professionally documented
- LLM-native design
- Beautiful documentation website
- MCP server for AI integration

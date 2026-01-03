# @oxog/deps - Implementation Plan

## Version: 1.0.0

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Micro-Kernel Design](#micro-kernel-design)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [Plugin Lifecycle](#plugin-lifecycle)
6. [Error Handling Strategy](#error-handling-strategy)
7. [Caching Strategy](#caching-strategy)
8. [Testing Strategy](#testing-strategy)
9. [Build & Bundle Strategy](#build--bundle-strategy)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Layer                           │
│  CLI Commands │ Programmatic API │ MCP Server               │
├─────────────────────────────────────────────────────────────┤
│                        API Layer                            │
│  deps.analyze() │ createAnalyzer() │ Result Formatters      │
├─────────────────────────────────────────────────────────────┤
│                     Plugin Registry                          │
│  use() │ register() │ unregister() │ list() │ resolve()     │
├────────┬────────┬─────────┬──────────┬──────────┬───────────┤
│  tree  │circular│ unused  │ missing  │duplicates│   size    │
│ (core) │ (core) │  (opt)  │  (opt)   │  (opt)   │   (opt)   │
├────────┴────────┼─────────┼──────────┼──────────┼───────────┤
│                 │ updates │ security │ monorepo │ community │
│                 │  (opt)  │  (opt)   │  (opt)   │  plugins  │
├─────────────────┴─────────┴──────────┴──────────┴───────────┤
│                    Micro Kernel Core                         │
│  PackageParser │ NodeModulesTraverser │ EventBus             │
│  CacheManager │ Watcher │ ConfigManager │ ProgressReporter  │
├─────────────────────────────────────────────────────────────┤
│                    Utility Layer                            │
│  fs │ glob │ semver │ size │ string │ http                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Micro-Kernel Design

### Kernel Responsibilities

The kernel is the minimal core that enables plugins to function. It handles:

1. **Configuration Management**
   - Parse and validate analyzer options
   - Merge defaults with user options
   - Provide readonly config access to plugins

2. **Package Parsing**
   - Read package.json
   - Validate JSON structure
   - Extract dependency lists (prod, dev, peer, optional)
   - Cache parsed package data

3. **node_modules Traversal**
   - Efficiently traverse node_modules directory
   - Build dependency graph
   - Resolve package versions
   - Handle nested dependencies

4. **Plugin Registry**
   - Register plugins with dependency resolution
   - Track plugin lifecycle
   - Resolve plugin load order
   - Prevent circular plugin dependencies

5. **Event Bus**
   - Emit progress events
   - Emit finding events
   - Emit error events
   - Enable plugin communication

6. **Cache Management**
   - Store analysis results
   - Validate cache freshness
   - Invalidate on change
   - Respect TTL

### Kernel Interface

```typescript
interface AnalyzerKernel<TContext = AnalyzerContext> {
  // Configuration
  readonly config: Readonly<AnalyzerConfig>;

  // Context object shared across plugins
  readonly context: TContext;

  // Plugin registry
  use<TPlugin extends AnalyzerPlugin>(
    plugin: TPlugin
  ): AnalyzerKernel<TContext>;

  // Event bus
  on<TEvent extends keyof AnalyzerEvents>(
    event: TEvent,
    handler: (data: AnalyzerEvents[TEvent]) => void
  ): void;

  emit<TEvent extends keyof AnalyzerEvents>(
    event: TEvent,
    data: AnalyzerEvents[TEvent]
  ): void;

  // Package access
  getPackage(path: string): Promise<PackageMetadata>;
  getDependencies(
    type?: 'prod' | 'dev' | 'peer' | 'optional'
  ): Promise<DependencyNode[]>;

  // Cache access
  getCache<T>(key: string): Promise<T | undefined>;
  setCache<T>(key: string, value: T, ttl?: number): Promise<void>;

  // Progress reporting
  reportProgress(
    plugin: string,
    percent: number,
    message?: string
  ): void;

  // Finding reporting
  reportFinding(
    type: string,
    severity: 'info' | 'warning' | 'error' | 'critical',
    message: string,
    pkg?: string
  ): void;
}
```

---

## Component Architecture

### 1. Package Parser

**File:** `src/core/parser.ts`

**Responsibilities:**
- Read package.json from filesystem
- Parse JSON with error handling
- Validate package structure
- Extract dependency metadata
- Cache parsed results

**API:**
```typescript
class PackageParser {
  async parse(path: string): Promise<PackageMetadata>;
  async validate(pkg: PackageMetadata): Promise<boolean>;
  getDependencies(
    pkg: PackageMetadata,
    type: DependencyType
  ): Record<string, string>;
}
```

**Implementation Details:**
- Use `fs.readFile` with UTF-8 encoding
- Wrap `JSON.parse` in try-catch for custom errors
- Validate required fields: name, version
- Normalize dependency ranges

---

### 2. Node Modules Traverser

**File:** `src/core/traverser.ts`

**Responsibilities:**
- Traverse node_modules directory
- Build dependency graph
- Resolve package versions
- Handle nested dependencies
- Detect circular references in graph

**API:**
```typescript
class NodeModulesTraverser {
  async traverse(
    rootPackage: PackageMetadata,
    options?: TraverseOptions
  ): Promise<DependencyTree>;

  async getDependencyGraph(
    rootPackage: PackageMetadata
  ): Promise<DependencyGraph>;

  resolvePackageVersion(
    name: string,
    range: string,
    parentPath: string
  ): Promise<string | null>;
}
```

**Implementation Details:**
- Use recursive directory traversal
- Read package/package.json for version info
- Build adjacency list for graph
- Use memoization to avoid re-traversal
- Respect node_modules resolution algorithm

---

### 3. Event Bus

**File:** `src/core/event-bus.ts`

**Responsibilities:**
- Register event listeners
- Emit events to listeners
- Support wildcard listeners
- Handle async event handlers
- Clean up listeners

**API:**
```typescript
class EventBus<TEvents extends Record<string, any>> {
  on<TEvent extends keyof TEvents>(
    event: TEvent,
    handler: (data: TEvents[TEvent]) => void | Promise<void>
  ): () => void;

  once<TEvent extends keyof TEvents>(
    event: TEvent,
    handler: (data: TEvents[TEvent]) => void | Promise<void>
  ): () => void;

  emit<TEvent extends keyof TEvents>(
    event: TEvent,
    data: TEvents[TEvent]
  ): Promise<void>;

  off<TEvent extends keyof TEvents>(
    event?: TEvent,
    handler?: (data: TEvents[TEvent]) => void
  ): void;
}
```

---

### 4. Cache Manager

**File:** `src/core/cache.ts`

**Responsibilities:**
- Store cached analysis results
- Validate cache freshness
- Invalidate on change
- Persist to filesystem

**API:**
```typescript
class CacheManager {
  async get<T>(key: string): Promise<T | null>;
  async set<T>(
    key: string,
    value: T,
    options?: CacheOptions
  ): Promise<void>;
  async invalidate(pattern?: string): Promise<void>;
  async clear(): Promise<void>;
  async has(key: string): Promise<boolean>;
}
```

**Implementation Details:**
- Store in `.deps-cache` file (JSON)
- Use file modification time for validation
- Support TTL with timestamps
- Atomic writes via temp file + rename

---

### 5. Watcher

**File:** `src/core/watcher.ts`

**Responsibilities:**
- Watch package.json for changes
- Watch node_modules for additions/removals
- Debounce rapid changes
- Emit change events

**API:**
```typescript
class DependencyWatcher {
  watch(
    paths: string[],
    onChange: (paths: string[]) => void
  ): () => void;

  async unwatch(): Promise<void>;
}
```

**Implementation Details:**
- Use `fs.watch` for native file watching
- Debounce with 300ms delay
- Filter out noise events
- Graceful error handling

---

### 6. Output Formatters

**Files:** `src/core/formats/*.ts`

**Responsibilities:**
- Convert analysis results to various formats
- Support JSON, ASCII tree, Markdown, HTML
- Handle full report generation

**API:**
```typescript
interface ResultFormatter {
  toJSON(result: AnalysisResult): string;
  toTree(result: AnalysisResult, options?: TreeOptions): string;
  toMarkdown(result: AnalysisResult): string;
  toHTML(result: AnalysisResult): string;
  toReport(result: AnalysisResult, format: OutputFormat): string;
}
```

---

## Data Flow

### Analysis Flow

```
1. User calls deps.analyze() or CLI command
   ↓
2. Create Analyzer instance with options
   ↓
3. Load plugins (core + optional)
   ↓
4. Parse package.json → PackageMetadata
   ↓
5. Traverse node_modules → DependencyTree
   ↓
6. Initialize plugins with context
   ↓
7. Run plugins in dependency order
   ├─ Tree Plugin → Build tree structure
   ├─ Circular Plugin → Detect cycles
   ├─ Unused Plugin → Scan source files
   ├─ Missing Plugin → Find missing deps
   ├─ Duplicates Plugin → Find version conflicts
   ├─ Size Plugin → Calculate sizes
   ├─ Updates Plugin → Check npm registry
   ├─ Security Plugin → Run npm audit
   └─ Monorepo Plugin → Analyze workspaces
   ↓
8. Collect results from all plugins
   ↓
9. Format output (JSON/tree/md/html)
   ↓
10. Return result or print to stdout
```

### Plugin Execution Flow

```
1. Resolve plugin dependencies (topological sort)
   ↓
2. For each plugin in order:
   a. Call plugin.install(kernel)
   b. Set up event listeners
   c. Emit 'progress' event
   ↓
3. After all installed:
   a. Call plugin.onInit(context) for each
   ↓
4. Run analysis:
   a. Each plugin analyzes
   b. Emit 'finding' events as needed
   c. Emit 'progress' events
   ↓
5. On completion:
   a. Collect results
   b. Call plugin.onDestroy() for cleanup
```

---

## Plugin Lifecycle

### 1. Registration

```typescript
analyzer.use(plugin);
```

**Steps:**
1. Validate plugin structure (name, version, install)
2. Check for duplicate plugin name
3. Resolve plugin dependencies
4. Add to registry

### 2. Installation

```typescript
await plugin.install(kernel);
```

**Steps:**
1. Call plugin's install method with kernel
2. Plugin registers event listeners
3. Plugin can access kernel services

### 3. Initialization

```typescript
await plugin.onInit?.(context);
```

**Steps:**
1. After all plugins installed
2. Called in dependency order
3. Shared context passed to all

### 4. Execution

During analysis, plugin:
1. Listens to 'analyze' event or
2. Calls kernel methods directly
3. Emits 'finding' events
4. Reports progress

### 5. Cleanup

```typescript
await plugin.onDestroy?.();
```

**Steps:**
1. Called on analyzer cleanup
2. Remove event listeners
3. Close file handles
4. Clear resources

---

## Error Handling Strategy

### Error Categories

1. **User Errors** (400-level)
   - Package not found
   - Invalid package.json
   - Invalid options

2. **System Errors** (500-level)
   - File system errors
   - Network errors (npm registry)
   - Out of memory

### Custom Error Classes

```typescript
// Base error
class DepsError extends Error {
  code: string;
  details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'DepsError';
    this.code = code;
    this.details = details;
  }
}

// Specific errors
class PackageNotFoundError extends DepsError {
  constructor(path: string) {
    super('PACKAGE_NOT_FOUND', `package.json not found at ${path}`);
  }
}

class InvalidPackageJsonError extends DepsError {
  constructor(path: string, parseError: SyntaxError) {
    super('INVALID_PACKAGE_JSON', `Invalid package.json at ${path}`, parseError);
  }
}

class NodeModulesNotFoundError extends DepsError {
  constructor(path: string) {
    super('NODE_MODULES_NOT_FOUND', `node_modules not found at ${path}`);
  }
}

class PluginNotFoundError extends DepsError {
  constructor(name: string) {
    super('PLUGIN_NOT_FOUND', `Plugin not found: ${name}`);
  }
}

class PluginDependencyError extends DepsError {
  constructor(
    plugin: string,
    missing: string[]
  ) {
    super('PLUGIN_DEPENDENCY_ERROR', `Plugin ${plugin} missing dependencies: ${missing.join(', ')}`);
  }
}

class CircularDependencyError extends DepsError {
  constructor(chains: string[][]) {
    super('CIRCULAR_DETECTED', `Circular dependencies detected`, chains);
  }
}
```

### Error Handling Flow

```
1. Try operation
   ↓
2. Catch error
   ↓
3. Wrap in DepsError if not already
   ↓
4. Call plugin.onError?.(error)
   ↓
5. Emit 'error' event
   ↓
6. Return graceful result or throw
```

### CLI Error Handling

- Print error message to stderr
- Use appropriate exit code (0 or 1)
- Show stack trace in verbose mode
- Provide helpful error messages

---

## Caching Strategy

### Cache Key Structure

```typescript
interface CacheKey {
  // Unique identifier for cache entry
  type: string;          // 'tree', 'circular', 'unused', etc.
  cwd: string;           // Working directory
  packageHash: string;   // Hash of package.json content
  optionsHash: string;   // Hash of analysis options
}
```

### Cache Entry Structure

```typescript
interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
  ttl?: number;
  metadata: {
    version: string;
    nodeModulesHash: string;
  };
}
```

### Cache Validation

1. **Timestamp Check**
   - Check if entry expired (TTL)
   - Default TTL: 1 hour

2. **Content Hash Check**
   - Compare package.json hash
   - Compare node_modules hash

3. **Version Check**
   - Invalidate on package version change

### Cache Storage

**File:** `.deps-cache` (in project root)

**Format:** JSON

```json
{
  "version": "1.0.0",
  "entries": [
    {
      "key": "tree:default",
      "value": { /* tree data */ },
      "timestamp": 1234567890,
      "ttl": 3600000,
      "metadata": {
        "version": "1.0.0",
        "nodeModulesHash": "abc123"
      }
    }
  ]
}
```

### Cache Invalidation

Invalidation triggers:
- package.json modified
- node_modules changed (file added/removed)
- TTL expired
- Manual `--no-cache` flag
- Package version changed

---

## Testing Strategy

### Test Structure

```
tests/
├── unit/                      # Unit tests for individual modules
│   ├── core/
│   │   ├── parser.test.ts
│   │   ├── traverser.test.ts
│   │   ├── cache.test.ts
│   │   ├── event-bus.test.ts
│   │   └── formats/
│   │       ├── json.test.ts
│   │       ├── tree.test.ts
│   │       ├── markdown.test.ts
│   │       └── html.test.ts
│   ├── plugins/
│   │   ├── core/
│   │   │   ├── tree.test.ts
│   │   │   └── circular.test.ts
│   │   └── optional/
│   │       ├── unused.test.ts
│   │       ├── missing.test.ts
│   │       ├── duplicates.test.ts
│   │       ├── size.test.ts
│   │       ├── updates.test.ts
│   │       ├── security.test.ts
│   │       └── monorepo.test.ts
│   ├── utils/
│   │   ├── fs.test.ts
│   │   ├── glob.test.ts
│   │   ├── size.test.ts
│   │   └── semver.test.ts
│   └── index.test.ts          # Main API tests
├── integration/               # Integration tests
│   ├── analyze.test.ts        # Full analysis flow
│   ├── cli.test.ts            # CLI integration
│   └── monorepo.test.ts       # Monorepo scenarios
└── fixtures/                  # Test fixtures
    ├── simple-project/
    ├── circular-deps/
    ├── unused-deps/
    ├── monorepo-pnpm/
    ├── monorepo-npm/
    └── ...
```

### Coverage Requirements

```typescript
// vitest.config.ts
{
  coverage: {
    thresholds: {
      lines: 100,
      functions: 100,
      branches: 100,
      statements: 100
    }
  }
}
```

### Test Utilities

```typescript
// tests/utils/fixtures.ts
export async function createFixture(
  name: string,
  structure: Record<string, string | Buffer>
): Promise<string>;

export async function cleanupFixture(path: string): Promise<void>;

export async function withFixture<T>(
  name: string,
  structure: Record<string, string | Buffer>,
  fn: (path: string) => Promise<T>
): Promise<T>;
```

### Test Categories

1. **Unit Tests**
   - Test individual functions in isolation
   - Mock external dependencies (fs, http)
   - Fast execution

2. **Integration Tests**
   - Test multiple components together
   - Use real file system fixtures
   - Test end-to-end flows

3. **CLI Tests**
   - Test CLI commands
   - Parse stdout/stderr
   - Verify exit codes

---

## Build & Bundle Strategy

### Build Tool: tsup

**Configuration:** `tsup.config.ts`

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  // Multiple entry points
  entry: [
    'src/index.ts',      // Main package
    'src/plugins/index.ts',  // Plugins export
    'src/cli.ts',        // CLI
    'src/mcp/index.ts'   // MCP server
  ],

  // Dual format output
  format: ['cjs', 'esm'],

  // Type definitions
  dts: true,

  // No code splitting (keep simple)
  splitting: false,

  // Source maps for debugging
  sourcemap: true,

  // Clean dist before build
  clean: true,

  // Tree shake unused code
  treeshake: true,

  // Don't minify (readable errors)
  minify: false,

  // Use true ESM for dynamic imports
  shims: true,
});
```

### Output Structure

```
dist/
├── index.js              # ESM main
├── index.cjs             # CJS main
├── index.d.ts            # ESM types
├── index.d.cts           # CJS types
├── plugins/
│   ├── index.js
│   ├── index.cjs
│   ├── index.d.ts
│   └── index.d.cts
├── cli.js                # ESM CLI
├── cli.cjs               # CJS CLI
├── cli.d.ts              # CLI types
├── cli.d.cts
├── mcp/
│   ├── index.js
│   ├── index.cjs
│   ├── index.d.ts
│   └── index.d.cts
└── *.map                 # Source maps
```

### package.json Exports

```json
{
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
  }
}
```

---

## Implementation Phases

### Phase 1: Foundation
- Type definitions
- Error classes
- Event bus
- Cache manager

### Phase 2: Core Components
- Package parser
- Node modules traverser
- Output formatters

### Phase 3: Core Plugins
- Tree plugin
- Circular plugin

### Phase 4: Optional Plugins
- Unused plugin
- Missing plugin
- Duplicates plugin
- Size plugin
- Updates plugin
- Security plugin
- Monorepo plugin

### Phase 5: CLI
- Command parser
- Each command implementation
- Help system

### Phase 6: MCP Server
- Server implementation
- Tool definitions

### Phase 7: Testing
- Unit tests for all modules
- Integration tests
- Coverage verification

### Phase 8: LLM-Native
- llms.txt
- JSDoc documentation
- Examples

### Phase 9: Website
- Documentation site
- Deployment

---

## File Organization Principles

1. **Separation of Concerns**
   - Core/Kernel separate from plugins
   - Utilities separate from business logic

2. **Clear Dependencies**
   - No circular imports
   - Depend on abstractions (interfaces)

3. **Testability**
   - Every module independently testable
   - Dependency injection for external deps

4. **Scalability**
   - Easy to add new plugins
   - Clear extension points

---

## Performance Considerations

1. **Lazy Loading**
   - Load plugins only when needed
   - Lazy traverse node_modules

2. **Memoization**
   - Cache parsed package.json
   - Cache dependency graphs

3. **Parallel Processing**
   - Run independent plugins in parallel
   - Parallel file scanning

4. **Streaming**
   - Stream large outputs
   - Don't hold full results in memory

---

## Security Considerations

1. **Input Validation**
   - Validate all file paths
   - Validate package.json content

2. **Command Injection Prevention**
   - Don't use shell.exec
   - Use child_process.spawn with sanitized args

3. **Dependency Confusion**
   - Only install from npm registry
   - Verify package integrity

4. **Safe Defaults**
   - Respect .gitignore
   - Don't scan node_modules by default

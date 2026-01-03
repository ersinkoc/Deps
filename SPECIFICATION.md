# @oxog/deps - Package Specification

## Version: 1.0.0

## Table of Contents

1. [Overview](#overview)
2. [Package Identity](#package-identity)
3. [Core Features](#core-features)
4. [Plugin System](#plugin-system)
5. [API Design](#api-design)
6. [CLI Interface](#cli-interface)
7. [Technical Requirements](#technical-requirements)
8. [LLM-Native Requirements](#llm-native-requirements)

---

## Overview

@oxog/deps is a zero-dependency analyzer for Node.js projects that provides comprehensive dependency analysis capabilities through a micro-kernel plugin architecture.

### Problem Statement

Modern Node.js projects accumulate dependencies over time, leading to:
- Circular dependencies causing runtime issues
- Unused dependencies bloating node_modules
- Duplicate versions wasting disk space
- Security vulnerabilities in transitive deps
- Unclear dependency impact on bundle size

### Solution

A lightweight, zero-dependency toolkit that:
- Analyzes dependency trees with configurable depth
- Detects circular, unused, missing, and duplicate dependencies
- Provides size impact analysis
- Integrates with npm audit for security
- Supports monorepo workflows
- Offers both CLI and programmatic APIs

### Key Differentiators

1. **Zero Runtime Dependencies** - Every feature implemented from scratch
2. **Plugin Architecture** - Extensible micro-kernel design
3. **LLM-Native** - Optimized for AI assistant consumption
4. **Full Monorepo Support** - Works with pnpm/npm/yarn/lerna/turbo/nx
5. **Production Ready** - 100% test coverage, TypeScript strict mode

---

## Package Identity

| Field | Value |
|-------|-------|
| **NPM Package** | `@oxog/deps` |
| **GitHub Repository** | `https://github.com/ersinkoc/deps` |
| **Documentation Site** | `https://deps.oxog.dev` |
| **License** | MIT |
| **Author** | Ersin Koç (ersinkoc) |
| **Node.js Version** | >= 18 |
| **TypeScript Version** | >= 5.0 |

### Allowed Links

- ✅ GitHub repository URL
- ✅ Custom domain (deps.oxog.dev)
- ✅ npm package URL

### Prohibited Links

- ❌ Social media (Twitter, LinkedIn, etc.)
- ❌ Discord/Slack links
- ❌ Email addresses
- ❌ Donation/sponsor links

---

## Core Features

### 1. Dependency Tree Visualization

**Description:** Build and display the complete dependency tree with configurable depth.

**API:**
```typescript
const result = await deps.analyze('./package.json');
console.log(result.tree);
// Output: DependencyTree with hierarchical structure
```

**CLI:**
```bash
npx @oxog/deps tree --depth=3 --format=json
```

**Plugin:** `tree` (core, always loaded)

---

### 2. Circular Dependency Detection

**Description:** Detect circular dependencies using Tarjan's strongly connected components algorithm.

**API:**
```typescript
const result = await deps.analyze('./package.json');
console.log(result.circular);
// Output: [['a', 'b', 'c', 'a'], ['x', 'y', 'x']]
```

**CLI:**
```bash
npx @oxog/deps circular --fail-on-circular
```

**Plugin:** `circular` (core, always loaded)

---

### 3. Unused Dependency Detection

**Description:** Find dependencies listed in package.json but not imported in codebase.

**API:**
```typescript
const result = await deps.analyze('./package.json', { full: true });
console.log(result.unused);
// Output: ['lodash', 'moment', 'underscore']
```

**CLI:**
```bash
npx @oxog/deps unused --ignore="*.test.ts"
```

**Plugin:** `unused` (optional)

**Detection Method:**
1. Scan all source files (respecting ignore patterns)
2. Parse import/export statements
3. Cross-reference with package.json dependencies
4. Report packages never imported

---

### 4. Missing Dependency Detection

**Description:** Find imports that reference packages not in package.json.

**API:**
```typescript
const result = await deps.analyze('./package.json', { full: true });
console.log(result.missing);
// Output: ['missing-peer-dep', 'forgotten-package']
```

**CLI:**
```bash
npx @oxog/deps missing
```

**Plugin:** `missing` (optional)

---

### 5. Duplicate Version Detection

**Description:** Find packages with multiple installed versions.

**API:**
```typescript
const result = await deps.analyze('./package.json', { full: true });
console.log(result.duplicates);
// Output: { 'lodash': ['4.17.0', '4.17.21'], 'chalk': ['4.0.0', '5.0.0'] }
```

**CLI:**
```bash
npx @oxog/deps duplicates --json
```

**Plugin:** `duplicates` (optional)

**Detection Method:**
1. Traverse node_modules
2. Collect all package versions
3. Report packages with >1 version

---

### 6. Size Impact Analysis

**Description:** Analyze the size impact of each dependency on final bundle.

**API:**
```typescript
const result = await deps.analyze('./package.json', { full: true });
console.log(result.size);
// Output: { total: 2500000, totalFormatted: '2.38 MB', packages: [...] }
```

**CLI:**
```bash
npx @oxog/deps size --limit=500kb --sort=size
```

**Plugin:** `size` (optional)

**Size Calculation:**
- Calculate disk size of package directory
- Include nested dependencies
- Format human-readable (KB, MB, GB)

---

### 7. Update Suggestions

**Description:** Check npm registry for available updates.

**API:**
```typescript
const result = await deps.analyze('./package.json', { full: true });
console.log(result.updates);
// Output: [{ name: 'lodash', current: '4.17.0', latest: '4.17.21', type: 'patch' }]
```

**CLI:**
```bash
npx @oxog/deps updates --major
npx @oxog/deps updates --minor
npx @oxog/deps updates --patch
```

**Plugin:** `updates` (optional)

**Implementation:**
- Query npm registry via HTTPS
- Compare semver versions
- Categorize: major, minor, patch

---

### 8. Security Audit Integration

**Description:** Wrapper around npm audit for vulnerability detection.

**API:**
```typescript
const result = await deps.analyze('./package.json', { full: true });
console.log(result.security);
// Output: { total: 3, bySeverity: { critical: 1, high: 1, ... }, vulnerabilities: [...] }
```

**CLI:**
```bash
npx @oxog/deps security --fail-on-high
```

**Plugin:** `security` (optional)

**Implementation:**
- Execute `npm audit --json`
- Parse and normalize results
- Support CI exit codes

---

### 9. Monorepo Support

**Description:** Full support for all major monorepo tools.

**Supported Tools:**
- pnpm workspaces (pnpm-workspace.yaml)
- npm workspaces (package.json workspaces field)
- yarn workspaces (package.json workspaces field)
- Lerna (lerna.json)
- Turborepo (turbo.json)
- Nx (nx.json)

**API:**
```typescript
const analyzer = createAnalyzer({ monorepo: true });
const result = await analyzer.run();
```

**CLI:**
```bash
npx @oxog/deps report --monorepo
```

**Plugin:** `monorepo` (optional)

---

### 10. Watch Mode

**Description:** Automatically re-analyze when dependencies change.

**API:**
```typescript
const analyzer = createAnalyzer({ watch: true });
analyzer.on('change', (result) => {
  console.log('Dependencies changed:', result);
});
await analyzer.start();
```

**CLI:**
```bash
npx @oxog/deps watch
```

**Implementation:**
- Watch package.json for changes
- Watch node_modules for additions/removals
- Debounce rapid changes

---

### 11. Caching

**Description:** Cache analysis results for faster subsequent runs.

**API:**
```typescript
const analyzer = createAnalyzer({
  cache: true,
  cacheTTL: 3600000  // 1 hour
});
```

**Implementation:**
- Store cache in `.deps-cache` file
- Invalidate on node_modules change
- Respect TTL

---

### 12. Multiple Output Formats

**Description:** Support JSON, ASCII tree, Markdown, and HTML.

**API:**
```typescript
const result = await deps.analyze('./package.json');
result.toJSON();      // JSON string
result.toTree();      // ASCII tree
result.toMarkdown();  // Markdown
result.toHTML();      // HTML
result.toReport('html');  // Full report
```

**CLI:**
```bash
npx @oxog/deps tree --format=json
npx @oxog/deps tree --format=md
npx @oxog/deps tree --format=html
```

---

### 13. Full Report Generation

**Description:** Generate comprehensive report combining all analyses.

**API:**
```typescript
const result = await deps.analyze('./package.json', { full: true });
const report = result.toReport('html');
```

**CLI:**
```bash
npx @oxog/deps report --format=html > report.html
```

---

### 14. CI/CD Integration

**Description:** Exit codes for CI pipeline integration.

**API:**
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
```

**CLI:**
```bash
npx @oxog/deps circular --fail-on-circular
npx @oxog/deps size --limit=500kb
npx @oxog/deps security --fail-on-high
```

---

### 15. Event-Based Progress

**Description:** Real-time progress events for long-running analyses.

**API:**
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

## Plugin System

### Plugin Interface

```typescript
interface AnalyzerPlugin<TContext = AnalyzerContext> {
  /** Unique plugin identifier (kebab-case) */
  name: string;

  /** Semantic version (e.g., "1.0.0") */
  version: string;

  /** Other plugins this plugin depends on */
  dependencies?: string[];

  /** Called when plugin is registered */
  install: (kernel: AnalyzerKernel<TContext>) => void;

  /** Called after all plugins are installed */
  onInit?: (context: TContext) => void | Promise<void>;

  /** Called when plugin is unregistered */
  onDestroy?: () => void | Promise<void>;

  /** Called on error in this plugin */
  onError?: (error: Error) => void;
}
```

### Core Plugins (Always Loaded)

| Plugin | Description | Status |
|--------|-------------|--------|
| `tree` | Dependency tree visualization | Required |
| `circular` | Circular dependency detection | Required |

### Optional Plugins (Opt-in)

| Plugin | Description | Enable Method |
|--------|-------------|---------------|
| `unused` | Detect unused dependencies | `analyzer.use(unusedPlugin)` |
| `missing` | Detect missing dependencies | `analyzer.use(missingPlugin)` |
| `duplicates` | Find duplicate versions | `analyzer.use(duplicatesPlugin)` |
| `size` | Analyze size impact | `analyzer.use(sizePlugin)` |
| `updates` | Check for updates | `analyzer.use(updatesPlugin)` |
| `security` | npm audit wrapper | `analyzer.use(securityPlugin)` |
| `monorepo` | Workspace support | `analyzer.use(monorepoPlugin)` |

---

## API Design

### Main Export

```typescript
import { deps, createAnalyzer } from '@oxog/deps';

// Quick API
const result = await deps.analyze('./package.json');

// Advanced API
const analyzer = createAnalyzer({
  cwd: './my-project',
  plugins: ['tree', 'circular', 'unused', 'size'],
  cache: true,
  cacheTTL: 3600000,
  ignore: ['**/node_modules/**', '**/dist/**'],
  monorepo: false
});

analyzer.use(myCustomPlugin);
const result = await analyzer.run();
```

### Type Definitions

```typescript
interface AnalyzerOptions {
  cwd?: string;
  plugins?: PluginName[];
  cache?: boolean;
  cacheTTL?: number;
  ignore?: string[];
  monorepo?: boolean;
  watch?: boolean;
  failOn?: FailOnOptions;
}

interface AnalysisResult {
  tree: DependencyTree;
  circular: CircularChain[];
  unused?: string[];
  missing?: string[];
  duplicates?: Record<string, string[]>;
  size?: SizeAnalysis;
  updates?: UpdateSuggestion[];
  security?: SecurityAudit;
  exitCode: number;
  toJSON(): string;
  toTree(): string;
  toMarkdown(): string;
  toHTML(): string;
  toReport(format: 'json' | 'md' | 'html'): string;
}

interface DependencyNode {
  name: string;
  version: string;
  type: 'prod' | 'dev' | 'peer' | 'optional';
  dependencies: DependencyNode[];
  size?: number;
}

interface DependencyTree {
  root: DependencyNode;
  count: number;
  depth: number;
}
```

---

## CLI Interface

### Commands

```bash
# Dependency tree
npx @oxog/deps tree [--depth=N] [--format=json|md|html]

# Circular dependencies
npx @oxog/deps circular [--fail-on-circular]

# Unused dependencies
npx @oxog/deps unused [--ignore=pattern]

# Missing dependencies
npx @oxog/deps missing

# Duplicate versions
npx @oxog/deps duplicates [--json]

# Size analysis
npx @oxog/deps size [--limit=500kb] [--sort=size|name]

# Update suggestions
npx @oxog/deps updates [--major|--minor|--patch]

# Security audit
npx @oxog/deps security [--fail-on-high] [--fail-on-critical]

# Full report
npx @oxog/deps report [--format=json|md|html] [--monorepo]

# Watch mode
npx @oxog/deps watch

# MCP server
npx @oxog/deps mcp

# Global options
npx @oxog/deps <command> --cwd=/path/to/project
npx @oxog/deps <command> --no-cache
npx @oxog/deps <command> --verbose
npx @oxog/deps <command> --help
```

---

## Technical Requirements

| Requirement | Value |
|-------------|-------|
| Runtime | Node.js only |
| Module Format | ESM + CJS (dual) |
| Node.js Version | >= 18 |
| TypeScript Version | >= 5.0 |
| Bundle Size (core) | < 5KB gzipped |
| Bundle Size (all plugins) | < 25KB gzipped |
| Runtime Dependencies | **ZERO** |
| Test Coverage | **100%** |
| TypeScript Strict Mode | **Yes** |

---

## LLM-Native Requirements

### 1. llms.txt File

Location: `/llms.txt` and `/website/public/llms.txt`
Size: < 2000 tokens

Content:
- Package description (one-line)
- Install command
- Quick start
- API summary
- CLI commands
- Common patterns
- Error reference
- Links to docs and GitHub

### 2. API Naming Standards

Predictable patterns LLMs can infer:
- `deps.analyze()` - Main analysis
- `createAnalyzer()` - Factory function
- `analyzer.use()` - Register plugin
- `analyzer.run()` - Execute analysis
- `analyzer.on()` - Event listener
- `result.toJSON()` - Convert to JSON
- `result.toTree()` - Convert to tree
- `result.toMarkdown()` - Convert to Markdown
- `result.toHTML()` - Convert to HTML
- `result.toReport()` - Generate report

### 3. Example Organization

15+ examples in organized folders:
- 01-basic - Quick analysis, tree, circular
- 02-plugins - Core plugins, optional plugins, custom
- 03-error-handling - Graceful errors, recovery
- 04-typescript - Typed results, generic plugins
- 05-integrations - CI pipeline, GitHub Action, pre-commit
- 06-real-world - Monorepo, security, size budget, watch

### 4. Type Documentation

Every public API MUST have:
- Rich JSDoc with description
- @param tags with descriptions
- @returns tag with description
- @example tags showing usage
- @throws tags for error conditions

### 5. README Optimization

First 500 tokens optimized for LLM consumption:
- Clear package description
- Install command
- Quick start example
- Main API overview
- Core CLI commands

---

## MCP Server

### Tools

1. `analyze_dependencies` - Full dependency analysis
2. `get_circular_deps` - Get circular dependencies
3. `get_unused_deps` - Get unused dependencies
4. `check_size_budget` - Check size against budget
5. `security_audit` - Run security audit

### Implementation

- Entry: `src/mcp/index.ts`
- Server: `src/mcp/server.ts`
- Tools: `src/mcp/tools.ts`
- CLI: `npx @oxog/deps mcp`

---

## Non-Negotiable Rules

### 1. ZERO Runtime Dependencies

```json
{
  "dependencies": {}  // MUST BE EMPTY
}
```

### 2. 100% Test Coverage

- Every line tested
- Every branch tested
- Every function tested
- All tests pass (100% success)

### 3. MICRO-Kernel Architecture

Plugin-based architecture with minimal kernel:
- Package.json parsing
- node_modules traversal
- Plugin registration
- Event bus
- Cache management

### 4. Development Workflow

1. Create SPECIFICATION.md
2. Create IMPLEMENTATION.md
3. Create TASKS.md
4. Implement following TASKS.md sequentially

### 5. TypeScript Strict Mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

### 6. LLM-Native Design

- llms.txt file
- Predictable API naming
- Rich JSDoc with @example
- 15+ examples
- README optimized for LLM

### 7. NO External Links

- ✅ GitHub, custom domain, npm URL
- ❌ Social media, Discord, email, donation links

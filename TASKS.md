# @oxog/deps - Implementation Tasks

## Version: 1.0.0

## Task Execution Order

Follow these tasks sequentially. Each task should be completed (including tests) before moving to the next.

---

## Phase 1: Project Setup

### Task 1.1: Initialize Project Structure

- [ ] Create directory structure
  ```
  deps/
  ├── src/
  │   ├── core/
  │   ├── plugins/
  │   ├── mcp/
  │   └── utils/
  ├── tests/
  │   ├── unit/
  │   ├── integration/
  │   └── fixtures/
  ├── examples/
  └── website/
  ```
- [ ] Create all config files (package.json, tsconfig.json, tsup.config.ts, vitest.config.ts)
- [ ] Create .gitignore
- [ ] Create LICENSE (MIT)
- [ ] Create initial README.md

**Output:** Complete project structure with config files

---

### Task 1.2: Create Type Definitions

**File:** `src/types.ts`

- [ ] Define `PackageMetadata` interface
- [ ] Define `DependencyNode` interface
- [ ] Define `DependencyTree` interface
- [ ] Define `DependencyGraph` interface
- [ ] Define `AnalyzerOptions` interface
- [ ] Define `AnalyzerConfig` interface
- [ ] Define `AnalysisResult` interface
- [ ] Define `AnalyzerContext` interface
- [ ] Define `AnalyzerKernel` interface
- [ ] Define `AnalyzerPlugin` interface
- [ ] Define `AnalyzerEvents` interface
- [ ] Define `FailOnOptions` interface
- [ ] Define all result type interfaces
- [ ] Define `CircularChain` type
- [ ] Define `PluginName` type
- [ ] Define `DependencyType` type
- [ ] Define `OutputFormat` type
- [ ] Define `TraverseOptions` interface
- [ ] Define `CacheOptions` interface

**Test:** `tests/unit/types.test.ts`
- [ ] Verify all types are valid TypeScript
- [ ] Test type guards if any

---

### Task 1.3: Create Error Classes

**File:** `src/errors.ts`

- [ ] Create base `DepsError` class
- [ ] Create `PackageNotFoundError` class
- [ ] Create `InvalidPackageJsonError` class
- [ ] Create `NodeModulesNotFoundError` class
- [ ] Create `PluginNotFoundError` class
- [ ] Create `PluginDependencyError` class
- [ ] Create `CircularDependencyError` class
- [ ] Create `CacheError` class
- [ ] Create `NetworkError` class (for npm registry)

**Test:** `tests/unit/errors.test.ts`
- [ ] Test each error class constructor
- [ ] Test error code property
- [ ] Test error details property
- [ ] Test error instanceof checks

---

## Phase 2: Utility Functions

### Task 2.1: Implement File System Utilities

**File:** `src/utils/fs.ts`

- [ ] Implement `readFile()` - read file with encoding
- [ ] Implement `readFileSafe()` - read file, return undefined on error
- [ ] Implement `readJson()` - read and parse JSON file
- [ ] Implement `writeFile()` - write file with atomic operation
- [ ] Implement `writeJson()` - write JSON file
- [ ] Implement `fileExists()` - check if file exists
- [ ] Implement `directoryExists()` - check if directory exists
- [ ] Implement `listFiles()` - list files in directory
- [ ] Implement `listDirectories()` - list subdirectories
- [ ] Implement `getFileHash()` - calculate hash of file content
- [ ] Implement `getDirectoryHash()` - calculate hash of directory

**Test:** `tests/unit/utils/fs.test.ts`
- [ ] Test readFile with valid file
- [ ] Test readFile with non-existent file
- [ ] Test readJson with valid JSON
- [ ] Test readJson with invalid JSON
- [ ] Test writeFile creates new file
- [ ] Test writeFile overwrites existing file
- [ ] Test fileExists
- [ ] Test directoryExists
- [ ] Test listFiles
- [ ] Test getFileHash
- [ ] Test getDirectoryHash

---

### Task 2.2: Implement Glob Pattern Matching

**File:** `src/utils/glob.ts`

- [ ] Implement `glob()` - match files against pattern
- [ ] Implement `globSync()` - synchronous glob
- [ ] Implement `isMatch()` - check if path matches pattern
- [ ] Support `*` wildcard (any characters)
- [ ] Support `**` wildcard (any directories)
- [ ] Support `?` wildcard (single character)
- [ ] Implement `ignore()` - filter paths by ignore patterns

**Test:** `tests/unit/utils/glob.test.ts`
- [ ] Test * wildcard
- [ ] Test ** wildcard
- [ ] Test ? wildcard
- [ ] Test complex patterns
- [ ] Test ignore patterns
- [ ] Test with multiple patterns

---

### Task 2.3: Implement Size Formatting

**File:** `src/utils/size.ts`

- [ ] Implement `formatBytes()` - convert bytes to human-readable
- [ ] Implement `parseSize()` - parse size string to bytes
- [ ] Support B, KB, MB, GB, TB units
- [ ] Implement `getDirectorySize()` - calculate directory size
- [ ] Implement `getFileSize()` - get file size

**Test:** `tests/unit/utils/size.test.ts`
- [ ] Test formatBytes with various sizes
- [ ] Test parseSize with valid inputs
- [ ] Test parseSize with invalid inputs
- [ ] Test getDirectorySize
- [ ] Test getFileSize

---

### Task 2.4: Implement Semver Utilities

**File:** `src/utils/semver.ts`

- [ ] Implement `parseSemver()` - parse semver string
- [ ] Implement `compareSemver()` - compare two versions
- [ ] Implement `satisfies()` - check if version satisfies range
- [ ] Implement `getUpdateType()` - determine major/minor/patch
- [ ] Implement `maxSatisfying()` - find max version satisfying range
- [ ] Implement valid ranges: `^`, `~`, `*`, `>=`, `<=`, `>`, `<`, `x`

**Test:** `tests/unit/utils/semver.test.ts`
- [ ] Test parseSemver with valid versions
- [ ] Test parseSemver with invalid versions
- [ ] Test compareSemver equality
- [ ] Test compareSemver greater than
- [ ] Test compareSemver less than
- [ ] Test satisfies with ^ range
- [ ] Test satisfies with ~ range
- [ ] Test satisfies with * range
- [ ] Test getUpdateType
- [ ] Test maxSatisfying

---

### Task 2.5: Implement String Utilities

**File:** `src/utils/string.ts`

- [ ] Implement `indent()` - indent multi-line string
- [ ] Implement `truncate()` - truncate string with ellipsis
- [ ] Implement `escapeHtml()` - escape HTML entities
- [ ] Implement `stripAnsi()` - strip ANSI codes
- [ ] Implement `wordWrap()` - wrap text to width

**Test:** `tests/unit/utils/string.test.ts`
- [ ] Test indent
- [ ] Test truncate
- [ ] Test escapeHtml
- [ ] Test stripAnsi
- [ ] Test wordWrap

---

## Phase 3: Core Components

### Task 3.1: Implement Event Bus

**File:** `src/core/event-bus.ts`

- [ ] Implement `EventBus` class
- [ ] Implement `on()` method
- [ ] Implement `once()` method
- [ ] Implement `emit()` method with async support
- [ ] Implement `off()` method
- [ ] Implement error handling for listeners
- [ ] Implement listener cleanup

**Test:** `tests/unit/core/event-bus.test.ts`
- [ ] Test on/emit basic functionality
- [ ] Test once auto-removal
- [ ] Test multiple listeners
- [ ] Test emit order
- [ ] Test off removes listeners
- [ ] Test error handling in listeners
- [ ] Test async event handlers

---

### Task 3.2: Implement Cache Manager

**File:** `src/core/cache.ts`

- [ ] Implement `CacheManager` class
- [ ] Implement `get()` method
- [ ] Implement `set()` method with TTL
- [ ] Implement `has()` method
- [ ] Implement `invalidate()` method
- [ ] Implement `clear()` method
- [ ] Implement cache file persistence (.deps-cache)
- [ ] Implement cache validation (timestamp check)
- [ ] Implement atomic writes

**Test:** `tests/unit/core/cache.test.ts`
- [ ] Test set/get operations
- [ ] Test TTL expiration
- [ ] Test has method
- [ ] Test invalidate
- [ ] Test clear
- [ ] Test cache persistence
- [ ] Test cache loading
- [ ] Test concurrent operations

---

### Task 3.3: Implement Package Parser

**File:** `src/core/parser.ts`

- [ ] Implement `PackageParser` class
- [ ] Implement `parse()` method - read and parse package.json
- [ ] Implement `validate()` method - validate package structure
- [ ] Implement `getDependencies()` method - extract deps by type
- [ ] Handle all dependency types: prod, dev, peer, optional
- [ ] Extract metadata: name, version, description, etc.
- [ ] Normalize dependency ranges
- [ ] Cache parsed results

**Test:** `tests/unit/core/parser.test.ts`
- [ ] Test parse with valid package.json
- [ ] Test parse with invalid JSON
- [ ] Test parse with missing file
- [ ] Test validate with valid package
- [ ] Test validate with missing required fields
- [ ] Test getDependencies for prod
- [ ] Test getDependencies for dev
- [ ] Test getDependencies for peer
- [ ] Test getDependencies for optional
- [ ] Test all dependencies
- [ ] Test caching

---

### Task 3.4: Implement Node Modules Traverser

**File:** `src/core/traverser.ts`

- [ ] Implement `NodeModulesTraverser` class
- [ ] Implement `traverse()` method - build dependency tree
- [ ] Implement `getDependencyGraph()` method
- [ ] Implement `resolvePackageVersion()` method
- [ ] Handle nested dependencies
- [ ] Detect circular references in graph
- [ ] Memoize visited packages
- [ ] Handle missing node_modules

**Test:** `tests/unit/core/traverser.test.ts`
- [ ] Test traverse with simple project
- [ ] Test traverse with nested deps
- [ ] Test getDependencyGraph
- [ ] Test resolvePackageVersion
- [ ] Test memoization
- [ ] Test missing node_modules
- [ ] Test circular reference detection
- [ ] Test with various dependency types

---

### Task 3.5: Implement Output Formatters

#### Task 3.5.1: JSON Formatter

**File:** `src/core/formats/json.ts`

- [ ] Implement `toJSON()` method
- [ ] Serialize analysis result to JSON
- [ ] Handle circular references
- [ ] Pretty print with indentation

**Test:** `tests/unit/core/formats/json.test.ts`
- [ ] Test toJSON with full result
- [ ] Test toJSON with minimal result
- [ ] Test output is valid JSON
- [ ] Test pretty printing

---

#### Task 3.5.2: Tree Formatter

**File:** `src/core/formats/tree.ts`

- [ ] Implement `toTree()` method
- [ ] Build ASCII tree from dependency tree
- [ ] Use box-drawing characters
- [ ] Support depth limiting
- [ ] Colorize output (optional)

**Test:** `tests/unit/core/formats/tree.test.ts`
- [ ] Test toTree with simple tree
- [ ] Test toTree with deep tree
- [ ] Test depth limiting
- [ ] Test tree structure
- [ ] Test with circular deps

---

#### Task 3.5.3: Markdown Formatter

**File:** `src/core/formats/markdown.ts`

- [ ] Implement `toMarkdown()` method
- [ ] Format analysis result as Markdown
- [ ] Use proper Markdown headers
- [ ] Create tables for data
- [ ] Use code blocks for tree

**Test:** `tests/unit/core/formats/markdown.test.ts`
- [ ] Test toMarkdown with full result
- [ ] Test Markdown structure
- [ ] Test table formatting
- [ ] Test code blocks

---

#### Task 3.5.4: HTML Formatter

**File:** `src/core/formats/html.ts`

- [ ] Implement `toHTML()` method
- [ ] Create standalone HTML document
- [ ] Include inline CSS for styling
- [ ] Format data as tables
- [ ] Add syntax highlighting for tree

**Test:** `tests/unit/core/formats/html.test.ts`
- [ ] Test toHTML with full result
- [ ] Test HTML structure
- [ ] Test CSS inclusion
- [ ] Test table formatting

---

## Phase 4: Kernel Implementation

### Task 4.1: Implement Analyzer Kernel

**File:** `src/kernel.ts`

- [ ] Implement `AnalyzerKernel` class
- [ ] Implement config management (readonly)
- [ ] Implement context object creation
- [ ] Implement plugin registry
- [ ] Implement `use()` method
- [ ] Implement dependency resolution (topological sort)
- [ ] Implement plugin lifecycle management
- [ ] Implement `run()` method
- [ ] Implement progress reporting
- [ ] Implement finding reporting
- [ ] Integrate with event bus
- [ ] Integrate with cache manager

**Test:** `tests/unit/kernel.test.ts`
- [ ] Test kernel initialization
- [ ] Test config readonly
- [ ] Test plugin registration
- [ ] Test plugin dependency resolution
- [ ] Test plugin lifecycle
- [ ] Test run method
- [ ] Test progress events
- [ ] Test finding events
- [ ] Test error handling
- [ ] Test plugin not found
- [ ] Test circular plugin dependencies

---

### Task 4.2: Implement Main API

**File:** `src/index.ts`

- [ ] Implement `deps` object
- [ ] Implement `deps.analyze()` method
- [ ] Implement `createAnalyzer()` factory
- [ ] Export all types
- [ ] Export error classes
- [ ] Export plugins
- [ ] Handle both ESM and CJS

**Test:** `tests/unit/index.test.ts`
- [ ] Test deps.analyze() with default options
- [ ] Test deps.analyze() with custom options
- [ ] Test deps.analyze() with full: true
- [ ] Test createAnalyzer()
- [ ] Test result object structure
- [ ] Test result.toJSON()
- [ ] Test result.toTree()
- [ ] Test result.toMarkdown()
- [ ] Test result.toHTML()
- [ ] Test result.toReport()

---

## Phase 5: Core Plugins

### Task 5.1: Implement Tree Plugin

**File:** `src/plugins/core/tree.ts`

- [ ] Define tree plugin
- [ ] Implement install method
- [ ] Build dependency tree
- [ ] Calculate tree depth
- [ ] Count total dependencies
- [ ] Support depth limiting
- [ ] Register with kernel

**Test:** `tests/unit/plugins/core/tree.test.ts`
- [ ] Test tree plugin registration
- [ ] Test tree building
- [ ] Test depth calculation
- [ ] Test dependency counting
- [ ] Test depth limiting
- [ ] Test with circular deps
- [ ] Test with missing packages

---

### Task 5.2: Implement Circular Plugin

**File:** `src/plugins/core/circular.ts`

- [ ] Define circular plugin
- [ ] Implement install method
- [ ] Implement Tarjan's SCC algorithm
- [ ] Detect all circular dependency chains
- [ ] Filter self-references
- [ ] Report findings
- [ ] Register with kernel

**Test:** `tests/unit/plugins/core/circular.test.ts`
- [ ] Test circular plugin registration
- [ ] Test Tarjan's algorithm
- [ ] Test single circular chain
- [ ] Test multiple circular chains
- [ ] Test no circular deps
- [ ] Test self-references
- [ ] Test complex graphs

---

### Task 5.3: Create Plugin Export

**File:** `src/plugins/index.ts`

- [ ] Export core plugins (tree, circular)
- [ ] Export optional plugins (unused, missing, duplicates, size, updates, security, monorepo)
- [ ] Export plugin types

**Test:** `tests/unit/plugins/index.test.ts`
- [ ] Verify all exports exist
- [ ] Test import structure

---

## Phase 6: Optional Plugins

### Task 6.1: Implement Unused Plugin

**File:** `src/plugins/optional/unused.ts`

- [ ] Define unused plugin
- [ ] Implement install method
- [ ] Scan source files for imports
- [ ] Parse import/export statements
- [ ] Cross-reference with package.json
- [ ] Respect ignore patterns
- [ ] Report unused dependencies

**Test:** `tests/unit/plugins/optional/unused.test.ts`
- [ ] Test unused plugin registration
- [ ] Test import detection
- [ ] Test unused detection
- [ ] Test ignore patterns
- [ ] Test with no unused
- [ ] Test with all unused
- [ ] Test with type-only imports

---

### Task 6.2: Implement Missing Plugin

**File:** `src/plugins/optional/missing.ts`

- [ ] Define missing plugin
- [ ] Implement install method
- [ ] Scan source files for imports
- [ ] Check against package.json
- [ ] Report missing dependencies
- [ ] Filter Node.js built-ins
- [ ] Filter local imports

**Test:** `tests/unit/plugins/optional/missing.test.ts`
- [ ] Test missing plugin registration
- [ ] Test missing detection
- [ ] Test Node.js built-in filtering
- [ ] Test local import filtering
- [ ] Test with no missing
- [ ] Test with multiple missing

---

### Task 6.3: Implement Duplicates Plugin

**File:** `src/plugins/optional/duplicates.ts`

- [ ] Define duplicates plugin
- [ ] Implement install method
- [ ] Traverse node_modules
- [ ] Collect package versions
- [ ] Identify duplicates
- [ ] Report by package name

**Test:** `tests/unit/plugins/optional/duplicates.test.ts`
- [ ] Test duplicates plugin registration
- [ ] Test duplicate detection
- [ ] Test with no duplicates
- [ ] Test with multiple versions
- [ ] Test nested duplicates

---

### Task 6.4: Implement Size Plugin

**File:** `src/plugins/optional/size.ts`

- [ ] Define size plugin
- [ ] Implement install method
- [ ] Calculate package directory sizes
- [ ] Format sizes (KB, MB, GB)
- [ ] Calculate percentages
- [ ] Sort by size or name
- [ ] Support size limits

**Test:** `tests/unit/plugins/optional/size.test.ts`
- [ ] Test size plugin registration
- [ ] Test size calculation
- [ ] Test size formatting
- [ ] Test percentage calculation
- [ ] Test sorting by size
- [ ] Test sorting by name
- [ ] Test size limit comparison

---

### Task 6.5: Implement Updates Plugin

**File:** `src/plugins/optional/updates.ts`

- [ ] Define updates plugin
- [ ] Implement install method
- [ ] Query npm registry
- [ ] Parse package metadata
- [ ] Compare versions
- [ ] Categorize updates (major, minor, patch)
- [ ] Handle network errors
- [ ] Cache registry responses

**Test:** `tests/unit/plugins/optional/updates.test.ts`
- [ ] Test updates plugin registration
- [ ] Test registry query
- [ ] Test update categorization
- [ ] Test major update detection
- [ ] Test minor update detection
- [ ] Test patch update detection
- [ ] Test network error handling
- [ ] Test caching

---

### Task 6.6: Implement Security Plugin

**File:** `src/plugins/optional/security.ts`

- [ ] Define security plugin
- [ ] Implement install method
- [ ] Execute npm audit --json
- [ ] Parse audit results
- [ ] Normalize vulnerability data
- [ ] Count by severity
- [ ] Support CI exit codes

**Test:** `tests/unit/plugins/optional/security.test.ts`
- [ ] Test security plugin registration
- [ ] Test npm audit execution
- [ ] Test result parsing
- [ ] Test severity counting
- [ ] Test with no vulnerabilities
- [ ] Test with vulnerabilities
- [ ] Test CI exit codes

---

### Task 6.7: Implement Monorepo Plugin

**File:** `src/plugins/optional/monorepo.ts`

- [ ] Define monorepo plugin
- [ ] Implement install method
- [ ] Detect monorepo type (pnpm/npm/yarn/lerna/turbo/nx)
- [ ] Read workspace configuration
- [ ] Analyze each workspace package
- [ ] Aggregate results
- [ ] Detect workspace dependencies

**Test:** `tests/unit/plugins/optional/monorepo.test.ts`
- [ ] Test monorepo plugin registration
- [ ] Test pnpm workspace detection
- [ ] Test npm workspace detection
- [ ] Test yarn workspace detection
- [ ] Test lerna detection
- [ ] Test turborepo detection
- [ ] Test nx detection
- [ ] Test workspace analysis
- [ ] Test workspace dependency detection

---

## Phase 7: CLI Implementation

### Task 7.1: Implement CLI Framework

**File:** `src/cli.ts`

- [ ] Create CLI entry point
- [ ] Parse command line arguments
- [ ] Implement command routing
- [ ] Implement --help flag
- [ ] Implement --version flag
- [ ] Implement --verbose flag
- [ ] Implement --cwd option
- [ ] Implement --no-cache option
- [ ] Handle errors gracefully
- [ ] Set appropriate exit codes

**Test:** `tests/unit/cli.test.ts`
- [ ] Test argument parsing
- [ ] Test command routing
- [ ] Test help flag
- [ ] Test version flag
- [ ] Test verbose flag
- [ ] Test cwd option
- [ ] Test no-cache option
- [ ] Test error handling
- [ ] Test exit codes

---

### Task 7.2: Implement Tree Command

- [ ] Implement `deps tree` command
- [ ] Support --depth option
- [ ] Support --format option (json, md, html)
- [ ] Print output to stdout
- [ ] Handle file output redirection

**Test:** `tests/integration/cli.test.ts`
- [ ] Test tree command
- [ ] Test depth option
- [ ] Test format option
- [ ] Test output

---

### Task 7.3: Implement Circular Command

- [ ] Implement `deps circular` command
- [ ] Support --fail-on-circular option
- [ ] Print circular chains
- [ ] Set exit code on failure

**Test:** `tests/integration/cli.test.ts`
- [ ] Test circular command
- [ ] Test fail-on-circular option
- [ ] Test exit codes

---

### Task 7.4: Implement Unused Command

- [ ] Implement `deps unused` command
- [ ] Support --ignore option
- [ ] Print unused dependencies
- [ ] Respect ignore patterns

**Test:** `tests/integration/cli.test.ts`
- [ ] Test unused command
- [ ] Test ignore option
- [ ] Test output

---

### Task 7.5: Implement Missing Command

- [ ] Implement `deps missing` command
- [ ] Print missing dependencies
- [ ] Filter built-ins

**Test:** `tests/integration/cli.test.ts`
- [ ] Test missing command
- [ ] Test output

---

### Task 7.6: Implement Duplicates Command

- [ ] Implement `deps duplicates` command
- [ ] Support --json option
- [ ] Print duplicate versions

**Test:** `tests/integration/cli.test.ts`
- [ ] Test duplicates command
- [ ] Test json option
- [ ] Test output

---

### Task 7.7: Implement Size Command

- [ ] Implement `deps size` command
- [ ] Support --limit option
- [ ] Support --sort option (size, name)
- [ ] Support --json option
- [ ] Set exit code on limit exceeded

**Test:** `tests/integration/cli.test.ts`
- [ ] Test size command
- [ ] Test limit option
- [ ] Test sort option
- [ ] Test exit codes

---

### Task 7.8: Implement Updates Command

- [ ] Implement `deps updates` command
- [ ] Support --major option (filter major updates)
- [ ] Support --minor option (filter minor updates)
- [ ] Support --patch option (filter patch updates)
- [ ] Print update suggestions

**Test:** `tests/integration/cli.test.ts`
- [ ] Test updates command
- [ ] Test major filter
- [ ] Test minor filter
- [ ] Test patch filter
- [ ] Test output

---

### Task 7.9: Implement Security Command

- [ ] Implement `deps security` command
- [ ] Support --fail-on-high option
- [ ] Support --fail-on-critical option
- [ ] Print security report
- [ ] Set exit code on failure

**Test:** `tests/integration/cli.test.ts`
- [ ] Test security command
- [ ] Test fail-on-high option
- [ ] Test fail-on-critical option
- [ ] Test exit codes

---

### Task 7.10: Implement Report Command

- [ ] Implement `deps report` command
- [ ] Support --format option (json, md, html)
- [ ] Support --monorepo option
- [ ] Generate full report
- [ ] Print to stdout

**Test:** `tests/integration/cli.test.ts`
- [ ] Test report command
- [ ] Test format option
- [ ] Test monorepo option
- [ ] Test output

---

### Task 7.11: Implement Watch Command

- [ ] Implement `deps watch` command
- [ ] Watch package.json
- [ ] Watch node_modules
- [ ] Re-run analysis on change
- [ ] Debounce changes
- [ ] Handle watch errors

**Test:** `tests/integration/cli.test.ts`
- [ ] Test watch command
- [ ] Test file watching
- [ ] Test re-analysis

---

## Phase 8: MCP Server

### Task 8.1: Implement MCP Server

**File:** `src/mcp/server.ts`

- [ ] Implement MCP server class
- [ ] Handle stdio communication
- [ ] Implement request/response protocol
- [ ] Handle errors

**Test:** `tests/unit/mcp/server.test.ts`
- [ ] Test server initialization
- [ ] Test request handling
- [ ] Test error handling

---

### Task 8.2: Implement MCP Tools

**File:** `src/mcp/tools.ts`

- [ ] Define `analyze_dependencies` tool
- [ ] Define `get_circular_deps` tool
- [ ] Define `get_unused_deps` tool
- [ ] Define `check_size_budget` tool
- [ ] Define `security_audit` tool
- [ ] Implement tool handlers

**Test:** `tests/unit/mcp/tools.test.ts`
- [ ] Test analyze_dependencies tool
- [ ] Test get_circular_deps tool
- [ ] Test get_unused_deps tool
- [ ] Test check_size_budget tool
- [ ] Test security_audit tool

---

### Task 8.3: Create MCP Export

**File:** `src/mcp/index.ts`

- [ ] Export `createMCPServer()` function
- [ ] Handle CLI invocation

**Test:** `tests/unit/mcp/index.test.ts`
- [ ] Test createMCPServer
- [ ] Test server start

---

## Phase 9: Integration Tests

### Task 9.1: Create Test Fixtures

- [ ] Create simple-project fixture
- [ ] Create circular-deps fixture
- [ ] Create unused-deps fixture
- [ ] Create monorepo-pnpm fixture
- [ ] Create monorepo-npm fixture
- [ ] Create monorepo-yarn fixture
- [ ] Create lerna fixture
- [ ] Create turborepo fixture
- [ ] Create nx fixture

---

### Task 9.2: Integration Tests

**File:** `tests/integration/analyze.test.ts`

- [ ] Test full analysis with core plugins
- [ ] Test full analysis with all plugins
- [ ] Test with various project types
- [ ] Test with invalid projects
- [ ] Test with caching
- [ ] Test with custom options

---

### Task 9.3: CLI Integration Tests

**File:** `tests/integration/cli.test.ts`

- [ ] Test all CLI commands
- [ ] Test all CLI options
- [ ] Test error handling
- [ ] Test exit codes
- [ ] Test output formats

---

## Phase 10: Examples

### Task 10.1: Create Basic Examples

- [ ] examples/01-basic/quick-analysis.ts
- [ ] examples/01-basic/tree-visualization.ts
- [ ] examples/01-basic/circular-detection.ts

---

### Task 10.2: Create Plugin Examples

- [ ] examples/02-plugins/using-core-plugins.ts
- [ ] examples/02-plugins/using-optional-plugins.ts
- [ ] examples/02-plugins/custom-plugin.ts

---

### Task 10.3: Create Error Handling Examples

- [ ] examples/03-error-handling/graceful-errors.ts
- [ ] examples/03-error-handling/error-recovery.ts

---

### Task 10.4: Create TypeScript Examples

- [ ] examples/04-typescript/typed-results.ts
- [ ] examples/04-typescript/generic-plugins.ts

---

### Task 10.5: Create Integration Examples

- [ ] examples/05-integrations/ci-pipeline.ts
- [ ] examples/05-integrations/github-action.ts
- [ ] examples/05-integrations/pre-commit-hook.ts

---

### Task 10.6: Create Real-World Examples

- [ ] examples/06-real-world/monorepo-analysis.ts
- [ ] examples/06-real-world/security-workflow.ts
- [ ] examples/06-real-world/size-budget-check.ts
- [ ] examples/06-real-world/dependency-report.ts
- [ ] examples/06-real-world/watch-development.ts

---

## Phase 11: LLM-Native

### Task 11.1: Create llms.txt

**File:** `llms.txt`

- [ ] Write package description
- [ ] Add install command
- [ ] Add quick start
- [ ] Add API summary
- [ ] Add CLI commands
- [ ] Add common patterns
- [ ] Add error reference
- [ ] Add links
- [ ] Keep under 2000 tokens

---

### Task 11.2: Add JSDoc to All Public APIs

- [ ] Add JSDoc to deps.analyze()
- [ ] Add JSDoc to createAnalyzer()
- [ ] Add JSDoc to all result methods
- [ ] Add JSDoc to all plugin interfaces
- [ ] Add @example tags to each

---

### Task 11.3: Optimize README

- [ ] Write first 500 tokens for LLM consumption
- [ ] Clear package description
- [ ] Install command
- [ ] Quick start example
- [ ] Main API overview

---

## Phase 12: Website

### Task 12.1: Initialize Website

- [ ] Create website directory
- [ ] Initialize Vite + React + TypeScript
- [ ] Install Tailwind CSS
- [ ] Install Prism React Renderer
- [ ] Install Lucide React
- [ ] Configure build

---

### Task 12.2: Create Website Pages

- [ ] Create Home page
- [ ] Create Getting Started page
- [ ] Create API Reference page
- [ ] Create Plugins page
- [ ] Create CLI Reference page
- [ ] Create Examples page

---

### Task 12.3: Implement IDE-Style Code Blocks

- [ ] Create CodeBlock component
- [ ] Add line numbers
- [ ] Add syntax highlighting
- [ ] Add header bar with filename
- [ ] Add copy button with feedback
- [ ] Add dark/light theme support

---

### Task 12.4: Create Website Footer

- [ ] Add package name
- [ ] Add MIT License
- [ ] Add © 2025 Ersin Koç
- [ ] Add GitHub link only

---

### Task 12.5: Copy llms.txt to Website

- [ ] Copy llms.txt to website/public/

---

## Phase 13: Final Tasks

### Task 13.1: Create GitHub Actions Workflow

**File:** `.github/workflows/deploy.yml`

- [ ] Create deploy workflow
- [ ] Setup Node.js
- [ ] Run tests
- [ ] Build package
- [ ] Build website
- [ ] Deploy to GitHub Pages

---

### Task 13.2: Create CHANGELOG.md

- [ ] Create initial CHANGELOG
- [ ] Add version 1.0.0 entry
- [ ] List all features

---

### Task 13.3: Final Verification

- [ ] Run `npm run build` - ensure success
- [ ] Run `npm run test:coverage` - verify 100%
- [ ] Run `npm run typecheck` - ensure no errors
- [ ] Run `npm run lint` - ensure clean
- [ ] Test CLI commands manually
- [ ] Test all examples
- [ ] Verify website builds
- [ ] Check package.json is correct
- [ ] Verify all exports work
- [ ] Verify MCP server works

---

### Task 13.4: Create CNAME File

**File:** `website/public/CNAME`

- [ ] Create CNAME with deps.oxog.dev

---

## Task Completion Checklist

Before publishing, verify:

- [ ] All tasks complete
- [ ] 100% test coverage achieved
- [ ] All tests passing
- [ ] Zero runtime dependencies
- [ ] TypeScript strict mode enabled
- [ ] All public APIs have JSDoc with @example
- [ ] llms.txt created and < 2000 tokens
- [ ] 15+ examples created
- [ ] Website builds successfully
- [ ] CLI works correctly
- [ ] MCP server works
- [ ] GitHub Actions workflow works
- [ ] Ready for npm publish

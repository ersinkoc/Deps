/**
 * Type definitions for @oxog/deps
 *
 * @packageDocumentation
 */

/**
 * Dependency type categories
 */
export type DependencyType = 'prod' | 'dev' | 'peer' | 'optional';

/**
 * Plugin name identifiers
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
 * Output format options
 */
export type OutputFormat = 'json' | 'md' | 'html';

/**
 * Severity levels for findings
 */
export type Severity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Update type for version suggestions
 */
export type UpdateType = 'major' | 'minor' | 'patch';

/**
 * Circular dependency chain - array of package names forming a cycle
 */
export type CircularChain = string[];

/**
 * Package metadata from package.json
 */
export interface PackageMetadata {
  /** Package name */
  name: string;
  /** Package version */
  version: string;
  /** Package description */
  description?: string;
  /** Production dependencies */
  dependencies?: Record<string, string>;
  /** Development dependencies */
  devDependencies?: Record<string, string>;
  /** Peer dependencies */
  peerDependencies?: Record<string, string>;
  /** Optional dependencies */
  optionalDependencies?: Record<string, string>;
  /** Workspace configuration (for monorepos) */
  workspaces?: string[] | { packages: string[] };
}

/**
 * Dependency node in the tree
 */
export interface DependencyNode {
  /** Package name */
  name: string;
  /** Installed version */
  version: string;
  /** Dependency type */
  type: DependencyType;
  /** Nested dependencies */
  dependencies: DependencyNode[];
  /** Size in bytes (if size plugin enabled) */
  size?: number;
}

/**
 * Complete dependency tree
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
 * Dependency graph for algorithms
 */
export interface DependencyGraph {
  /** Adjacency list: package -> [dependencies] */
  adjacency: Map<string, string[]>;
  /** Package metadata by name */
  metadata: Map<string, PackageMetadata>;
  /** Reverse lookup: dependency -> [dependents] */
  reverse: Map<string, string[]>;
}

/**
 * Analyzer options
 */
export interface AnalyzerOptions {
  /** Working directory (default: process.cwd()) */
  cwd?: string;
  /** Enable full analysis (all plugins) */
  full?: boolean;
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
 * CI failure conditions
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
 * Final analyzer configuration (merged with defaults)
 */
export interface AnalyzerConfig {
  /** Working directory */
  cwd: string;
  /** Enabled plugins */
  plugins: PluginName[];
  /** Cache enabled */
  cache: boolean;
  /** Cache TTL in milliseconds */
  cacheTTL: number;
  /** Ignore patterns */
  ignore: string[];
  /** Monorepo mode */
  monorepo: boolean;
  /** Watch mode */
  watch: boolean;
  /** CI failure conditions */
  failOn: FailOnOptions;
}

/**
 * Traversal options for node_modules
 */
export interface TraverseOptions {
  /** Maximum depth to traverse */
  maxDepth?: number;
  /** Include dev dependencies */
  includeDev?: boolean;
  /** Include peer dependencies */
  includePeer?: boolean;
  /** Include optional dependencies */
  includeOptional?: boolean;
}

/**
 * Cache entry options
 */
export interface CacheOptions {
  /** Time to live in milliseconds */
  ttl?: number;
  /** Metadata to store with cache */
  metadata?: Record<string, unknown>;
}

/**
 * Package size information
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
 * Size analysis result
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
 * Update suggestion
 */
export interface UpdateSuggestion {
  /** Package name */
  name: string;
  /** Current installed version */
  current: string;
  /** Latest available version */
  latest: string;
  /** Update type */
  type: UpdateType;
}

/**
 * Individual vulnerability
 */
export interface Vulnerability {
  /** Package name */
  package: string;
  /** Severity level */
  severity: Severity;
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
 * Security audit result
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
 * Analysis result containing all findings
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
  toReport(format: OutputFormat): string;
}

/**
 * Shared context between plugins
 */
export interface AnalyzerContext {
  /** Root package metadata */
  package: PackageMetadata;
  /** Dependency graph */
  graph: DependencyGraph;
  /** Working directory */
  cwd: string;
  /** Analysis start time */
  startTime: number;
}

/**
 * Analyzer events
 */
export interface AnalyzerEvents {
  /** Analyze event */
  analyze: AnalyzerContext;
  /** Progress event */
  progress: { plugin: string; percent: number; message?: string };
  /** Finding event */
  finding: { type: string; severity: Severity; message: string; package?: string };
  /** Error event */
  error: Error;
  /** Change event (watch mode) */
  change: AnalysisResult;
  /** Complete event */
  complete: AnalysisResult;
  /** Index signature for extensibility */
  [key: string]: unknown;
}

/**
 * Plugin interface for extending analyzer functionality
 *
 * @typeParam TContext - Shared context type between plugins
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

/**
 * Analyzer kernel interface
 *
 * @typeParam TContext - Shared context type between plugins
 */
export interface AnalyzerKernel<TContext = AnalyzerContext> {
  /** Configuration */
  readonly config: Readonly<AnalyzerConfig>;
  /** Context object shared across plugins */
  readonly context: TContext;
  /**
   * Register a plugin
   * @param plugin - Plugin to register
   */
  use<TPlugin extends AnalyzerPlugin<TContext>>(
    plugin: TPlugin
  ): AnalyzerKernel<TContext>;
  /**
   * Add event listener
   * @param event - Event name
   * @param handler - Event handler
   */
  on<TEvent extends keyof AnalyzerEvents>(
    event: TEvent,
    handler: (data: AnalyzerEvents[TEvent]) => void
  ): void;
  /**
   * Emit event
   * @param event - Event name
   * @param data - Event data
   */
  emit<TEvent extends keyof AnalyzerEvents>(
    event: TEvent,
    data: AnalyzerEvents[TEvent]
  ): void | Promise<void>;
  /**
   * Get package metadata
   * @param path - Path to package.json or directory
   */
  getPackage(path: string): Promise<PackageMetadata>;
  /**
   * Get dependencies by type
   * @param type - Dependency type
   */
  getDependencies(
    type?: DependencyType
  ): Promise<DependencyNode[]>;
  /**
   * Get cached value
   * @param key - Cache key
   */
  getCache<T>(key: string): Promise<T | undefined>;
  /**
   * Set cached value
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in milliseconds
   */
  setCache<T>(key: string, value: T, ttl?: number): Promise<void>;
  /**
   * Report progress
   * @param plugin - Plugin name
   * @param percent - Progress percentage (0-100)
   * @param message - Progress message
   */
  reportProgress(plugin: string, percent: number, message?: string): void;
  /**
   * Report a finding
   * @param type - Finding type
   * @param severity - Severity level
   * @param message - Finding message
   * @param pkg - Related package name
   */
  reportFinding(
    type: string,
    severity: Severity,
    message: string,
    pkg?: string
  ): void;
  /**
   * Run the analysis
   */
  run(): Promise<AnalysisResult>;
}

/**
 * Analyze options for quick API
 */
export interface AnalyzeOptions {
  /** Enable full analysis (all plugins) */
  full?: boolean;
  /** Specific plugins to enable */
  plugins?: PluginName[];
  /** Enable caching */
  cache?: boolean;
  /** Working directory */
  cwd?: string;
  /** Ignore patterns */
  ignore?: string[];
  /** Monorepo mode */
  monorepo?: boolean;
}

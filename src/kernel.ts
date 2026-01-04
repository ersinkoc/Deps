/**
 * Analyzer kernel - micro-kernel architecture
 *
 * Zero-dependency implementation
 *
 * @packageDocumentation
 */

import { resolve } from 'node:path';
import { EventBus } from './core/event-bus.js';
import { CacheManager } from './core/cache.js';
import { PackageParser } from './core/parser.js';
import { NodeModulesTraverser } from './core/traverser.js';
import {
  PluginNotFoundError,
  PluginDependencyError,
  CircularPluginDependencyError
} from './errors.js';
import type {
  AnalyzerOptions,
  AnalyzerConfig,
  AnalyzerContext,
  AnalysisResult,
  AnalyzerKernel as IAnalyzerKernel,
  AnalyzerPlugin,
  AnalyzerEvents,
  PluginName,
  DependencyNode,
  DependencyType
} from './types.js';

/**
 * Default analyzer configuration
 */
const DEFAULT_CONFIG: AnalyzerConfig = {
  cwd: process.cwd(),
  plugins: ['tree', 'circular'],
  cache: false,
  cacheTTL: 3600000, // 1 hour
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
  monorepo: false,
  watch: false,
  failOn: {}
};

/**
 * Merge user options with defaults
 * @internal
 */
function mergeConfig(options: AnalyzerOptions = {}): AnalyzerConfig {
  return {
    ...DEFAULT_CONFIG,
    ...options,
    cwd: options.cwd ? resolve(options.cwd) : DEFAULT_CONFIG.cwd,
    plugins: options.plugins ?? DEFAULT_CONFIG.plugins,
    ignore: options.ignore ?? DEFAULT_CONFIG.ignore,
    failOn: options.failOn ?? DEFAULT_CONFIG.failOn
  };
}

/**
 * Resolve plugin load order using topological sort
 * @internal
 */
function resolvePluginOrder(
  plugins: Map<string, AnalyzerPlugin>
): AnalyzerPlugin[] {
  const order: AnalyzerPlugin[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(name: string): void {
    if (visited.has(name)) {
      return;
    }

    if (visiting.has(name)) {
      throw new CircularPluginDependencyError([name]);
    }

    visiting.add(name);

    const plugin = plugins.get(name);

    if (!plugin) {
      throw new PluginNotFoundError(name);
    }

    // Visit dependencies first
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!plugins.has(dep)) {
          throw new PluginDependencyError(name, [dep]);
        }
        visit(dep);
      }
    }

    visiting.delete(name);
    visited.add(name);
    order.push(plugin);
  }

  // Visit all plugins
  for (const name of plugins.keys()) {
    visit(name);
  }

  return order;
}

/**
 * Analyzer kernel implementation
 */
export class AnalyzerKernel implements IAnalyzerKernel {
  /** Kernel configuration */
  readonly config: Readonly<AnalyzerConfig>;

  /** Event bus */
  private eventBus: EventBus<AnalyzerEvents>;

  /** Cache manager */
  private cache: CacheManager;

  /** Package parser */
  private parser: PackageParser;

  /** Node modules traverser */
  private traverser: NodeModulesTraverser;

  /** Registered plugins */
  private plugins = new Map<string, AnalyzerPlugin>();

  /** Plugin load order */
  private pluginOrder: AnalyzerPlugin[] = [];

  /** Analysis context */
  readonly context: AnalyzerContext;

  /** Analysis results */
  private results: Map<string, unknown> = new Map();

  constructor(options: AnalyzerOptions = {}) {
    this.config = mergeConfig(options);
    this.eventBus = new EventBus();
    this.cache = new CacheManager(this.config.cwd);
    this.parser = new PackageParser();
    this.traverser = new NodeModulesTraverser();

    // Initialize context (will be populated during run)
    this.context = {
      package: {} as any,
      graph: {
        adjacency: new Map(),
        metadata: new Map(),
        reverse: new Map()
      },
      cwd: this.config.cwd,
      startTime: 0
    };

    // Set up event forwarding
    this.eventBus.on('error', (error) => {
      // Error events are handled silently - consumers can add their own listeners
      // The error will be thrown in run() method
    });
  }

  /**
   * Register a plugin
   */
  use<TPlugin extends AnalyzerPlugin>(
    plugin: TPlugin
  ): AnalyzerKernel {
    // Check for duplicate
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin already registered: ${plugin.name}`);
    }

    this.plugins.set(plugin.name, plugin);
    return this;
  }

  /**
   * Add event listener
   */
  on<TEvent extends keyof AnalyzerEvents>(
    event: TEvent,
    handler: (data: AnalyzerEvents[TEvent]) => void
  ): void {
    this.eventBus.on(event, handler);
  }

  /**
   * Emit event
   */
  async emit<TEvent extends keyof AnalyzerEvents>(
    event: TEvent,
    data: AnalyzerEvents[TEvent]
  ): Promise<void> {
    await this.eventBus.emit(event, data);
  }

  /**
   * Get package metadata
   */
  async getPackage(path: string): Promise<any> {
    return await this.parser.parse(path);
  }

  /**
   * Get dependencies by type
   * @param type - Dependency type filter
   * @returns Array of dependency nodes
   */
  async getDependencies(type?: DependencyType): Promise<DependencyNode[]> {
    // Get the parsed package metadata
    const pkg = this.context.package;

    if (!pkg) {
      return [];
    }

    // Select dependencies based on type
    const depsMap: Record<DependencyType, Record<string, string> | undefined> = {
      prod: pkg.dependencies,
      dev: pkg.devDependencies,
      peer: pkg.peerDependencies,
      optional: pkg.optionalDependencies
    };

    const deps = type ? depsMap[type] : pkg.dependencies;

    if (!deps) {
      return [];
    }

    // Convert to DependencyNode array
    const nodes: DependencyNode[] = [];
    for (const [name, version] of Object.entries(deps)) {
      nodes.push({
        name,
        version,
        type: type ?? 'prod',
        dependencies: []
      });
    }

    return nodes;
  }

  /**
   * Get cached value
   */
  async getCache<T>(key: string): Promise<T | undefined> {
    const value = await this.cache.get<T>(key);
    return value ?? undefined;
  }

  /**
   * Set cached value
   */
  async setCache<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cache.set(key, value, { ttl });
  }

  /**
   * Report progress
   */
  reportProgress(plugin: string, percent: number, message?: string): void {
    this.eventBus.emit('progress', { plugin, percent, message });
  }

  /**
   * Report a finding
   */
  reportFinding(
    type: string,
    severity: 'info' | 'warning' | 'error' | 'critical',
    message: string,
    pkg?: string
  ): void {
    this.eventBus.emit('finding', { type, severity, message, package: pkg });
  }

  /**
   * Initialize all plugins
   */
  private async initializePlugins(): Promise<void> {
    // Resolve load order
    this.pluginOrder = resolvePluginOrder(this.plugins);

    // Install plugins
    for (const plugin of this.pluginOrder) {
      try {
        plugin.install(this);
      } catch (error) {
        plugin.onError?.(error as Error);
        throw error;
      }
    }

    // Initialize plugins
    for (const plugin of this.pluginOrder) {
      if (plugin.onInit) {
        await plugin.onInit(this.context);
      }
    }
  }

  /**
   * Run the analysis
   */
  async run(): Promise<AnalysisResult> {
    this.context.startTime = Date.now();

    try {
      // Parse package.json
      this.context.package = await this.parser.parse(this.config.cwd);

      // Traverse node_modules
      this.context.graph = await this.traverser.getDependencyGraph(
        this.context.package,
        this.config.cwd
      );

      // Build dependency tree
      const tree = await this.traverser.traverse(
        this.context.package,
        this.config.cwd
      );

      // Initialize plugins
      await this.initializePlugins();

      // Emit analyze event
      await this.eventBus.emit('analyze', this.context);

      // Collect results
      const result: AnalysisResult = {
        tree,
        circular: (this.results.get('circular') as string[][]) ?? [],
        exitCode: 0,
        toJSON: () => '',
        toTree: () => '',
        toMarkdown: () => '',
        toHTML: () => '',
        toReport: () => ''
      };

      // Add optional results
      const unused = this.results.get('unused');
      if (unused) {
        result.unused = unused as string[];
      }

      const missing = this.results.get('missing');
      if (missing) {
        result.missing = missing as string[];
      }

      const duplicates = this.results.get('duplicates');
      if (duplicates) {
        result.duplicates = duplicates as Record<string, string[]>;
      }

      const size = this.results.get('size');
      if (size) {
        result.size = size as any;
      }

      const updates = this.results.get('updates');
      if (updates) {
        result.updates = updates as any[];
      }

      const security = this.results.get('security');
      if (security) {
        result.security = security as any;
      }

      // Set result methods
      const { toJSON, toTree, toMarkdown, toHTML } = await import('./core/formats/index.js');

      result.toJSON = () => toJSON(result);
      result.toTree = () => toTree(result);
      result.toMarkdown = () => toMarkdown(result);
      result.toHTML = () => toHTML(result);
      result.toReport = (format: 'json' | 'md' | 'html') => {
        switch (format) {
          case 'json':
            return toJSON(result);
          case 'md':
            return toMarkdown(result);
          case 'html':
            return toHTML(result);
        }
      };

      // Check CI failure conditions
      if (this.config.failOn.circular && result.circular.length > 0) {
        result.exitCode = 1;
      }

      if (this.config.failOn.unused && result.unused && result.unused.length > 0) {
        result.exitCode = 1;
      }

      if (this.config.failOn.sizeLimit && result.size) {
        const { parseSize } = await import('./utils/size.js');
        const limit = parseSize(this.config.failOn.sizeLimit);
        if (result.size.total > limit) {
          result.exitCode = 1;
        }
      }

      if (result.security) {
        if (this.config.failOn.securityHigh && result.security.bySeverity.high > 0) {
          result.exitCode = 1;
        }
        if (this.config.failOn.securityCritical && result.security.bySeverity.critical > 0) {
          result.exitCode = 1;
        }
      }

      // Emit complete event
      await this.eventBus.emit('complete', result);

      return result;
    } catch (error) {
      await this.eventBus.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Set analysis result from plugin
   * @internal
   */
  setResult(key: string, value: unknown): void {
    this.results.set(key, value);
  }

  /**
   * Get analysis result
   * @internal
   */
  getResult<T>(key: string): T | undefined {
    return this.results.get(key) as T;
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    // Call onDestroy for all plugins
    for (const plugin of this.pluginOrder) {
      if (plugin.onDestroy) {
        await plugin.onDestroy();
      }
    }

    // Clear resources
    this.eventBus.removeAllListeners();
    this.parser.clearCache();
    this.traverser.clearCache();
  }
}

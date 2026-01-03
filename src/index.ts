/**
 * @oxog/deps - Zero-Dependency NPM Package
 *
 * A comprehensive dependency analysis toolkit for Node.js projects
 * with zero runtime dependencies.
 *
 * @packageDocumentation
 */

import type { AnalyzerOptions, AnalysisResult, AnalyzerKernel, PluginName } from './types.js';
import { AnalyzerKernel as AnalyzerKernelImpl } from './kernel.js';

/**
 * Quick API for dependency analysis
 */
export const deps = {
  /**
   * Analyze dependencies of a Node.js project
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
   */
  async analyze(
    path: string = process.cwd(),
    options: AnalyzerOptions = {}
  ): Promise<AnalysisResult> {
    // Normalize path
    const cwd = path.endsWith('package.json')
      ? path.replace(/\/package\.json$/, '')
      : path;

    // Merge options
    const opts: AnalyzerOptions = {
      cwd,
      ...options
    };

    // If full: true, enable all plugins
    if (options.full) {
      opts.plugins = ['tree', 'circular', 'unused', 'missing', 'duplicates', 'size', 'updates', 'security'];
    }

    // Create analyzer
    const analyzer = createAnalyzer(opts);

    // Load core plugins
    const { treePlugin } = await import('./plugins/core/tree.js');
    const { circularPlugin } = await import('./plugins/core/circular.js');

    analyzer.use(treePlugin);
    analyzer.use(circularPlugin);

    // Load optional plugins if requested
    if (opts.plugins) {
      if (opts.plugins.includes('unused')) {
        const { unusedPlugin } = await import('./plugins/optional/unused.js');
        analyzer.use(unusedPlugin);
      }

      if (opts.plugins.includes('missing')) {
        const { missingPlugin } = await import('./plugins/optional/missing.js');
        analyzer.use(missingPlugin);
      }

      if (opts.plugins.includes('duplicates')) {
        const { duplicatesPlugin } = await import('./plugins/optional/duplicates.js');
        analyzer.use(duplicatesPlugin);
      }

      if (opts.plugins.includes('size')) {
        const { sizePlugin } = await import('./plugins/optional/size.js');
        analyzer.use(sizePlugin);
      }

      if (opts.plugins.includes('updates')) {
        const { updatesPlugin } = await import('./plugins/optional/updates.js');
        analyzer.use(updatesPlugin);
      }

      if (opts.plugins.includes('security')) {
        const { securityPlugin } = await import('./plugins/optional/security.js');
        analyzer.use(securityPlugin);
      }

      if (opts.plugins.includes('monorepo')) {
        const { monorepoPlugin } = await import('./plugins/optional/monorepo.js');
        analyzer.use(monorepoPlugin);
      }
    }

    // Run analysis
    return await analyzer.run();
  }
};

/**
 * Create an analyzer instance with fine-grained control
 *
 * @param options - Analyzer options
 * @returns Analyzer instance
 *
 * @example
 * ```typescript
 * const analyzer = createAnalyzer({
 *   cwd: './my-project',
 *   plugins: ['tree', 'circular', 'unused'],
 *   cache: true
 * });
 *
 * // Register custom plugin
 * analyzer.use({
 *   name: 'custom',
 *   version: '1.0.0',
 *   install: (kernel) => {
 *     kernel.on('analyze', (ctx) => {
 *       // Custom analysis logic
 *     });
 *   }
 * });
 *
 * // Event listeners
 * analyzer.on('progress', ({ plugin, percent }) => {
 *   console.log(`${plugin}: ${percent}%`);
 * });
 *
 * const result = await analyzer.run();
 * ```
 */
export function createAnalyzer(options: AnalyzerOptions = {}): AnalyzerKernel {
  return new AnalyzerKernelImpl(options);
}

// Export types
export type {
  AnalyzerOptions,
  AnalyzerConfig,
  AnalysisResult,
  AnalyzerKernel,
  AnalyzerPlugin,
  AnalyzerContext,
  AnalyzerEvents,
  DependencyNode,
  DependencyTree,
  DependencyGraph,
  PackageMetadata,
  CircularChain,
  PluginName,
  DependencyType,
  OutputFormat,
  Severity,
  UpdateType,
  SizeAnalysis,
  PackageSize,
  UpdateSuggestion,
  SecurityAudit,
  Vulnerability,
  FailOnOptions,
  CacheOptions,
  TraverseOptions
} from './types.js';

// Export errors
export {
  DepsError,
  PackageNotFoundError,
  InvalidPackageJsonError,
  NodeModulesNotFoundError,
  PluginNotFoundError,
  PluginDependencyError,
  CircularPluginDependencyError,
  CircularDependencyDetectedError,
  CacheError,
  NetworkError,
  FileSystemError,
  MonorepoDetectionError,
  isDepsError
} from './errors.js';

// Export utilities
export {
  readFile,
  readFileSafe,
  readJson,
  writeFile,
  writeJson,
  fileExists,
  directoryExists,
  listFiles,
  listDirectories,
  getFileHash,
  getDirectoryHash,
  getFileSize,
  getDirectorySize
} from './utils/fs.js';

export {
  glob,
  globSync,
  isMatch,
  ignore
} from './utils/glob.js';

export {
  formatBytes,
  parseSize
} from './utils/size.js';

export {
  parseSemver,
  compareSemver,
  satisfies,
  getUpdateType,
  maxSatisfying,
  incrementVersion
} from './utils/semver.js';

export {
  indent,
  truncate,
  escapeHtml,
  stripAnsi,
  wordWrap
} from './utils/string.js';

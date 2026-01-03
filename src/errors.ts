/**
 * Custom error classes for @oxog/deps
 *
 * @packageDocumentation
 */

/**
 * Base error class for all @oxog/deps errors
 */
export class DepsError extends Error {
  /** Error code for programmatic handling */
  readonly code: string;
  /** Additional error details */
  readonly details?: unknown;

  /**
   * Create a new DepsError
   * @param code - Error code (e.g., 'PACKAGE_NOT_FOUND')
   * @param message - Human-readable error message
   * @param details - Additional error details
   */
  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'DepsError';
    this.code = code;
    this.details = details;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DepsError);
    }
  }

  /** Convert error to JSON */
  toJSON(): { code: string; message: string; details?: unknown } {
    return {
      code: this.code,
      message: this.message,
      details: this.details
    };
  }
}

/**
 * Error thrown when package.json is not found
 */
export class PackageNotFoundError extends DepsError {
  /**
   * @param path - Path where package.json was expected
   */
  constructor(path: string) {
    super(
      'PACKAGE_NOT_FOUND',
      `package.json not found at ${path}`,
      { path }
    );
    this.name = 'PackageNotFoundError';
  }
}

/**
 * Error thrown when package.json contains invalid JSON
 */
export class InvalidPackageJsonError extends DepsError {
  /**
   * @param path - Path to invalid package.json
   * @param parseError - Original JSON parse error
   */
  constructor(path: string, parseError: SyntaxError) {
    super(
      'INVALID_PACKAGE_JSON',
      `Invalid package.json at ${path}: ${parseError.message}`,
      { path, parseError }
    );
    this.name = 'InvalidPackageJsonError';
  }
}

/**
 * Error thrown when node_modules directory is not found
 */
export class NodeModulesNotFoundError extends DepsError {
  /**
   * @param path - Path where node_modules was expected
   */
  constructor(path: string) {
    super(
      'NODE_MODULES_NOT_FOUND',
      `node_modules not found at ${path}. Run 'npm install' first.`,
      { path }
    );
    this.name = 'NodeModulesNotFoundError';
  }
}

/**
 * Error thrown when a requested plugin is not found
 */
export class PluginNotFoundError extends DepsError {
  /**
   * @param name - Name of the plugin that was not found
   */
  constructor(name: string) {
    super(
      'PLUGIN_NOT_FOUND',
      `Plugin not found: ${name}`,
      { name }
    );
    this.name = 'PluginNotFoundError';
  }
}

/**
 * Error thrown when plugin dependencies cannot be resolved
 */
export class PluginDependencyError extends DepsError {
  /**
   * @param plugin - Name of the plugin with missing dependencies
   * @param missing - List of missing dependency plugins
   */
  constructor(plugin: string, missing: string[]) {
    super(
      'PLUGIN_DEPENDENCY_ERROR',
      `Plugin '${plugin}' requires missing dependencies: ${missing.join(', ')}`,
      { plugin, missing }
    );
    this.name = 'PluginDependencyError';
  }
}

/**
 * Error thrown when circular plugin dependencies are detected
 */
export class CircularPluginDependencyError extends DepsError {
  /**
   * @param cycle - Array of plugin names forming a circular dependency
   */
  constructor(cycle: string[]) {
    super(
      'CIRCULAR_PLUGIN_DEPENDENCY',
      `Circular plugin dependencies detected: ${cycle.join(' -> ')}`,
      { cycle }
    );
    this.name = 'CircularPluginDependencyError';
  }
}

/**
 * Error thrown when circular dependencies are detected (not an error, but reported)
 */
export class CircularDependencyDetectedError extends DepsError {
  /**
   * @param chains - Array of circular dependency chains
   */
  constructor(chains: string[][]) {
    super(
      'CIRCULAR_DETECTED',
      `Detected ${chains.length} circular dependencies`,
      { chains }
    );
    this.name = 'CircularDependencyDetectedError';
  }
}

/**
 * Error thrown when cache operations fail
 */
export class CacheError extends DepsError {
  /**
   * @param message - Error message
   * @param details - Additional details
   */
  constructor(message: string, details?: unknown) {
    super('CACHE_ERROR', message, details);
    this.name = 'CacheError';
  }
}

/**
 * Error thrown when network operations fail
 */
export class NetworkError extends DepsError {
  /**
   * @param message - Error message
   * @param url - URL that failed
   * @param originalError - Original error
   */
  constructor(message: string, url?: string, originalError?: Error) {
    super(
      'NETWORK_ERROR',
      message,
      { url, originalError }
    );
    this.name = 'NetworkError';
  }
}

/**
 * Error thrown when file system operations fail
 */
export class FileSystemError extends DepsError {
  /**
   * @param message - Error message
   * @param path - Related file path
   * @param originalError - Original error
   */
  constructor(message: string, path?: string, originalError?: Error) {
    super(
      'FILESYSTEM_ERROR',
      message,
      { path, originalError }
    );
    this.name = 'FileSystemError';
  }
}

/**
 * Error thrown when monorepo detection fails
 */
export class MonorepoDetectionError extends DepsError {
  /**
   * @param message - Error message
   * @param details - Additional details
   */
  constructor(message: string, details?: unknown) {
    super('MONOREPO_DETECTION_ERROR', message, details);
    this.name = 'MonorepoDetectionError';
  }
}

/**
 * Type guard to check if an error is a DepsError
 * @param error - Error to check
 */
export function isDepsError(error: unknown): error is DepsError {
  return error instanceof Error && 'code' in error;
}

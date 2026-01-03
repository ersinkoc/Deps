/**
 * Tests for error classes
 *
 * @packageDocumentation
 */

import { describe, it, expect } from 'vitest';
import {
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
} from '../../src/errors.js';

describe('DepsError', () => {
  it('should create base error with code and message', () => {
    const error = new DepsError('TEST_CODE', 'Test message');
    expect(error.code).toBe('TEST_CODE');
    expect(error.message).toBe('Test message');
    expect(error.name).toBe('DepsError');
  });

  it('should include details in error', () => {
    const details = { path: '/test/path' };
    const error = new DepsError('TEST_CODE', 'Test message', details);
    expect(error.details).toEqual(details);
  });

  it('should convert to JSON', () => {
    const error = new DepsError('TEST_CODE', 'Test message', { key: 'value' });
    const json = error.toJSON();
    expect(json).toEqual({
      code: 'TEST_CODE',
      message: 'Test message',
      details: { key: 'value' }
    });
  });
});

describe('PackageNotFoundError', () => {
  it('should create error with path', () => {
    const error = new PackageNotFoundError('/path/to/package.json');
    expect(error.code).toBe('PACKAGE_NOT_FOUND');
    expect(error.message).toContain('/path/to/package.json');
    expect(error.name).toBe('PackageNotFoundError');
  });

  it('should be a DepsError', () => {
    const error = new PackageNotFoundError('/path');
    expect(isDepsError(error)).toBe(true);
  });
});

describe('InvalidPackageJsonError', () => {
  it('should create error with parse error', () => {
    const parseError = new SyntaxError('Unexpected token');
    const error = new InvalidPackageJsonError('/path', parseError);
    expect(error.code).toBe('INVALID_PACKAGE_JSON');
    expect(error.message).toContain('/path');
    expect(error.details).toEqual({ path: '/path', parseError });
  });
});

describe('NodeModulesNotFoundError', () => {
  it('should create error with path', () => {
    const error = new NodeModulesNotFoundError('/path/to/node_modules');
    expect(error.code).toBe('NODE_MODULES_NOT_FOUND');
    expect(error.message).toContain('/path/to/node_modules');
  });
});

describe('PluginNotFoundError', () => {
  it('should create error with plugin name', () => {
    const error = new PluginNotFoundError('missing-plugin');
    expect(error.code).toBe('PLUGIN_NOT_FOUND');
    expect(error.message).toContain('missing-plugin');
  });
});

describe('PluginDependencyError', () => {
  it('should create error with missing dependencies', () => {
    const error = new PluginDependencyError('my-plugin', ['dep1', 'dep2']);
    expect(error.code).toBe('PLUGIN_DEPENDENCY_ERROR');
    expect(error.message).toContain('my-plugin');
    expect(error.message).toContain('dep1, dep2');
    expect(error.details).toEqual({ plugin: 'my-plugin', missing: ['dep1', 'dep2'] });
  });
});

describe('CircularPluginDependencyError', () => {
  it('should create error with cycle', () => {
    const error = new CircularPluginDependencyError(['a', 'b', 'c']);
    expect(error.code).toBe('CIRCULAR_PLUGIN_DEPENDENCY');
    expect(error.message).toContain('a -> b -> c');
    expect(error.details).toEqual({ cycle: ['a', 'b', 'c'] });
  });
});

describe('CircularDependencyDetectedError', () => {
  it('should create error with chains', () => {
    const chains = [['a', 'b', 'a'], ['x', 'y', 'x']];
    const error = new CircularDependencyDetectedError(chains);
    expect(error.code).toBe('CIRCULAR_DETECTED');
    expect(error.message).toContain('2');
    expect(error.details).toEqual({ chains });
  });
});

describe('CacheError', () => {
  it('should create error with message', () => {
    const error = new CacheError('Cache operation failed');
    expect(error.code).toBe('CACHE_ERROR');
    expect(error.message).toBe('Cache operation failed');
  });

  it('should include details', () => {
    const error = new CacheError('Failed', { key: 'test' });
    expect(error.details).toEqual({ key: 'test' });
  });
});

describe('NetworkError', () => {
  it('should create error with URL', () => {
    const error = new NetworkError('Network failed', 'https://example.com');
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.details?.url).toBe('https://example.com');
  });

  it('should include original error', () => {
    const original = new Error('Connection timeout');
    const error = new NetworkError('Network failed', undefined, original);
    expect(error.details?.originalError).toBe(original);
  });
});

describe('FileSystemError', () => {
  it('should create error with path', () => {
    const error = new FileSystemError('File read failed', '/path/to/file');
    expect(error.code).toBe('FILESYSTEM_ERROR');
    expect(error.details?.path).toBe('/path/to/file');
  });
});

describe('MonorepoDetectionError', () => {
  it('should create error with message', () => {
    const error = new MonorepoDetectionError('Failed to detect monorepo');
    expect(error.code).toBe('MONOREPO_DETECTION_ERROR');
    expect(error.message).toBe('Failed to detect monorepo');
  });
});

describe('isDepsError', () => {
  it('should return true for DepsError instances', () => {
    const error = new PackageNotFoundError('/path');
    expect(isDepsError(error)).toBe(true);
  });

  it('should return false for regular errors', () => {
    const error = new Error('Regular error');
    expect(isDepsError(error)).toBe(false);
  });

  it('should return false for non-errors', () => {
    expect(isDepsError('not an error')).toBe(false);
    expect(isDepsError(null)).toBe(false);
    expect(isDepsError(undefined)).toBe(false);
  });
});

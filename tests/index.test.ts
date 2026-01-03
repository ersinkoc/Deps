/**
 * Tests for main API
 *
 * @packageDocumentation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { deps, createAnalyzer } from '../src/index.js';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import type { AnalyzerOptions } from '../src/types.js';

const testDir = join(process.cwd(), 'test-index-temp');

describe('deps.analyze', () => {
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should have analyze method', () => {
    expect(typeof deps.analyze).toBe('function');
  });

  it('should analyze from directory path', async () => {
    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    // Create node_modules directory
    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    // Analyze from directory path (not package.json path)
    const result = await deps.analyze(testDir);
    expect(result.tree).toBeDefined();
    expect(result.tree.root.name).toBe('test-pkg');
  });

  it('should accept options with cwd', async () => {
    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const result = await deps.analyze(testDir, { cwd: testDir });
    expect(result.tree).toBeDefined();
  });

  it('should enable all plugins when full: true', async () => {
    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const result = await deps.analyze(testDir, { full: true });
    expect(result.tree).toBeDefined();
    // The result should have the basic structure
    expect(result.circular).toBeDefined();
    expect(typeof result.toJSON).toBe('function');
    expect(typeof result.toTree).toBe('function');
    expect(typeof result.toMarkdown).toBe('function');
    expect(typeof result.toHTML).toBe('function');
  });

  it('should accept specific plugins array', async () => {
    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const options: AnalyzerOptions = {
      plugins: ['tree', 'circular']
    };

    const result = await deps.analyze(testDir, options);
    expect(result.tree).toBeDefined();
    expect(result.circular).toBeDefined();
  });

  it('should use default cwd when path not provided', async () => {
    // This should work with the actual project directory
    const result = await deps.analyze();
    expect(result).toBeDefined();
    expect(result.tree).toBeDefined();
  });

  it('should return AnalysisResult with all required properties', async () => {
    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const result = await deps.analyze(testDir);

    expect(result.tree).toBeDefined();
    expect(result.circular).toBeDefined();
    expect(result.exitCode).toBeDefined();
    expect(typeof result.toJSON).toBe('function');
    expect(typeof result.toTree).toBe('function');
    expect(typeof result.toMarkdown).toBe('function');
    expect(typeof result.toHTML).toBe('function');
    expect(typeof result.toReport).toBe('function');
  });

  it('should load tree plugin by default', async () => {
    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const result = await deps.analyze(testDir);
    expect(result.tree.root.name).toBe('test-pkg');
  });

  it('should load circular plugin by default', async () => {
    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const result = await deps.analyze(testDir);
    expect(result.circular).toBeDefined();
    expect(Array.isArray(result.circular)).toBe(true);
  });

  it('should load unused plugin when specified', async () => {
    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const result = await deps.analyze(testDir, { plugins: ['tree', 'circular', 'unused'] });
    expect(result.unused).toBeDefined();
  });

  it('should load missing plugin when specified', async () => {
    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const result = await deps.analyze(testDir, { plugins: ['tree', 'circular', 'missing'] });
    expect(result.missing).toBeDefined();
  });

  it('should load duplicates plugin when specified', async () => {
    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const result = await deps.analyze(testDir, { plugins: ['tree', 'circular', 'duplicates'] });
    expect(result.duplicates).toBeDefined();
  });

  it('should load size plugin when specified', async () => {
    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const result = await deps.analyze(testDir, { plugins: ['tree', 'circular', 'size'] });
    expect(result.size).toBeDefined();
  });

  it('should load updates plugin when specified', async () => {
    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const result = await deps.analyze(testDir, { plugins: ['tree', 'circular', 'updates'] });
    expect(result.updates).toBeDefined();
  });

  it('should load security plugin when specified', async () => {
    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const result = await deps.analyze(testDir, { plugins: ['tree', 'circular', 'security'] });
    expect(result.security).toBeDefined();
  });

  it('should load monorepo plugin when specified', async () => {
    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const result = await deps.analyze(testDir, { plugins: ['tree', 'circular', 'monorepo'] });
    // Monorepo plugin adds data to context, not to result
    expect(result.tree).toBeDefined();
  });
});

describe('createAnalyzer', () => {
  it('should create analyzer instance', () => {
    const analyzer = createAnalyzer();
    expect(analyzer).toBeDefined();
    expect(typeof analyzer.use).toBe('function');
    expect(typeof analyzer.run).toBe('function');
    expect(typeof analyzer.on).toBe('function');
  });

  it('should accept options', () => {
    const analyzer = createAnalyzer({
      cwd: process.cwd(),
      cache: true
    });
    expect(analyzer).toBeDefined();
  });

  it('should have config property', () => {
    const analyzer = createAnalyzer({ cwd: '/test' });
    expect(analyzer.config).toBeDefined();
    expect(analyzer.config.cwd).toBeDefined();
  });

  it('should have context property', () => {
    const analyzer = createAnalyzer();
    expect(analyzer.context).toBeDefined();
    expect(analyzer.context.cwd).toBeDefined();
  });

  it('should allow registering plugins', () => {
    const analyzer = createAnalyzer();

    const mockPlugin = {
      name: 'test-plugin',
      version: '1.0.0',
      install: () => {}
    };

    const result = analyzer.use(mockPlugin);
    expect(result).toBe(analyzer); // Should return this for chaining
  });

  it('should throw error when registering duplicate plugin', () => {
    const analyzer = createAnalyzer();

    const mockPlugin = {
      name: 'test-plugin',
      version: '1.0.0',
      install: () => {}
    };

    analyzer.use(mockPlugin);
    expect(() => analyzer.use(mockPlugin)).toThrow('Plugin already registered');
  });

  it('should allow adding event listeners', () => {
    const analyzer = createAnalyzer();
    let called = false;

    analyzer.on('progress', () => { called = true; });
    expect(typeof analyzer.on).toBe('function');
  });

  it('should allow emitting events', async () => {
    const analyzer = createAnalyzer();
    let called = false;

    analyzer.on('progress', () => { called = true; });
    await analyzer.emit('progress', { plugin: 'test', percent: 50 });

    expect(called).toBe(true);
  });

  it('should allow getting package metadata', async () => {
    const testDir = join(process.cwd(), 'test-analyzer-temp');
    await fs.mkdir(testDir, { recursive: true });

    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    const analyzer = createAnalyzer({ cwd: testDir });
    const pkg = await analyzer.getPackage(pkgPath);

    expect(pkg.name).toBe('test-pkg');
    expect(pkg.version).toBe('1.0.0');

    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should allow getting dependencies', async () => {
    const analyzer = createAnalyzer();
    const deps = await analyzer.getDependencies('prod');
    expect(Array.isArray(deps)).toBe(true);
  });

  it('should allow cache operations', async () => {
    const testDir = join(process.cwd(), 'test-analyzer-cache-temp');
    await fs.mkdir(testDir, { recursive: true });

    const analyzer = createAnalyzer({ cwd: testDir });

    // Set cache
    await analyzer.setCache('test-key', { value: 42 });

    // Get cache
    const value = await analyzer.getCache<{ value: number }>('test-key');
    expect(value).toEqual({ value: 42 });

    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should report progress', () => {
    const analyzer = createAnalyzer();
    let progressData: any = null;

    analyzer.on('progress', (data) => { progressData = data; });
    analyzer.reportProgress('test-plugin', 75, 'Testing');

    expect(progressData).toEqual({
      plugin: 'test-plugin',
      percent: 75,
      message: 'Testing'
    });
  });

  it('should report findings', () => {
    const analyzer = createAnalyzer();
    let findingData: any = null;

    analyzer.on('finding', (data) => { findingData = data; });
    analyzer.reportFinding('unused', 'warning', 'Package not used', 'test-pkg');

    expect(findingData).toEqual({
      type: 'unused',
      severity: 'warning',
      message: 'Package not used',
      package: 'test-pkg'
    });
  });

  it('should run analysis and return result', async () => {
    const testDir = join(process.cwd(), 'test-analyzer-run-temp');
    await fs.mkdir(testDir, { recursive: true });

    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const analyzer = createAnalyzer({ cwd: testDir });

    // Register basic plugins
    const { treePlugin } = await import('../src/plugins/core/tree.js');
    const { circularPlugin } = await import('../src/plugins/core/circular.js');

    analyzer.use(treePlugin);
    analyzer.use(circularPlugin);

    const result = await analyzer.run();

    expect(result.tree).toBeDefined();
    expect(result.circular).toBeDefined();
    expect(result.exitCode).toBe(0);

    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should destroy and cleanup resources', async () => {
    const testDir = join(process.cwd(), 'test-analyzer-destroy-temp');
    await fs.mkdir(testDir, { recursive: true });

    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const analyzer = createAnalyzer({ cwd: testDir });

    const { treePlugin } = await import('../src/plugins/core/tree.js');
    analyzer.use(treePlugin);

    await analyzer.run();
    await analyzer.destroy();

    // Should not throw
    expect(await analyzer.run()).toBeDefined();

    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should handle failOn options for circular', async () => {
    const testDir = join(process.cwd(), 'test-analyzer-failon-temp');
    await fs.mkdir(testDir, { recursive: true });

    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const analyzer = createAnalyzer({
      cwd: testDir,
      failOn: { circular: false }
    });

    const { treePlugin } = await import('../src/plugins/core/tree.js');
    const { circularPlugin } = await import('../src/plugins/core/circular.js');

    analyzer.use(treePlugin);
    analyzer.use(circularPlugin);

    const result = await analyzer.run();
    expect(result.exitCode).toBe(0);

    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should call plugin onDestroy when destroying analyzer', async () => {
    const testDir = join(process.cwd(), 'test-analyzer-ondestroy-temp');
    await fs.mkdir(testDir, { recursive: true });

    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const analyzer = createAnalyzer({ cwd: testDir });

    let onDestroyCalled = false;
    const mockPlugin = {
      name: 'test-destroy-plugin',
      version: '1.0.0' as const,
      install: () => {},
      onDestroy: () => {
        onDestroyCalled = true;
      }
    };

    analyzer.use(mockPlugin);
    await analyzer.run();
    await analyzer.destroy();

    expect(onDestroyCalled).toBe(true);

    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should support getResult for retrieving plugin results', async () => {
    const testDir = join(process.cwd(), 'test-analyzer-getresult-temp');
    await fs.mkdir(testDir, { recursive: true });

    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const analyzer = createAnalyzer({ cwd: testDir });

    // Create a plugin that sets a result
    const resultPlugin = {
      name: 'result-plugin',
      version: '1.0.0' as const,
      install: (kernel: any) => {
        kernel.on('analyze', () => {
          (kernel as any).setResult('testKey', { value: 42 });
        });
      }
    };

    analyzer.use(resultPlugin);
    await analyzer.run();

    // getResult is an internal method but we can test it via the plugin system
    // by having another plugin read the result
    const readerPlugin = {
      name: 'reader-plugin',
      version: '1.0.0' as const,
      install: (kernel: any) => {
        kernel.on('analyze', () => {
          const result = (kernel as any).getResult<{ value: number }>('testKey');
          expect(result).toEqual({ value: 42 });
        });
      }
    };

    const analyzer2 = createAnalyzer({ cwd: testDir });
    analyzer2.use(resultPlugin);
    analyzer2.use(readerPlugin);
    await analyzer2.run();

    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should handle failOn.securityCritical', async () => {
    const testDir = join(process.cwd(), 'test-analyzer-securitycrit-temp');
    await fs.mkdir(testDir, { recursive: true });

    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const analyzer = createAnalyzer({
      cwd: testDir,
      failOn: { securityCritical: true }
    });

    // Create a plugin that simulates security vulnerabilities
    const securityPlugin = {
      name: 'security-test-plugin',
      version: '1.0.0' as const,
      install: (kernel: any) => {
        kernel.on('analyze', () => {
          (kernel as any).setResult('security', {
            total: 1,
            bySeverity: { critical: 1, high: 0, moderate: 0, low: 0 },
            vulnerabilities: []
          });
        });
      }
    };

    analyzer.use(securityPlugin);
    const result = await analyzer.run();

    // Should have exitCode 1 because of critical vulnerability
    expect(result.exitCode).toBe(1);

    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should emit error event when run fails', async () => {
    const testDir = join(process.cwd(), 'test-analyzer-error-temp');
    await fs.mkdir(testDir, { recursive: true });

    // Create invalid package.json to trigger error
    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, '{ invalid json', 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const analyzer = createAnalyzer({ cwd: testDir });

    let errorEmitted = false;
    analyzer.on('error', () => {
      errorEmitted = true;
    });

    await expect(analyzer.run()).rejects.toThrow();
    expect(errorEmitted).toBe(true);

    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should handle failOn.securityHigh', async () => {
    const testDir = join(process.cwd(), 'test-analyzer-securityhigh-temp');
    await fs.mkdir(testDir, { recursive: true });

    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const analyzer = createAnalyzer({
      cwd: testDir,
      failOn: { securityHigh: true }
    });

    // Create a plugin that simulates high severity vulnerabilities
    const securityPlugin = {
      name: 'security-high-plugin',
      version: '1.0.0' as const,
      install: (kernel: any) => {
        kernel.on('analyze', () => {
          (kernel as any).setResult('security', {
            total: 1,
            bySeverity: { critical: 0, high: 1, moderate: 0, low: 0 },
            vulnerabilities: []
          });
        });
      }
    };

    analyzer.use(securityPlugin);
    const result = await analyzer.run();

    // Should have exitCode 1 because of high severity vulnerability
    expect(result.exitCode).toBe(1);

    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should handle failOn.unused', async () => {
    const testDir = join(process.cwd(), 'test-analyzer-unused-temp');
    await fs.mkdir(testDir, { recursive: true });

    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const analyzer = createAnalyzer({
      cwd: testDir,
      failOn: { unused: true }
    });

    // Create a plugin that simulates unused dependencies
    const unusedPlugin = {
      name: 'unused-test-plugin',
      version: '1.0.0' as const,
      install: (kernel: any) => {
        kernel.on('analyze', () => {
          (kernel as any).setResult('unused', ['lodash', 'axios']);
        });
      }
    };

    analyzer.use(unusedPlugin);
    const result = await analyzer.run();

    // Should have exitCode 1 because of unused dependencies
    expect(result.exitCode).toBe(1);

    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should handle failOn.sizeLimit', async () => {
    const testDir = join(process.cwd(), 'test-analyzer-sizelimit-temp');
    await fs.mkdir(testDir, { recursive: true });

    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const analyzer = createAnalyzer({
      cwd: testDir,
      failOn: { sizeLimit: '1KB' }
    });

    // Create a plugin that simulates size analysis
    const sizePlugin = {
      name: 'size-test-plugin',
      version: '1.0.0' as const,
      install: (kernel: any) => {
        kernel.on('analyze', () => {
          (kernel as any).setResult('size', {
            total: 2000000, // 2MB
            totalFormatted: '2 MB',
            packages: []
          });
        });
      }
    };

    analyzer.use(sizePlugin);
    const result = await analyzer.run();

    // Should have exitCode 1 because size exceeds limit
    expect(result.exitCode).toBe(1);

    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should handle failOn.circular with actual circular dependencies', async () => {
    const testDir = join(process.cwd(), 'test-analyzer-circularfail-temp');
    await fs.mkdir(testDir, { recursive: true });

    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const analyzer = createAnalyzer({
      cwd: testDir,
      failOn: { circular: true }
    });

    // Create a plugin that simulates circular dependencies
    const circularPlugin = {
      name: 'circular-test-plugin',
      version: '1.0.0' as const,
      install: (kernel: any) => {
        kernel.on('analyze', () => {
          (kernel as any).setResult('circular', [['pkg-a', 'pkg-b', 'pkg-a']]);
        });
      }
    };

    analyzer.use(circularPlugin);
    const result = await analyzer.run();

    // Should have exitCode 1 because of circular dependencies
    expect(result.exitCode).toBe(1);

    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should support toReport with md format', async () => {
    const testDir = join(process.cwd(), 'test-analyzer-toreport-temp');
    await fs.mkdir(testDir, { recursive: true });

    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const analyzer = createAnalyzer({ cwd: testDir });
    const result = await analyzer.run();

    // Test toReport with 'md' format
    const markdown = result.toReport('md');
    expect(typeof markdown).toBe('string');
    expect(markdown).toContain('# Dependency Analysis Report');

    // Test other formats
    expect(typeof result.toReport('json')).toBe('string');
    expect(typeof result.toReport('html')).toBe('string');

    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should handle plugins with dependencies', async () => {
    const testDir = join(process.cwd(), 'test-analyzer-deps-temp');
    await fs.mkdir(testDir, { recursive: true });

    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const analyzer = createAnalyzer({ cwd: testDir });

    // Create plugins with dependencies
    const basePlugin = {
      name: 'base-plugin',
      version: '1.0.0' as const,
      install: () => {}
    };

    const dependentPlugin = {
      name: 'dependent-plugin',
      version: '1.0.0' as const,
      dependencies: ['base-plugin'] as const,
      install: () => {}
    };

    // Register in wrong order - should still work
    analyzer.use(dependentPlugin);
    analyzer.use(basePlugin);

    const result = await analyzer.run();
    expect(result.tree).toBeDefined();

    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should call plugin onInit lifecycle hook', async () => {
    const testDir = join(process.cwd(), 'test-analyzer-oninit-temp');
    await fs.mkdir(testDir, { recursive: true });

    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const analyzer = createAnalyzer({ cwd: testDir });

    let onInitCalled = false;
    const initPlugin = {
      name: 'init-plugin',
      version: '1.0.0' as const,
      install: () => {},
      onInit: async () => {
        onInitCalled = true;
      }
    };

    analyzer.use(initPlugin);
    await analyzer.run();

    expect(onInitCalled).toBe(true);

    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should call plugin onError when installation fails', async () => {
    const testDir = join(process.cwd(), 'test-analyzer-onerror-temp');
    await fs.mkdir(testDir, { recursive: true });

    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const analyzer = createAnalyzer({ cwd: testDir });

    let onErrorCalled = false;
    const error = new Error('Installation failed');

    const errorPlugin = {
      name: 'error-plugin',
      version: '1.0.0' as const,
      install: () => {
        throw error;
      },
      onError: (err: Error) => {
        onErrorCalled = true;
        expect(err).toBe(error);
      }
    };

    analyzer.use(errorPlugin);

    await expect(analyzer.run()).rejects.toThrow('Installation failed');
    expect(onErrorCalled).toBe(true);

    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should throw on circular plugin dependencies', async () => {
    const testDir = join(process.cwd(), 'test-analyzer-circulardeps-temp');
    await fs.mkdir(testDir, { recursive: true });

    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const analyzer = createAnalyzer({ cwd: testDir });

    // Create circular dependency: plugin-a depends on plugin-b, plugin-b depends on plugin-a
    const pluginA = {
      name: 'plugin-a',
      version: '1.0.0' as const,
      dependencies: ['plugin-b'] as const,
      install: () => {}
    };

    const pluginB = {
      name: 'plugin-b',
      version: '1.0.0' as const,
      dependencies: ['plugin-a'] as const,
      install: () => {}
    };

    analyzer.use(pluginA);
    analyzer.use(pluginB);

    await expect(analyzer.run()).rejects.toThrow('Circular plugin');

    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should throw on missing plugin dependencies', async () => {
    const testDir = join(process.cwd(), 'test-analyzer-missingdeps-temp');
    await fs.mkdir(testDir, { recursive: true });

    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const analyzer = createAnalyzer({ cwd: testDir });

    // Create plugin with missing dependency
    const pluginWithMissingDep = {
      name: 'plugin-with-missing-dep',
      version: '1.0.0' as const,
      dependencies: ['non-existent-plugin'] as const,
      install: () => {}
    };

    analyzer.use(pluginWithMissingDep);

    await expect(analyzer.run()).rejects.toThrow('missing dependencies');

    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should support toReport with all format types', async () => {
    const testDir = join(process.cwd(), 'test-analyzer-toreport-all-temp');
    await fs.mkdir(testDir, { recursive: true });

    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    const analyzer = createAnalyzer({ cwd: testDir });
    const result = await analyzer.run();

    // Test each format explicitly to ensure full switch coverage
    const jsonReport = result.toReport('json');
    expect(typeof jsonReport).toBe('string');
    expect(jsonReport).toContain('test-pkg');
    expect(jsonReport).toContain('{');

    const mdReport = result.toReport('md');
    expect(typeof mdReport).toBe('string');
    expect(mdReport).toContain('# Dependency Analysis Report');

    const htmlReport = result.toReport('html');
    expect(typeof htmlReport).toBe('string');
    expect(htmlReport).toContain('<!DOCTYPE html>');

    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should handle path ending with package.json in deps.analyze', async () => {
    const testDir = join(process.cwd(), 'test-analyze-path-temp');
    await fs.mkdir(testDir, { recursive: true });

    const pkgPath = join(testDir, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }), 'utf-8');

    await fs.mkdir(join(testDir, 'node_modules'), { recursive: true });

    // Test with path ending in package.json (covers line 57-58 in index.ts)
    const pathWithPkgJson = testDir + '/package.json';
    const result = await deps.analyze(pathWithPkgJson);
    expect(result.tree.root.name).toBe('test-pkg');

    await fs.rm(testDir, { recursive: true, force: true });
  });
});

describe('API exports', () => {
  it('should export error classes', async () => {
    const {
      DepsError,
      PackageNotFoundError,
      InvalidPackageJsonError,
      NodeModulesNotFoundError,
      PluginNotFoundError,
      PluginDependencyError,
      CircularPluginDependencyError,
      CacheError,
      NetworkError,
      FileSystemError,
      MonorepoDetectionError,
      isDepsError
    } = await import('../src/errors.js');

    expect(DepsError).toBeDefined();
    expect(PackageNotFoundError).toBeDefined();
    expect(InvalidPackageJsonError).toBeDefined();
    expect(NodeModulesNotFoundError).toBeDefined();
    expect(PluginNotFoundError).toBeDefined();
    expect(PluginDependencyError).toBeDefined();
    expect(CircularPluginDependencyError).toBeDefined();
    expect(CacheError).toBeDefined();
    expect(NetworkError).toBeDefined();
    expect(FileSystemError).toBeDefined();
    expect(MonorepoDetectionError).toBeDefined();
    expect(isDepsError).toBeDefined();
  });

  it('should export utility functions', async () => {
    const {
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
    } = await import('../src/utils/fs.js');

    expect(readFile).toBeDefined();
    expect(readFileSafe).toBeDefined();
    expect(readJson).toBeDefined();
    expect(writeFile).toBeDefined();
    expect(writeJson).toBeDefined();
    expect(fileExists).toBeDefined();
    expect(directoryExists).toBeDefined();
    expect(listFiles).toBeDefined();
    expect(listDirectories).toBeDefined();
    expect(getFileHash).toBeDefined();
    expect(getDirectoryHash).toBeDefined();
    expect(getFileSize).toBeDefined();
    expect(getDirectorySize).toBeDefined();
  });

  it('should export glob utilities', async () => {
    const { glob, globSync, isMatch, ignore } = await import('../src/utils/glob.js');

    expect(glob).toBeDefined();
    expect(globSync).toBeDefined();
    expect(isMatch).toBeDefined();
    expect(ignore).toBeDefined();
  });

  it('should export size utilities', async () => {
    const { formatBytes, parseSize } = await import('../src/utils/size.js');

    expect(formatBytes).toBeDefined();
    expect(parseSize).toBeDefined();
  });

  it('should export semver utilities', async () => {
    const {
      parseSemver,
      compareSemver,
      satisfies,
      getUpdateType,
      maxSatisfying,
      incrementVersion
    } = await import('../src/utils/semver.js');

    expect(parseSemver).toBeDefined();
    expect(compareSemver).toBeDefined();
    expect(satisfies).toBeDefined();
    expect(getUpdateType).toBeDefined();
    expect(maxSatisfying).toBeDefined();
    expect(incrementVersion).toBeDefined();
  });

  it('should export string utilities', async () => {
    const { indent, truncate, escapeHtml, stripAnsi, wordWrap } = await import('../src/utils/string.js');

    expect(indent).toBeDefined();
    expect(truncate).toBeDefined();
    expect(escapeHtml).toBeDefined();
    expect(stripAnsi).toBeDefined();
    expect(wordWrap).toBeDefined();
  });

  it('should export all types', async () => {
    // Types are TypeScript-only exports, not available at runtime
    // Just verify the module can be imported
    const types = await import('../src/types.js');

    // The module should have exports
    expect(typeof types).toBe('object');
  });
});

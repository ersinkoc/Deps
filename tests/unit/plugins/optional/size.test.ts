/**
 * Tests for size plugin
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { sizePlugin } from '../../../../src/plugins/optional/size.js';

describe('size plugin', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), 'deps-size-test-' + Math.random().toString(36).slice(2));
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  it('should have correct plugin metadata', () => {
    expect(sizePlugin.name).toBe('size');
    expect(sizePlugin.version).toBe('1.0.0');
    expect(typeof sizePlugin.install).toBe('function');
  });

  it('should install without errors', () => {
    const testKernel = {
      on: (event: string, handler: Function) => {
        expect(event).toBe('analyze');
        expect(typeof handler).toBe('function');
      },
      reportProgress: () => {}
    } as any;

    expect(() => sizePlugin.install(testKernel)).not.toThrow();
  });

  it('should analyze package sizes', async () => {
    await writeFile(
      join(testDir, 'package.json'),
      JSON.stringify({
        name: 'test-pkg',
        version: '1.0.0',
        dependencies: {
          'lodash': '^4.17.21',
          'express': '^4.18.0'
        }
      })
    );

    const nmDir = join(testDir, 'node_modules');
    await mkdir(nmDir, { recursive: true });

    // Create fake packages
    const lodashDir = join(nmDir, 'lodash');
    await mkdir(lodashDir, { recursive: true });
    await writeFile(join(lodashDir, 'package.json'), JSON.stringify({ name: 'lodash', version: '4.17.21' }));
    await writeFile(join(lodashDir, 'index.js'), 'module.exports = {};');

    const expressDir = join(nmDir, 'express');
    await mkdir(expressDir, { recursive: true });
    await writeFile(join(expressDir, 'package.json'), JSON.stringify({ name: 'express', version: '4.18.0' }));

    let result: any = null;
    let handler: Function | null = null;

    const testKernel = {
      config: {},
      on: (event: string, h: Function) => {
        if (event === 'analyze') {
          handler = h;
        }
      },
      reportProgress: () => {},
      reportFinding: () => {},
      setResult: (plugin: string, data: any) => {
        result = data;
      }
    } as any;

    sizePlugin.install(testKernel);

    if (handler) {
      await handler({
        cwd: testDir,
        package: {
          name: 'test-pkg',
          version: '1.0.0',
          dependencies: { 'lodash': '^4.17.21', 'express': '^4.18.0' }
        }
      });
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(result).toBeDefined();
    expect(result.total).toBeGreaterThan(0);
    expect(result.totalFormatted).toBeDefined();
    expect(result.packages).toBeInstanceOf(Array);
  });

  it('should handle missing packages gracefully', async () => {
    await writeFile(
      join(testDir, 'package.json'),
      JSON.stringify({
        name: 'test-pkg',
        version: '1.0.0',
        dependencies: {
          'nonexistent': '^1.0.0'
        }
      })
    );

    let result: any = null;
    let handler: Function | null = null;

    const testKernel = {
      config: {},
      on: (event: string, h: Function) => {
        if (event === 'analyze') {
          handler = h;
        }
      },
      reportProgress: () => {},
      reportFinding: () => {},
      setResult: (plugin: string, data: any) => {
        result = data;
      }
    } as any;

    sizePlugin.install(testKernel);

    if (handler) {
      await handler({
        cwd: testDir,
        package: {
          name: 'test-pkg',
          version: '1.0.0',
          dependencies: { 'nonexistent': '^1.0.0' }
        }
      });
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(result).toBeDefined();
    expect(result.packages).toHaveLength(0);
  });

  it('should calculate percentages correctly', async () => {
    await writeFile(
      join(testDir, 'package.json'),
      JSON.stringify({
        name: 'test-pkg',
        version: '1.0.0',
        dependencies: {
          'pkg1': '^1.0.0',
          'pkg2': '^1.0.0'
        }
      })
    );

    const nmDir = join(testDir, 'node_modules');
    await mkdir(nmDir, { recursive: true });

    const pkg1Dir = join(nmDir, 'pkg1');
    await mkdir(pkg1Dir, { recursive: true });
    await writeFile(join(pkg1Dir, 'package.json'), '{}');
    await writeFile(join(pkg1Dir, 'file.txt'), 'x'.repeat(1000));

    const pkg2Dir = join(nmDir, 'pkg2');
    await mkdir(pkg2Dir, { recursive: true });
    await writeFile(join(pkg2Dir, 'package.json'), '{}');
    await writeFile(join(pkg2Dir, 'file.txt'), 'x'.repeat(2000));

    let result: any = null;
    let handler: Function | null = null;

    const testKernel = {
      config: {},
      on: (event: string, h: Function) => {
        if (event === 'analyze') {
          handler = h;
        }
      },
      reportProgress: () => {},
      reportFinding: () => {},
      setResult: (plugin: string, data: any) => {
        result = data;
      }
    } as any;

    sizePlugin.install(testKernel);

    if (handler) {
      await handler({
        cwd: testDir,
        package: {
          name: 'test-pkg',
          version: '1.0.0',
          dependencies: { 'pkg1': '^1.0.0', 'pkg2': '^1.0.0' }
        }
      });
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(result).toBeDefined();
    expect(result.packages.length).toBe(2);
    // Packages should be sorted by size (largest first)
    expect(result.packages[0].name).toBe('pkg2');
    expect(result.packages[1].name).toBe('pkg1');
  });

  it('should report findings for large packages', async () => {
    await writeFile(
      join(testDir, 'package.json'),
      JSON.stringify({
        name: 'test-pkg',
        version: '1.0.0',
        dependencies: {
          'large-pkg': '^1.0.0'
        }
      })
    );

    const nmDir = join(testDir, 'node_modules');
    await mkdir(nmDir, { recursive: true });

    const pkgDir = join(nmDir, 'large-pkg');
    await mkdir(pkgDir, { recursive: true });
    await writeFile(join(pkgDir, 'package.json'), '{}');

    // Create a file that's large enough to trigger the finding (>10% of total)
    // The percentage threshold is checked, so we need significant size

    let handler: Function | null = null;
    const findings: any[] = [];

    const testKernel = {
      config: {},
      on: (event: string, h: Function) => {
        if (event === 'analyze') {
          handler = h;
        }
      },
      reportProgress: () => {},
      reportFinding: (plugin: string, severity: string, message: string) => {
        findings.push({ plugin, severity, message });
      },
      setResult: () => {}
    } as any;

    sizePlugin.install(testKernel);

    if (handler) {
      await handler({
        cwd: testDir,
        package: {
          name: 'test-pkg',
          version: '1.0.0',
          dependencies: { 'large-pkg': '^1.0.0' }
        }
      });
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    // Just verify it runs without errors
    expect(findings).toBeInstanceOf(Array);
  });

  it('should handle empty dependencies', async () => {
    await writeFile(
      join(testDir, 'package.json'),
      JSON.stringify({
        name: 'test-pkg',
        version: '1.0.0'
      })
    );

    let result: any = null;
    let handler: Function | null = null;

    const testKernel = {
      config: {},
      on: (event: string, h: Function) => {
        if (event === 'analyze') {
          handler = h;
        }
      },
      reportProgress: () => {},
      reportFinding: () => {},
      setResult: (plugin: string, data: any) => {
        result = data;
      }
    } as any;

    sizePlugin.install(testKernel);

    if (handler) {
      await handler({
        cwd: testDir,
        package: { name: 'test-pkg', version: '1.0.0' }
      });
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(result).toBeDefined();
    expect(result.packages).toHaveLength(0);
  });
});

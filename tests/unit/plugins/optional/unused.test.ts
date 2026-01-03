/**
 * Tests for unused plugin
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { unusedPlugin } from '../../../../src/plugins/optional/unused.js';

describe('unused plugin', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), 'deps-unused-test-' + Math.random().toString(36).slice(2));
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
    expect(unusedPlugin.name).toBe('unused');
    expect(unusedPlugin.version).toBe('1.0.0');
    expect(typeof unusedPlugin.install).toBe('function');
  });

  it('should install without errors', () => {
    const testKernel = {
      on: (event: string, handler: Function) => {
        expect(event).toBe('analyze');
        expect(typeof handler).toBe('function');
      },
      reportProgress: () => {}
    } as any;

    expect(() => unusedPlugin.install(testKernel)).not.toThrow();
  });

  it('should detect unused dependencies', async () => {
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

    await mkdir(join(testDir, 'src'), { recursive: true });
    await writeFile(
      join(testDir, 'src/index.js'),
      `import express from 'express';
import fs from 'fs';`
    );

    let result: any = null;
    let handler: Function | null = null;

    const testKernel = {
      config: { ignore: [] },
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

    unusedPlugin.install(testKernel);

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
    expect(result).toContain('lodash');
    expect(result).not.toContain('express');
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
      config: { ignore: [] },
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

    unusedPlugin.install(testKernel);

    if (handler) {
      await handler({
        cwd: testDir,
        package: { name: 'test-pkg', version: '1.0.0' }
      });
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(result).toBeDefined();
    expect(result).toHaveLength(0);
  });

  it('should ignore built-in modules', async () => {
    await writeFile(
      join(testDir, 'package.json'),
      JSON.stringify({
        name: 'test-pkg',
        version: '1.0.0',
        dependencies: {}
      })
    );

    await mkdir(join(testDir, 'src'), { recursive: true });
    await writeFile(
      join(testDir, 'src/index.js'),
      `import fs from 'fs';
import path from 'path';`
    );

    let result: any = null;
    let handler: Function | null = null;

    const testKernel = {
      config: { ignore: [] },
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

    unusedPlugin.install(testKernel);

    if (handler) {
      await handler({
        cwd: testDir,
        package: { name: 'test-pkg', version: '1.0.0' }
      });
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(result).toBeDefined();
    expect(result).toHaveLength(0);
  });

  it('should detect all import types', async () => {
    await writeFile(
      join(testDir, 'package.json'),
      JSON.stringify({
        name: 'test-pkg',
        version: '1.0.0',
        dependencies: {
          'unused-es6': '^1.0.0',
          'unused-cjs': '^1.0.0',
          'unused-dynamic': '^1.0.0',
          'used-pkg': '^1.0.0'
        }
      })
    );

    await mkdir(join(testDir, 'src'), { recursive: true });
    await writeFile(
      join(testDir, 'src/index.js'),
      `import { foo } from 'used-pkg';
const bar = require('used-pkg');
import('used-pkg').then(() => {});`
    );

    let result: any = null;
    let handler: Function | null = null;

    const testKernel = {
      config: { ignore: [] },
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

    unusedPlugin.install(testKernel);

    if (handler) {
      await handler({
        cwd: testDir,
        package: {
          name: 'test-pkg',
          version: '1.0.0',
          dependencies: {
            'unused-es6': '^1.0.0',
            'unused-cjs': '^1.0.0',
            'unused-dynamic': '^1.0.0',
            'used-pkg': '^1.0.0'
          }
        }
      });
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(result).toBeDefined();
    expect(result).toContain('unused-es6');
    expect(result).toContain('unused-cjs');
    expect(result).toContain('unused-dynamic');
    expect(result).not.toContain('used-pkg');
  });

  it('should report findings', async () => {
    await writeFile(
      join(testDir, 'package.json'),
      JSON.stringify({
        name: 'test-pkg',
        version: '1.0.0',
        dependencies: {
          'unused-package': '^1.0.0'
        }
      })
    );

    await mkdir(join(testDir, 'src'), { recursive: true });
    await writeFile(
      join(testDir, 'src/index.js'),
      `console.log('hello');`
    );

    const findings: any[] = [];
    let handler: Function | null = null;

    const testKernel = {
      config: { ignore: [] },
      on: (event: string, h: Function) => {
        if (event === 'analyze') {
          handler = h;
        }
      },
      reportProgress: () => {},
      reportFinding: (plugin: string, severity: string, message: string, pkg?: string) => {
        findings.push({ plugin, severity, message, pkg });
      },
      setResult: () => {}
    } as any;

    unusedPlugin.install(testKernel);

    if (handler) {
      await handler({
        cwd: testDir,
        package: {
          name: 'test-pkg',
          version: '1.0.0',
          dependencies: { 'unused-package': '^1.0.0' }
        }
      });
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].plugin).toBe('unused');
    expect(findings[0].severity).toBe('warning');
  });

  it('should handle scoped packages', async () => {
    await writeFile(
      join(testDir, 'package.json'),
      JSON.stringify({
        name: 'test-pkg',
        version: '1.0.0',
        dependencies: {
          '@scope/unused': '^1.0.0'
        }
      })
    );

    await mkdir(join(testDir, 'src'), { recursive: true });
    await writeFile(
      join(testDir, 'src/index.js'),
      `console.log('hello');`
    );

    let result: any = null;
    let handler: Function | null = null;

    const testKernel = {
      config: { ignore: [] },
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

    unusedPlugin.install(testKernel);

    if (handler) {
      await handler({
        cwd: testDir,
        package: {
          name: 'test-pkg',
          version: '1.0.0',
          dependencies: { '@scope/unused': '^1.0.0' }
        }
      });
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(result).toBeDefined();
    expect(result).toContain('@scope/unused');
  });

  it('should ignore relative imports', async () => {
    await writeFile(
      join(testDir, 'package.json'),
      JSON.stringify({
        name: 'test-pkg',
        version: '1.0.0',
        dependencies: {
          'unused': '^1.0.0'
        }
      })
    );

    await mkdir(join(testDir, 'src'), { recursive: true });
    await writeFile(
      join(testDir, 'src/index.js'),
      `import foo from './foo.js';
import bar from '../bar.js';`
    );

    let result: any = null;
    let handler: Function | null = null;

    const testKernel = {
      config: { ignore: [] },
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

    unusedPlugin.install(testKernel);

    if (handler) {
      await handler({
        cwd: testDir,
        package: {
          name: 'test-pkg',
          version: '1.0.0',
          dependencies: { 'unused': '^1.0.0' }
        }
      });
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(result).toBeDefined();
    expect(result).toContain('unused');
  });
});

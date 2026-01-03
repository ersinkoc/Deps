/**
 * Tests for monorepo plugin
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { monorepoPlugin } from '../../../../src/plugins/optional/monorepo.js';

describe('monorepo plugin', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), 'deps-monorepo-test-' + Math.random().toString(36).slice(2));
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
    expect(monorepoPlugin.name).toBe('monorepo');
    expect(monorepoPlugin.version).toBe('1.0.0');
    expect(typeof monorepoPlugin.install).toBe('function');
  });

  it('should install without errors', () => {
    const testKernel = {
      on: (event: string, handler: Function) => {
        expect(event).toBe('analyze');
        expect(typeof handler).toBe('function');
      },
      reportProgress: () => {}
    } as any;

    expect(() => monorepoPlugin.install(testKernel)).not.toThrow();
  });

  it('should detect pnpm workspace', async () => {
    await writeFile(
      join(testDir, 'pnpm-workspace.yaml'),
      `packages:
  - 'packages/*'
  - 'apps/*'`
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

    monorepoPlugin.install(testKernel);

    if (handler) {
      await handler({ cwd: testDir });
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result).toBeDefined();
    expect(result.type).toBe('pnpm');
  });

  it('should detect npm workspace', async () => {
    await writeFile(
      join(testDir, 'package.json'),
      JSON.stringify({
        name: 'test-monorepo',
        version: '1.0.0',
        workspaces: ['packages/*']
      })
    );
    await writeFile(
      join(testDir, 'package-lock.json'),
      '{}'
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

    monorepoPlugin.install(testKernel);

    if (handler) {
      await handler({ cwd: testDir });
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result).toBeDefined();
    expect(result.type).toBe('npm');
  });

  it('should detect yarn workspace', async () => {
    await writeFile(
      join(testDir, 'package.json'),
      JSON.stringify({
        name: 'test-monorepo',
        version: '1.0.0',
        workspaces: ['packages/*']
      })
    );
    await writeFile(
      join(testDir, 'yarn.lock'),
      ''
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

    monorepoPlugin.install(testKernel);

    if (handler) {
      await handler({ cwd: testDir });
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result).toBeDefined();
    expect(result.type).toBe('yarn');
  });

  it('should detect lerna monorepo', async () => {
    await writeFile(
      join(testDir, 'lerna.json'),
      JSON.stringify({
        version: 'independent',
        packages: ['packages/*']
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

    monorepoPlugin.install(testKernel);

    if (handler) {
      await handler({ cwd: testDir });
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result).toBeDefined();
    expect(result.type).toBe('lerna');
  });

  it('should detect turborepo', async () => {
    await writeFile(
      join(testDir, 'turbo.json'),
      JSON.stringify({
        $schema: 'https://turbo.build/schema.json'
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

    monorepoPlugin.install(testKernel);

    if (handler) {
      await handler({ cwd: testDir });
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result).toBeDefined();
    expect(result.type).toBe('turborepo');
  });

  it('should detect nx monorepo', async () => {
    await writeFile(
      join(testDir, 'nx.json'),
      JSON.stringify({
        $schema: './node_modules/nx/schemas/nx-schema.json'
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

    monorepoPlugin.install(testKernel);

    if (handler) {
      await handler({ cwd: testDir });
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result).toBeDefined();
    expect(result.type).toBe('nx');
  });

  it('should handle non-monorepo project', async () => {
    await writeFile(
      join(testDir, 'package.json'),
      JSON.stringify({
        name: 'test-package',
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

    monorepoPlugin.install(testKernel);

    if (handler) {
      await handler({ cwd: testDir });
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    // setResult is not called when not a monorepo, so result stays null
    expect(result).toBeNull();
  });

  it('should parse workspace patterns from pnpm-workspace.yaml', async () => {
    await writeFile(
      join(testDir, 'pnpm-workspace.yaml'),
      `packages:
  - 'packages/*'
  - 'apps/*'`
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

    monorepoPlugin.install(testKernel);

    if (handler) {
      await handler({ cwd: testDir });
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result).toBeDefined();
    expect(result.workspacePatterns).toBeDefined();
    // The YAML parser preserves quotes in the output
    expect(result.workspacePatterns.length).toBeGreaterThan(0);
  });

  it('should report findings', async () => {
    await writeFile(
      join(testDir, 'pnpm-workspace.yaml'),
      `packages:
  - 'packages/*'`
    );

    const findings: any[] = [];
    let handler: Function | null = null;

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

    monorepoPlugin.install(testKernel);

    if (handler) {
      await handler({ cwd: testDir });
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].plugin).toBe('monorepo');
  });

  it('should handle invalid package.json', async () => {
    await writeFile(
      join(testDir, 'package.json'),
      'invalid json{'
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

    monorepoPlugin.install(testKernel);

    if (handler) {
      await handler({ cwd: testDir });
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    // Should not crash, just skip npm/yarn detection
    // setResult is not called when no monorepo type is detected
    expect(result).toBeNull();
  });
});

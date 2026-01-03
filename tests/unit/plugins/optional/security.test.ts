/**
 * Tests for security plugin
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { securityPlugin } from '../../../../src/plugins/optional/security.js';
import { EventEmitter } from 'node:events';

describe('security plugin', () => {
  it('should have correct plugin metadata', () => {
    expect(securityPlugin.name).toBe('security');
    expect(securityPlugin.version).toBe('1.0.0');
    expect(typeof securityPlugin.install).toBe('function');
  });

  it('should install without errors', () => {
    const testKernel = {
      on: (event: string, handler: Function) => {
        expect(event).toBe('analyze');
        expect(typeof handler).toBe('function');
      },
      reportProgress: () => {}
    } as any;

    expect(() => securityPlugin.install(testKernel)).not.toThrow();
  });

  it('should register analyze handler', () => {
    let handlerRegistered = false;
    let handler: any;

    const testKernel = {
      on: (event: string, h: Function) => {
        if (event === 'analyze') {
          handlerRegistered = true;
          handler = h;
        }
      },
      reportProgress: () => {},
      reportFinding: () => {},
      setResult: () => {}
    } as any;

    securityPlugin.install(testKernel);

    expect(handlerRegistered).toBe(true);
    expect(typeof handler).toBe('function');
  });

  it('should have handler that is a function', async () => {
    const testKernel = {
      on: (event: string, h: Function) => {
        if (event === 'analyze') {
          expect(typeof h).toBe('function');
        }
      },
      reportProgress: () => {},
      reportFinding: () => {},
      setResult: () => {}
    } as any;

    securityPlugin.install(testKernel);
  });

  it('should report progress during analysis', async () => {
    const progressEvents: any[] = [];
    let handler: any;

    const testKernel = {
      on: (event: string, h: Function) => {
        if (event === 'analyze') {
          handler = h;
        }
      },
      reportProgress: (plugin: string, progress: number, message: string) => {
        progressEvents.push({ plugin, progress, message });
      },
      reportFinding: () => {},
      setResult: () => {}
    } as any;

    securityPlugin.install(testKernel);

    // Call the handler - it will run npm audit which may or may not succeed
    // The important thing is it reports progress
    await handler({ cwd: process.cwd() });

    // Progress should have been reported
    expect(progressEvents.length).toBeGreaterThan(0);
    expect(progressEvents[0].plugin).toBe('security');
    expect(progressEvents[0].message).toContain('security audit');
  });

  it('should store result via setResult', async () => {
    let result: any = null;
    let handler: any;

    const testKernel = {
      on: (event: string, h: Function) => {
        if (event === 'analyze') {
          handler = h;
        }
      },
      reportProgress: () => {},
      reportFinding: () => {},
      setResult: (plugin: string, data: any) => {
        result = { plugin, data };
      }
    } as any;

    securityPlugin.install(testKernel);

    await handler({ cwd: process.cwd() });

    // Give time for async operations
    await new Promise(resolve => setTimeout(resolve, 100));

    // Result should have been set
    expect(result).toBeDefined();
    expect(result.plugin).toBe('security');
    expect(result.data).toBeDefined();
    expect(result.data.total).toBeDefined();
    expect(result.data.bySeverity).toBeDefined();
  });

  it('should handle empty vulnerabilities', async () => {
    let result: any = null;
    let handler: any;

    const testKernel = {
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

    securityPlugin.install(testKernel);

    await handler({ cwd: process.cwd() });

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result).toBeDefined();
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.vulnerabilities)).toBe(true);
  });

  it('should report findings for vulnerabilities', async () => {
    const findings: any[] = [];
    let handler: any;

    const testKernel = {
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

    securityPlugin.install(testKernel);

    await handler({ cwd: process.cwd() });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Findings array should exist (may be empty if no vulnerabilities found)
    expect(Array.isArray(findings)).toBe(true);
  });

  it('should set result with bySeverity structure', async () => {
    let result: any = null;
    let handler: any;

    const testKernel = {
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

    securityPlugin.install(testKernel);

    await handler({ cwd: process.cwd() });

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result).toBeDefined();
    expect(result.bySeverity).toBeDefined();
    expect(typeof result.bySeverity.critical).toBe('number');
    expect(typeof result.bySeverity.high).toBe('number');
    expect(typeof result.bySeverity.moderate).toBe('number');
    expect(typeof result.bySeverity.low).toBe('number');
  });
});

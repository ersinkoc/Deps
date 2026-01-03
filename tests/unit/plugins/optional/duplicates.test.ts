/**
 * Tests for duplicates plugin
 */

import { describe, it, expect } from 'vitest';
import { duplicatesPlugin } from '../../../../src/plugins/optional/duplicates.js';

describe('duplicates plugin', () => {
  it('should have correct plugin metadata', () => {
    expect(duplicatesPlugin.name).toBe('duplicates');
    expect(duplicatesPlugin.version).toBe('1.0.0');
    expect(typeof duplicatesPlugin.install).toBe('function');
  });

  it('should install without errors', () => {
    const testKernel = {
      on: (event: string, handler: Function) => {
        expect(event).toBe('analyze');
        expect(typeof handler).toBe('function');
      },
      reportProgress: (plugin: string, progress: number, message: string) => {
        // Mock reportProgress
      }
    } as any;

    expect(() => duplicatesPlugin.install(testKernel)).not.toThrow();
  });

  it('should register analyze handler', async () => {
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

    duplicatesPlugin.install(testKernel);
    expect(handlerRegistered).toBe(true);
    expect(typeof handler).toBe('function');
  });
});

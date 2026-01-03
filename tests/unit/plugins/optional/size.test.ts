/**
 * Tests for size plugin
 */

import { describe, it, expect } from 'vitest';
import { sizePlugin } from '../../../../src/plugins/optional/size.js';

describe('size plugin', () => {
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
      reportProgress: (plugin: string, progress: number, message: string) => {
        // Mock reportProgress
      }
    } as any;

    expect(() => sizePlugin.install(testKernel)).not.toThrow();
  });
});

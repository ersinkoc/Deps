/**
 * Tests for unused plugin
 */

import { describe, it, expect } from 'vitest';
import { unusedPlugin } from '../../../../src/plugins/optional/unused.js';

describe('unused plugin', () => {
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
      reportProgress: (plugin: string, progress: number, message: string) => {
        // Mock reportProgress
      }
    } as any;

    expect(() => unusedPlugin.install(testKernel)).not.toThrow();
  });
});

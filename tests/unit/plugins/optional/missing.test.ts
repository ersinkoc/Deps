/**
 * Tests for missing plugin
 */

import { describe, it, expect } from 'vitest';
import { missingPlugin } from '../../../../src/plugins/optional/missing.js';

describe('missing plugin', () => {
  it('should have correct plugin metadata', () => {
    expect(missingPlugin.name).toBe('missing');
    expect(missingPlugin.version).toBe('1.0.0');
    expect(typeof missingPlugin.install).toBe('function');
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

    expect(() => missingPlugin.install(testKernel)).not.toThrow();
  });
});

/**
 * Tests for updates plugin
 */

import { describe, it, expect } from 'vitest';
import { updatesPlugin } from '../../../../src/plugins/optional/updates.js';

describe('updates plugin', () => {
  it('should have correct plugin metadata', () => {
    expect(updatesPlugin.name).toBe('updates');
    expect(updatesPlugin.version).toBe('1.0.0');
    expect(typeof updatesPlugin.install).toBe('function');
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

    expect(() => updatesPlugin.install(testKernel)).not.toThrow();
  });
});

/**
 * Tests for monorepo plugin
 */

import { describe, it, expect } from 'vitest';
import { monorepoPlugin } from '../../../../src/plugins/optional/monorepo.js';

describe('monorepo plugin', () => {
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
      reportProgress: (plugin: string, progress: number, message: string) => {
        // Mock reportProgress
      }
    } as any;

    expect(() => monorepoPlugin.install(testKernel)).not.toThrow();
  });
});

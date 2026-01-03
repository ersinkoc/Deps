/**
 * Tests for security plugin
 */

import { describe, it, expect } from 'vitest';
import { securityPlugin } from '../../../../src/plugins/optional/security.js';

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
      reportProgress: (plugin: string, progress: number, message: string) => {
        // Mock reportProgress
      }
    } as any;

    expect(() => securityPlugin.install(testKernel)).not.toThrow();
  });
});

/**
 * Tests for plugin exports
 */

import { describe, it, expect } from 'vitest';
import { treePlugin } from '../src/plugins/core/tree.js';
import { circularPlugin } from '../src/plugins/core/circular.js';
import { unusedPlugin } from '../src/plugins/optional/unused.js';
import { missingPlugin } from '../src/plugins/optional/missing.js';
import { duplicatesPlugin } from '../src/plugins/optional/duplicates.js';
import { sizePlugin } from '../src/plugins/optional/size.js';
import { updatesPlugin } from '../src/plugins/optional/updates.js';
import { securityPlugin } from '../src/plugins/optional/security.js';
import { monorepoPlugin } from '../src/plugins/optional/monorepo.js';

describe('plugin exports', () => {
  it('should export core plugins with correct metadata', () => {
    expect(treePlugin.name).toBe('tree');
    expect(treePlugin.version).toBe('1.0.0');
    expect(typeof treePlugin.install).toBe('function');

    expect(circularPlugin.name).toBe('circular');
    expect(circularPlugin.version).toBe('1.0.0');
    expect(typeof circularPlugin.install).toBe('function');
  });

  it('should export optional plugins with correct metadata', () => {
    expect(unusedPlugin.name).toBe('unused');
    expect(unusedPlugin.version).toBe('1.0.0');

    expect(missingPlugin.name).toBe('missing');
    expect(missingPlugin.version).toBe('1.0.0');

    expect(duplicatesPlugin.name).toBe('duplicates');
    expect(duplicatesPlugin.version).toBe('1.0.0');

    expect(sizePlugin.name).toBe('size');
    expect(sizePlugin.version).toBe('1.0.0');

    expect(updatesPlugin.name).toBe('updates');
    expect(updatesPlugin.version).toBe('1.0.0');

    expect(securityPlugin.name).toBe('security');
    expect(securityPlugin.version).toBe('1.0.0');

    expect(monorepoPlugin.name).toBe('monorepo');
    expect(monorepoPlugin.version).toBe('1.0.0');
  });
});

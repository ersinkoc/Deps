/**
 * Tests for plugin index exports
 */

import { describe, it, expect } from 'vitest';
import * as plugins from '../../src/plugins/index.js';

describe('plugin index exports', () => {
  it('should export treePlugin', () => {
    expect(plugins.treePlugin).toBeDefined();
    expect(plugins.treePlugin.name).toBe('tree');
  });

  it('should export circularPlugin', () => {
    expect(plugins.circularPlugin).toBeDefined();
    expect(plugins.circularPlugin.name).toBe('circular');
  });

  it('should export unusedPlugin', () => {
    expect(plugins.unusedPlugin).toBeDefined();
    expect(plugins.unusedPlugin.name).toBe('unused');
  });

  it('should export missingPlugin', () => {
    expect(plugins.missingPlugin).toBeDefined();
    expect(plugins.missingPlugin.name).toBe('missing');
  });

  it('should export duplicatesPlugin', () => {
    expect(plugins.duplicatesPlugin).toBeDefined();
    expect(plugins.duplicatesPlugin.name).toBe('duplicates');
  });

  it('should export sizePlugin', () => {
    expect(plugins.sizePlugin).toBeDefined();
    expect(plugins.sizePlugin.name).toBe('size');
  });

  it('should export updatesPlugin', () => {
    expect(plugins.updatesPlugin).toBeDefined();
    expect(plugins.updatesPlugin.name).toBe('updates');
  });

  it('should export securityPlugin', () => {
    expect(plugins.securityPlugin).toBeDefined();
    expect(plugins.securityPlugin.name).toBe('security');
  });

  it('should export monorepoPlugin', () => {
    expect(plugins.monorepoPlugin).toBeDefined();
    expect(plugins.monorepoPlugin.name).toBe('monorepo');
  });
});

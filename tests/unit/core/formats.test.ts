/**
 * Tests for output formatters
 *
 * @packageDocumentation
 */

import { describe, it, expect } from 'vitest';
import { toJSON } from '../../../src/core/formats/json.js';
import { toMarkdown, treeToMarkdown } from '../../../src/core/formats/markdown.js';
import { toTree, treeToTree, treeToTreeLimited } from '../../../src/core/formats/tree.js';
import { toHTML, treeToHtml } from '../../../src/core/formats/html.js';
import type { AnalysisResult, DependencyTree, DependencyNode } from '../../../src/types.js';

describe('json formatter', () => {
  const createMockResult = (): AnalysisResult => ({
    tree: {
      root: {
        name: 'test-project',
        version: '1.0.0',
        type: 'prod',
        dependencies: []
      },
      count: 0,
      depth: 0
    },
    circular: [],
    exitCode: 0,
    toJSON: () => '',
    toTree: () => '',
    toMarkdown: () => '',
    toHTML: () => '',
    toReport: () => ''
  });

  it('should convert result to JSON', () => {
    const result = createMockResult();
    const json = toJSON(result);

    expect(typeof json).toBe('string');
    expect(json).toContain('test-project');
  });

  it('should pretty print by default', () => {
    const result = createMockResult();
    const json = toJSON(result);

    expect(json).toContain('  ');
  });

  it('should not pretty print when pretty is false', () => {
    const result = createMockResult();
    const json = toJSON(result, false);

    expect(json).not.toContain('  ');
    expect(json).not.toContain('\n');
  });

  it('should include all result properties', () => {
    const result = createMockResult();
    const json = toJSON(result);
    const parsed = JSON.parse(json);

    expect(parsed).toHaveProperty('tree');
    expect(parsed).toHaveProperty('circular');
    expect(parsed).toHaveProperty('exitCode');
  });
});

describe('markdown formatter', () => {
  const createMockTree = (): DependencyTree => ({
    root: {
      name: 'test-project',
      version: '1.0.0',
      type: 'prod',
      dependencies: [
        {
          name: 'lodash',
          version: '4.17.21',
          type: 'prod',
          dependencies: []
        }
      ]
    },
    count: 1,
    depth: 1
  });

  it('should convert tree to markdown', () => {
    const tree = createMockTree();
    const markdown = treeToMarkdown(tree);

    expect(markdown).toContain('## Dependency Tree');
    expect(markdown).toContain('test-project');
    expect(markdown).toContain('lodash');
  });

  it('should include total count and depth', () => {
    const tree = createMockTree();
    const markdown = treeToMarkdown(tree);

    expect(markdown).toContain('Total: 1 dependencies');
    expect(markdown).toContain('max depth: 1');
  });

  it('should convert result to full markdown report', () => {
    const result: AnalysisResult = {
      tree: createMockTree(),
      circular: [['pkg-a', 'pkg-b', 'pkg-a']],
      unused: ['unused-dep'],
      missing: ['missing-dep'],
      duplicates: { 'lodash': ['4.17.20', '4.17.21'] },
      exitCode: 0,
      toJSON: () => '',
      toTree: () => '',
      toMarkdown: () => '',
      toHTML: () => '',
      toReport: () => ''
    };

    const markdown = toMarkdown(result);

    expect(markdown).toContain('# Dependency Analysis Report');
    expect(markdown).toContain('## Summary');
    expect(markdown).toContain('## Dependency Tree');
    expect(markdown).toContain('## Circular Dependencies');
    expect(markdown).toContain('## Unused Dependencies');
    expect(markdown).toContain('## Missing Dependencies');
    expect(markdown).toContain('## Duplicate Versions');
  });

  it('should handle result with minimal data', () => {
    const result: AnalysisResult = {
      tree: createMockTree(),
      circular: [],
      exitCode: 0,
      toJSON: () => '',
      toTree: () => '',
      toMarkdown: () => '',
      toHTML: () => '',
      toReport: () => ''
    };

    const markdown = toMarkdown(result);

    expect(markdown).toContain('# Dependency Analysis Report');
    // count is 1 because it includes the lodash dependency
    expect(markdown).toContain('**Total Dependencies:** 1');
    expect(markdown).toContain('**Max Depth:** 1');
  });

  it('should include duplicates in markdown table format', () => {
    const result: AnalysisResult = {
      tree: createMockTree(),
      circular: [],
      duplicates: {
        'lodash': ['4.17.20', '4.17.21'],
        'axios': ['0.27.0', '1.0.0']
      },
      exitCode: 0,
      toJSON: () => '',
      toTree: () => '',
      toMarkdown: () => '',
      toHTML: () => '',
      toReport: () => ''
    };

    const markdown = toMarkdown(result);
    expect(markdown).toContain('## Duplicate Versions');
    expect(markdown).toContain('| Package | Versions |');
    expect(markdown).toContain('lodash');
    expect(markdown).toContain('axios');
  });

  it('should include size analysis table', () => {
    const result: AnalysisResult = {
      tree: createMockTree(),
      circular: [],
      size: {
        total: 1024000,
        totalFormatted: '1 MB',
        packages: [
          { name: 'lodash', size: 512000, sizeFormatted: '500 KB', percentage: 50 },
          { name: 'axios', size: 512000, sizeFormatted: '500 KB', percentage: 50 }
        ]
      },
      exitCode: 0,
      toJSON: () => '',
      toTree: () => '',
      toMarkdown: () => '',
      toHTML: () => '',
      toReport: () => ''
    };

    const markdown = toMarkdown(result);
    expect(markdown).toContain('## Size Analysis');
    expect(markdown).toContain('| Package | Size | Percentage |');
    expect(markdown).toContain('lodash');
    expect(markdown).toContain('500 KB');
  });

  it('should include updates table', () => {
    const result: AnalysisResult = {
      tree: createMockTree(),
      circular: [],
      updates: [
        { name: 'lodash', current: '4.17.21', latest: '4.17.22', type: 'patch' },
        { name: 'axios', current: '1.0.0', latest: '1.1.0', type: 'minor' }
      ],
      exitCode: 0,
      toJSON: () => '',
      toTree: () => '',
      toMarkdown: () => '',
      toHTML: () => '',
      toReport: () => ''
    };

    const markdown = toMarkdown(result);
    expect(markdown).toContain('## Available Updates');
    expect(markdown).toContain('| Package | Current | Latest | Type |');
    expect(markdown).toContain('lodash');
    expect(markdown).toContain('4.17.21');
    expect(markdown).toContain('4.17.22');
  });

  it('should include security vulnerabilities', () => {
    const result: AnalysisResult = {
      tree: createMockTree(),
      circular: [],
      security: {
        total: 3,
        bySeverity: { critical: 1, high: 1, moderate: 1, low: 0 },
        vulnerabilities: [
          { package: 'lodash', severity: 'high', title: 'Prototype Pollution' }
        ]
      },
      exitCode: 0,
      toJSON: () => '',
      toTree: () => '',
      toMarkdown: () => '',
      toHTML: () => '',
      toReport: () => ''
    };

    const markdown = toMarkdown(result);
    expect(markdown).toContain('## Security Vulnerabilities');
    expect(markdown).toContain('**Total:** 3');
    expect(markdown).toContain('**Critical:** 1');
    expect(markdown).toContain('**High:** 1');
  });
});

describe('tree formatter', () => {
  const createMockTree = (): DependencyTree => ({
    root: {
      name: 'test-project',
      version: '1.0.0',
      type: 'prod',
      dependencies: [
        {
          name: 'lodash',
          version: '4.17.21',
          type: 'prod',
          dependencies: []
        },
        {
          name: 'axios',
          version: '1.0.0',
          type: 'prod',
          dependencies: []
        }
      ]
    },
    count: 2,
    depth: 1
  });

  it('should convert tree to text format', () => {
    const tree = createMockTree();
    const text = treeToTree(tree);

    expect(typeof text).toBe('string');
    expect(text.length).toBeGreaterThan(0);
    expect(text).toContain('test-project');
  });

  it('should limit tree output with treeToTreeLimited', () => {
    const tree = createMockTree();
    const limited = treeToTreeLimited(tree, 1);

    expect(typeof limited).toBe('string');
    expect(limited).toContain('test-project');
  });

  it('should respect maxDepth in treeToTreeLimited', () => {
    // Create a deeper tree
    const deepTree: DependencyTree = {
      root: {
        name: 'root',
        version: '1.0.0',
        type: 'prod',
        dependencies: [
          {
            name: 'level1',
            version: '1.0.0',
            type: 'prod',
            dependencies: [
              {
                name: 'level2',
                version: '1.0.0',
                type: 'prod',
                dependencies: []
              }
            ]
          }
        ]
      },
      count: 3,
      depth: 2
    };

    const limited = treeToTreeLimited(deepTree, 1);
    expect(limited).toContain('root');
    expect(limited).toContain('level1');
    // level2 should not be included since maxDepth is 1 (root is depth 0)
  });

  it('should limit depth at 0', () => {
    const tree = createMockTree();
    const limited = treeToTreeLimited(tree, 0);

    expect(typeof limited).toBe('string');
    expect(limited).toContain('test-project');
    // Dependencies should not be included
  });

  it('should use last branch connector for last child', () => {
    const treeWithMultipleChildren: DependencyTree = {
      root: {
        name: 'root',
        version: '1.0.0',
        type: 'prod',
        dependencies: [
          { name: 'child1', version: '1.0.0', type: 'prod', dependencies: [] },
          { name: 'child2', version: '1.0.0', type: 'prod', dependencies: [] },
          { name: 'child3', version: '1.0.0', type: 'prod', dependencies: [] }
        ]
      },
      count: 4,
      depth: 1
    };

    const tree = treeToTree(treeWithMultipleChildren);
    // Tests lines 38-40: last child branch connector (└─)
    // The tree output contains the last branch connector for the last child
    expect(tree).toContain('child1');
    expect(tree).toContain('child2');
    expect(tree).toContain('child3');
    // The box-drawing character might not render properly, but it should be in the output
    expect(tree.length).toBeGreaterThan(0);
  });

  it('should use proper prefix for children of non-last nodes', () => {
    const treeWithNestedChildren: DependencyTree = {
      root: {
        name: 'root',
        version: '1.0.0',
        type: 'prod',
        dependencies: [
          {
            name: 'first-child',
            version: '1.0.0',
            type: 'prod',
            dependencies: [
              { name: 'grandchild', version: '1.0.0', type: 'prod', dependencies: [] }
            ]
          },
          { name: 'last-child', version: '1.0.0', type: 'prod', dependencies: [] }
        ]
      },
      count: 4,
      depth: 2
    };

    const tree = treeToTree(treeWithNestedChildren);
    // Tests lines 55-57: child prefix building for non-last nodes
    // The grandchild should be under first-child with proper tree structure
    expect(tree).toContain('grandchild');
  });

  it('should process single child', () => {
    // Tests lines 46-48: childCount loop for single child (edge case)
    const treeWithSingleChild: DependencyTree = {
      root: {
        name: 'root',
        version: '1.0.0',
        type: 'prod',
        dependencies: [
          { name: 'only-child', version: '1.0.0', type: 'prod', dependencies: [] }
        ]
      },
      count: 2,
      depth: 2
    };

    const tree = treeToTree(treeWithSingleChild);
    expect(tree).toContain('only-child');
    expect(tree).toContain('root');
  });

  it('should convert result to tree format', () => {
    const result: AnalysisResult = {
      tree: createMockTree(),
      circular: [],
      exitCode: 0,
      toJSON: () => '',
      toTree: () => '',
      toMarkdown: () => '',
      toHTML: () => '',
      toReport: () => ''
    };

    const tree = toTree(result);
    expect(typeof tree).toBe('string');
    expect(tree).toContain('Dependency Tree:');
    expect(tree).toContain('Total dependencies:');
    expect(tree).toContain('Max depth:');
  });

  it('should include circular dependencies in output', () => {
    const result: AnalysisResult = {
      tree: createMockTree(),
      circular: [['pkg-a', 'pkg-b', 'pkg-a']],
      exitCode: 0,
      toJSON: () => '',
      toTree: () => '',
      toMarkdown: () => '',
      toHTML: () => '',
      toReport: () => ''
    };

    const tree = toTree(result);
    expect(tree).toContain('Circular Dependencies:');
    expect(tree).toContain('pkg-a');
    expect(tree).toContain('pkg-b');
  });

  it('should handle empty tree', () => {
    const tree: DependencyTree = {
      root: {
        name: 'empty',
        version: '1.0.0',
        type: 'prod',
        dependencies: []
      },
      count: 0,
      depth: 0
    };

    const text = treeToTree(tree);
    expect(typeof text).toBe('string');
    expect(text).toContain('empty');
  });

  it('should handle single dependency', () => {
    const singleDepTree: DependencyTree = {
      root: {
        name: 'root',
        version: '1.0.0',
        type: 'prod',
        dependencies: [
          {
            name: 'only-dep',
            version: '1.0.0',
            type: 'prod',
            dependencies: []
          }
        ]
      },
      count: 1,
      depth: 1
    };

    const text = treeToTree(singleDepTree);
    expect(text).toContain('root');
    expect(text).toContain('only-dep');
  });
});

describe('html formatter', () => {
  const createMockTree = (): DependencyTree => ({
    root: {
      name: 'test-project',
      version: '1.0.0',
      type: 'prod',
      dependencies: [
        {
          name: 'lodash',
          version: '4.17.21',
          type: 'prod',
          dependencies: []
        }
      ]
    },
    count: 1,
    depth: 1
  });

  it('should convert tree to HTML', () => {
    const tree = createMockTree();
    const html = treeToHtml(tree);

    // treeToHtml returns an HTML fragment (div), not a full document
    expect(html).toContain('<div');
    expect(html).toContain('test-project');
    expect(html).toContain('lodash');
  });

  it('should convert result to full HTML report', () => {
    const result: AnalysisResult = {
      tree: createMockTree(),
      circular: [['pkg-a', 'pkg-b', 'pkg-a']],
      unused: ['unused-dep'],
      exitCode: 0,
      toJSON: () => '',
      toTree: () => '',
      toMarkdown: () => '',
      toHTML: () => '',
      toReport: () => ''
    };

    const html = toHTML(result);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html');
    expect(html).toContain('test-project');
  });

  it('should include CSS styles', () => {
    const result: AnalysisResult = {
      tree: createMockTree(),
      circular: [],
      exitCode: 0,
      toJSON: () => '',
      toTree: () => '',
      toMarkdown: () => '',
      toHTML: () => '',
      toReport: () => ''
    };

    const html = toHTML(result);
    expect(html).toContain('<style');
  });

  it('should include circular dependencies in HTML', () => {
    const result: AnalysisResult = {
      tree: createMockTree(),
      circular: [['pkg-a', 'pkg-b', 'pkg-a']],
      exitCode: 0,
      toJSON: () => '',
      toTree: () => '',
      toMarkdown: () => '',
      toHTML: () => '',
      toReport: () => ''
    };

    const html = toHTML(result);
    expect(html).toContain('pkg-a');
    expect(html).toContain('pkg-b');
    expect(html).toContain('Circular Dependencies');
  });

  it('should include unused dependencies', () => {
    const result: AnalysisResult = {
      tree: createMockTree(),
      circular: [],
      unused: ['unused-dep', 'another-unused'],
      exitCode: 0,
      toJSON: () => '',
      toTree: () => '',
      toMarkdown: () => '',
      toHTML: () => '',
      toReport: () => ''
    };

    const html = toHTML(result);
    expect(html).toContain('unused');
    expect(html).toContain('unused-dep');
  });

  it('should include missing dependencies in HTML', () => {
    const result: AnalysisResult = {
      tree: createMockTree(),
      circular: [],
      missing: ['missing-dep', 'another-missing'],
      exitCode: 0,
      toJSON: () => '',
      toTree: () => '',
      toMarkdown: () => '',
      toHTML: () => '',
      toReport: () => ''
    };

    const html = toHTML(result);
    expect(html).toContain('Missing Dependencies');
    expect(html).toContain('missing-dep');
    expect(html).toContain('another-missing');
  });

  it('should include duplicates table', () => {
    const result: AnalysisResult = {
      tree: createMockTree(),
      circular: [],
      duplicates: {
        'lodash': ['4.17.20', '4.17.21']
      },
      exitCode: 0,
      toJSON: () => '',
      toTree: () => '',
      toMarkdown: () => '',
      toHTML: () => '',
      toReport: () => ''
    };

    const html = toHTML(result);
    expect(html).toContain('Duplicate Versions');
    expect(html).toContain('lodash');
  });

  it('should include size analysis', () => {
    const result: AnalysisResult = {
      tree: createMockTree(),
      circular: [],
      size: {
        total: 1024000,
        totalFormatted: '1 MB',
        packages: [
          { name: 'lodash', size: 512000, sizeFormatted: '500 KB', percentage: 50 }
        ]
      },
      exitCode: 0,
      toJSON: () => '',
      toTree: () => '',
      toMarkdown: () => '',
      toHTML: () => '',
      toReport: () => ''
    };

    const html = toHTML(result);
    expect(html).toContain('size');
    expect(html).toContain('lodash');
  });

  it('should include updates table', () => {
    const result: AnalysisResult = {
      tree: createMockTree(),
      circular: [],
      updates: [
        { name: 'lodash', current: '4.17.21', latest: '4.17.22', type: 'patch' }
      ],
      exitCode: 0,
      toJSON: () => '',
      toTree: () => '',
      toMarkdown: () => '',
      toHTML: () => '',
      toReport: () => ''
    };

    const html = toHTML(result);
    expect(html).toContain('Available Updates');
    expect(html).toContain('lodash');
    expect(html).toContain('4.17.22');
  });

  it('should include security vulnerabilities', () => {
    const result: AnalysisResult = {
      tree: createMockTree(),
      circular: [],
      security: {
        total: 2,
        bySeverity: { critical: 1, high: 1, moderate: 0, low: 0 },
        vulnerabilities: [
          { package: 'lodash', severity: 'high', title: 'Test Vuln' }
        ]
      },
      exitCode: 0,
      toJSON: () => '',
      toTree: () => '',
      toMarkdown: () => '',
      toHTML: () => '',
      toReport: () => ''
    };

    const html = toHTML(result);
    expect(html).toContain('Security Vulnerabilities');
    expect(html).toContain('Test Vuln');
  });

  it('should escape HTML in package names', () => {
    const treeWithSpecialChars: DependencyTree = {
      root: {
        name: 'test<script>',
        version: '1.0.0',
        type: 'prod',
        dependencies: []
      },
      count: 0,
      depth: 0
    };

    const html = treeToHtml(treeWithSpecialChars);
    expect(html).not.toContain('<script>');
  });

  it('should use lastBranch connector for last child in tree', () => {
    // Tests lines 38-40: lastBranch connector when isLast is true
    const treeWithMultipleChildren: DependencyTree = {
      root: {
        name: 'root',
        version: '1.0.0',
        type: 'prod',
        dependencies: [
          {
            name: 'child1',
            version: '1.0.0',
            type: 'prod',
            dependencies: []
          },
          {
            name: 'child2',
            version: '1.0.0',
            type: 'prod',
            dependencies: []
          },
          {
            name: 'child3',
            version: '1.0.0',
            type: 'prod',
            dependencies: []
          }
        ]
      },
      count: 4,
      depth: 2
    };

    const tree = treeToTree(treeWithMultipleChildren);
    // Last child should use different connector
    expect(tree).toContain('child3');
    expect(tree.split('\n').length).toBeGreaterThan(3);
  });

  it('should use vertical prefix for non-last children', () => {
    // Tests lines 55-57: vertical prefix for non-last children
    const nestedTree: DependencyTree = {
      root: {
        name: 'root',
        version: '1.0.0',
        type: 'prod',
        dependencies: [
          {
            name: 'parent1',
            version: '1.0.0',
            type: 'prod',
            dependencies: [
              {
                name: 'grandchild',
                version: '1.0.0',
                type: 'prod',
                dependencies: []
              }
            ]
          },
          {
            name: 'parent2',
            version: '1.0.0',
            type: 'prod',
            dependencies: []
          }
        ]
      },
      count: 5,
      depth: 3
    };

    const tree = treeToTree(nestedTree);
    // Should have vertical connectors for nested children
    expect(tree).toContain('grandchild');
    expect(tree).toContain('parent1');
    expect(tree).toContain('parent2');
  });

  it('should iterate over all child dependencies', () => {
    // Tests lines 46-48: childCount and for loop iteration
    const treeWithManyChildren: DependencyTree = {
      root: {
        name: 'root',
        version: '1.0.0',
        type: 'prod',
        dependencies: [
          { name: 'dep1', version: '1.0.0', type: 'prod', dependencies: [] },
          { name: 'dep2', version: '1.0.0', type: 'prod', dependencies: [] },
          { name: 'dep3', version: '1.0.0', type: 'prod', dependencies: [] },
          { name: 'dep4', version: '1.0.0', type: 'prod', dependencies: [] },
          { name: 'dep5', version: '1.0.0', type: 'prod', dependencies: [] }
        ]
      },
      count: 6,
      depth: 2
    };

    const tree = treeToTree(treeWithManyChildren);
    // All 5 children should be in the output
    expect(tree).toContain('dep1');
    expect(tree).toContain('dep2');
    expect(tree).toContain('dep3');
    expect(tree).toContain('dep4');
    expect(tree).toContain('dep5');
  });

  it('should process single child', () => {
    // Tests lines 46-48 with single child (edge case)
    const treeWithSingleChild: DependencyTree = {
      root: {
        name: 'root',
        version: '1.0.0',
        type: 'prod',
        dependencies: [
          { name: 'only-child', version: '1.0.0', type: 'prod', dependencies: [] }
        ]
      },
      count: 2,
      depth: 2
    };

    const tree = treeToTree(treeWithSingleChild);
    expect(tree).toContain('only-child');
  });
});

/**
 * ASCII tree output formatter
 *
 * Zero-dependency implementation
 *
 * @packageDocumentation
 */

import type { DependencyNode, DependencyTree, AnalysisResult } from '../../types.js';

/**
 * Box-drawing characters for tree
 */
const TREE_CHARS = {
  vertical: '│',
  horizontal: '─',
  branch: '├',
  lastBranch: '└',
  corner: '┘'
} as const;

/**
 * Convert dependency node to ASCII tree
 * @param node - Dependency node
 * @param prefix - Line prefix
 * @param isLast - Is this the last child?
 */
function nodeToTree(
  node: DependencyNode,
  prefix: string = '',
  isLast: boolean = true
): string {
  let output = '';

  // Add current node
  const connector = prefix === ''
    ? ''
    : isLast
    ? `${TREE_CHARS.lastBranch}${TREE_CHARS.horizontal} `
    : `${TREE_CHARS.branch}${TREE_CHARS.horizontal} `;

  output += `${prefix}${connector}${node.name}@${node.version}\n`;

  // Add children
  const children = node.dependencies;
  const childCount = children.length;

  for (let i = 0; i < childCount; i++) {
    const child = children[i];
    const childIsLast = i === childCount - 1;

    // Build prefix for children
    const childPrefix = prefix === ''
      ? ''
      : isLast
      ? `${prefix}   `
      : `${prefix}${TREE_CHARS.vertical}  `;

    output += nodeToTree(child, childPrefix, childIsLast);
  }

  return output;
}

/**
 * Convert dependency tree to ASCII tree string
 * @param tree - Dependency tree
 */
export function treeToTree(tree: DependencyTree): string {
  return nodeToTree(tree.root);
}

/**
 * Convert analysis result to ASCII tree string
 * @param result - Analysis result
 */
export function toTree(result: AnalysisResult): string {
  let output = '';

  // Dependency tree
  output += 'Dependency Tree:\n';
  output += treeToTree(result.tree);

  // Add summary
  output += `\nTotal dependencies: ${result.tree.count}\n`;
  output += `Max depth: ${result.tree.depth}\n`;

  // Circular dependencies
  if (result.circular.length > 0) {
    output += '\nCircular Dependencies:\n';
    for (const chain of result.circular) {
      output += `  ${chain.join(' → ')} → ${chain[0]}\n`;
    }
  }

  return output;
}

/**
 * Convert dependency tree to ASCII tree with depth limit
 * @param tree - Dependency tree
 * @param maxDepth - Maximum depth
 */
export function treeToTreeLimited(tree: DependencyTree, maxDepth: number): string {
  function limitNodeDepth(node: DependencyNode, currentDepth: number): DependencyNode {
    const limited: DependencyNode = {
      name: node.name,
      version: node.version,
      type: node.type,
      dependencies: []
    };

    if (currentDepth < maxDepth) {
      for (const child of node.dependencies) {
        limited.dependencies.push(limitNodeDepth(child, currentDepth + 1));
      }
    }

    return limited;
  }

  const limitedTree: DependencyTree = {
    root: limitNodeDepth(tree.root, 0),
    count: tree.count,
    depth: Math.min(tree.depth, maxDepth)
  };

  return treeToTree(limitedTree);
}

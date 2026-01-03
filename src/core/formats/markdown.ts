/**
 * Markdown output formatter
 *
 * Zero-dependency implementation
 *
 * @packageDocumentation
 */

import type { DependencyTree, AnalysisResult, DependencyNode } from '../../types.js';
import { treeToTree } from './tree.js';

/**
 * Convert dependency node to markdown tree
 * @param node - Dependency node
 * @param depth - Current depth
 */
function nodeToMarkdown(node: DependencyNode, depth: number = 0): string {
  const indent = '  '.repeat(depth);
  let output = indent + '- **' + node.name + '**@' + node.version + '\n';

  for (const child of node.dependencies) {
    output += nodeToMarkdown(child, depth + 1);
  }

  return output;
}

/**
 * Convert dependency tree to markdown
 * @param tree - Dependency tree
 */
export function treeToMarkdown(tree: DependencyTree): string {
  let output = '## Dependency Tree\n\n';
  output += nodeToMarkdown(tree.root);
  output += '\n*Total: ' + tree.count + ' dependencies, max depth: ' + tree.depth + '*\n';

  return output;
}

/**
 * Convert analysis result to markdown
 * @param result - Analysis result
 */
export function toMarkdown(result: AnalysisResult): string {
  let output = '# Dependency Analysis Report\n\n';

  // Summary
  output += '## Summary\n\n';
  output += '- **Total Dependencies:** ' + result.tree.count + '\n';
  output += '- **Max Depth:** ' + result.tree.depth + '\n';

  if (result.circular.length > 0) {
    output += '- **Circular Dependencies:** ' + result.circular.length + '\n';
  }

  if (result.unused && result.unused.length > 0) {
    output += '- **Unused Dependencies:** ' + result.unused.length + '\n';
  }

  if (result.missing && result.missing.length > 0) {
    output += '- **Missing Dependencies:** ' + result.missing.length + '\n';
  }

  if (result.duplicates && Object.keys(result.duplicates).length > 0) {
    output += '- **Duplicate Versions:** ' + Object.keys(result.duplicates).length + '\n';
  }

  if (result.size) {
    output += '- **Total Size:** ' + result.size.totalFormatted + '\n';
  }

  if (result.updates && result.updates.length > 0) {
    output += '- **Available Updates:** ' + result.updates.length + '\n';
  }

  if (result.security && result.security.total > 0) {
    output += '- **Security Vulnerabilities:** ' + result.security.total + '\n';
  }

  output += '\n---\n\n';

  // Dependency Tree
  output += treeToMarkdown(result.tree);

  // Circular Dependencies
  if (result.circular.length > 0) {
    output += '\n## Circular Dependencies\n\n';
    for (let i = 0; i < result.circular.length; i++) {
      const chain = result.circular[i];
      output += (i + 1) + '. ' + chain.join(' → ') + ' → ' + chain[0] + '\n';
    }
    output += '\n';
  }

  // Unused Dependencies
  if (result.unused && result.unused.length > 0) {
    output += '\n## Unused Dependencies\n\n';
    for (const dep of result.unused) {
      output += `- ${dep}\n`;
    }
    output += '\n';
  }

  // Missing Dependencies
  if (result.missing && result.missing.length > 0) {
    output += '\n## Missing Dependencies\n\n';
    for (const dep of result.missing) {
      output += `- ${dep}\n`;
    }
    output += '\n';
  }

  // Duplicate Versions
  if (result.duplicates && Object.keys(result.duplicates).length > 0) {
    output += '\n## Duplicate Versions\n\n';
    output += '| Package | Versions |\n';
    output += '|---------|----------|\n';

    for (const [pkg, versions] of Object.entries(result.duplicates)) {
      output += '| ' + pkg + ' | ' + versions.join(', ') + ' |\n';
    }
    output += '\n';
  }

  // Size Analysis
  if (result.size) {
    output += '\n## Size Analysis\n\n';
    output += '| Package | Size | Percentage |\n';
    output += '|---------|------|------------|\n';

    for (const pkg of result.size.packages) {
      output += '| ' + pkg.name + ' | ' + pkg.sizeFormatted + ' | ' + pkg.percentage + '% |\n';
    }
    output += '\n';
  }

  // Update Suggestions
  if (result.updates && result.updates.length > 0) {
    output += '\n## Available Updates\n\n';
    output += '| Package | Current | Latest | Type |\n';
    output += '|---------|---------|--------|------|\n';

    for (const update of result.updates) {
      output += '| ' + update.name + ' | ' + update.current + ' | ' + update.latest + ' | ' + update.type + ' |\n';
    }
    output += '\n';
  }

  // Security Audit
  if (result.security && result.security.total > 0) {
    output += '\n## Security Vulnerabilities\n\n';
    output += '**Total:** ' + result.security.total + '\n\n';
    output += '- **Critical:** ' + result.security.bySeverity.critical + '\n';
    output += '- **High:** ' + result.security.bySeverity.high + '\n';
    output += '- **Moderate:** ' + result.security.bySeverity.moderate + '\n';
    output += '- **Low:** ' + result.security.bySeverity.low + '\n\n';

    if (result.security.vulnerabilities.length > 0) {
      output += '| Package | Severity | Title |\n';
      output += '|---------|----------|-------|\n';

      for (const vuln of result.security.vulnerabilities) {
        output += '| ' + vuln.package + ' | ' + vuln.severity + ' | ' + vuln.title + ' |\n';
      }
      output += '\n';
    }
  }

  return output;
}

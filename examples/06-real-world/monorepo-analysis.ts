/**
 * Monorepo Analysis Example
 *
 * Demonstrates analyzing a monorepo project
 *
 * @packageDocumentation
 */

import { createAnalyzer } from '@oxog/deps';
import { monorepoPlugin } from '@oxog/deps/plugins';

async function main() {
  const analyzer = createAnalyzer({
    cwd: process.cwd(),
    monorepo: true, // Auto-detect monorepo type
    cache: true
  });

  // Add monorepo plugin
  analyzer.use(monorepoPlugin);

  // Listen to events
  analyzer.on('progress', ({ plugin, percent, message }) => {
    console.log(`[${plugin}] ${percent}% - ${message}`);
  });

  analyzer.on('finding', ({ type, severity, message }) => {
    if (severity === 'error' || severity === 'warning') {
      console.log(`[${severity}] ${message}`);
    }
  });

  // Run analysis
  const result = await analyzer.run();

  // Get monorepo info
  const monorepoInfo = analyzer.getResult<{
    type: string;
    workspacePatterns: string[];
  }>('monorepo');

  console.log('\n=== Monorepo Analysis ===\n');

  if (monorepoInfo) {
    console.log(`Type: ${monorepoInfo.type}`);
    console.log(`Workspace patterns: ${monorepoInfo.workspacePatterns.join(', ')}`);
  }

  console.log(`\nTotal dependencies: ${result.tree.count}`);
  console.log(`Max depth: ${result.tree.depth}`);

  if (result.circular.length > 0) {
    console.log(`\n⚠️  Found ${result.circular.length} circular dependencies`);
  }

  if (result.unused && result.unused.length > 0) {
    console.log(`\n⚠️  Found ${result.unused.length} unused dependencies`);
  }

  if (result.duplicates && Object.keys(result.duplicates).length > 0) {
    console.log(`\n⚠️  Found ${Object.keys(result.duplicates).length} duplicate versions`);
  }

  console.log('\n=== Report Generated ===');
  console.log(result.toMarkdown());
}

main().catch(console.error);

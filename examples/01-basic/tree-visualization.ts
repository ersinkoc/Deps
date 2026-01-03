/**
 * Tree Visualization Example
 *
 * Demonstrates dependency tree visualization with depth limiting
 *
 * @packageDocumentation
 */

import { deps } from '@oxog/deps';

async function main() {
  // Analyze with depth limit
  const result = await deps.analyze('./package.json');

  console.log('=== Full Dependency Tree ===\n');
  console.log(result.toTree());

  console.log('\n=== Tree Statistics ===');
  console.log(`Total dependencies: ${result.tree.count}`);
  console.log(`Max depth: ${result.tree.depth}`);
  console.log(`Root package: ${result.tree.root.name} v${result.tree.root.version}`);
}

main().catch(console.error);

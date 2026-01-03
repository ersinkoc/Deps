/**
 * Quick Analysis Example
 *
 * Demonstrates basic usage of the quick API
 *
 * @packageDocumentation
 */

import { deps } from '@oxog/deps';

async function main() {
  // Analyze current project
  const result = await deps.analyze('./package.json');

  // Output dependency tree
  console.log('=== Dependency Tree ===');
  console.log(result.toTree());

  // Check for circular dependencies
  if (result.circular.length > 0) {
    console.log('\n=== Circular Dependencies ===');
    for (const chain of result.circular) {
      console.log(chain.join(' → '));
    }
  } else {
    console.log('\nNo circular dependencies found!');
  }

  // Summary
  console.log(`\nTotal dependencies: ${result.tree.count}`);
  console.log(`Max depth: ${result.tree.depth}`);
}

main().catch(console.error);

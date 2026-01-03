/**
 * Circular Dependency Detection Example
 *
 * Demonstrates circular dependency detection
 *
 * @packageDocumentation
 */

import { deps } from '@oxog/deps';

async function main() {
  const result = await deps.analyze('./package.json');

  console.log('=== Circular Dependency Check ===\n');

  if (result.circular.length === 0) {
    console.log('✓ No circular dependencies found!');
    return;
  }

  console.log(`Found ${result.circular.length} circular dependencies:\n`);

  for (let i = 0; i < result.circular.length; i++) {
    const chain = result.circular[i];
    console.log(`${i + 1}. ${chain.join(' → ')} → ${chain[0]}`);
  }

  console.log('\n⚠️  Circular dependencies should be resolved to prevent runtime issues.');
}

main().catch(console.error);

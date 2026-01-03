/**
 * Using Core Plugins Example
 *
 * Demonstrates usage of built-in core plugins
 *
 * @packageDocumentation
 */

import { createAnalyzer } from '@oxog/deps';
import { treePlugin, circularPlugin } from '@oxog/deps/plugins';

async function main() {
  // Create analyzer with core plugins
  const analyzer = createAnalyzer({
    cwd: process.cwd(),
    cache: true
  });

  // Core plugins are loaded automatically
  analyzer.use(treePlugin);
  analyzer.use(circularPlugin);

  // Listen to events
  analyzer.on('progress', ({ plugin, percent, message }) => {
    console.log(`[${plugin}] ${percent}% - ${message}`);
  });

  analyzer.on('finding', ({ type, severity, message }) => {
    const icon = severity === 'error' ? '❌' : severity === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${icon} [${type}] ${message}`);
  });

  // Run analysis
  const result = await analyzer.run();

  console.log('\n=== Analysis Complete ===');
  console.log(`Dependencies: ${result.tree.count}`);
  console.log(`Circular chains: ${result.circular.length}`);
}

main().catch(console.error);

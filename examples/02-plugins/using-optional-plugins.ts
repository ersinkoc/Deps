/**
 * Using Optional Plugins Example
 *
 * Demonstrates usage of optional plugins
 *
 * @packageDocumentation
 */

import { createAnalyzer } from '@oxog/deps';
import {
  unusedPlugin,
  missingPlugin,
  duplicatesPlugin,
  sizePlugin,
  updatesPlugin,
  securityPlugin
} from '@oxog/deps/plugins';

async function main() {
  const analyzer = createAnalyzer({
    cwd: process.cwd(),
    cache: true
  });

  // Add optional plugins
  analyzer.use(unusedPlugin);
  analyzer.use(missingPlugin);
  analyzer.use(duplicatesPlugin);
  analyzer.use(sizePlugin);
  analyzer.use(updatesPlugin);
  analyzer.use(securityPlugin);

  const result = await analyzer.run();

  console.log('=== Full Analysis Results ===\n');

  // Unused dependencies
  if (result.unused && result.unused.length > 0) {
    console.log(`Unused dependencies (${result.unused.length}):`);
    for (const dep of result.unused) {
      console.log(`  - ${dep}`);
    }
    console.log('');
  }

  // Missing dependencies
  if (result.missing && result.missing.length > 0) {
    console.log(`Missing dependencies (${result.missing.length}):`);
    for (const dep of result.missing) {
      console.log(`  - ${dep}`);
    }
    console.log('');
  }

  // Duplicate versions
  if (result.duplicates && Object.keys(result.duplicates).length > 0) {
    console.log(`Duplicate versions (${Object.keys(result.duplicates).length}):`);
    for (const [pkg, versions] of Object.entries(result.duplicates)) {
      console.log(`  - ${pkg}: ${versions.join(', ')}`);
    }
    console.log('');
  }

  // Size analysis
  if (result.size) {
    console.log(`Total size: ${result.size.totalFormatted}`);
    console.log('Largest packages:');
    for (const pkg of result.size.packages.slice(0, 5)) {
      console.log(`  - ${pkg.name}: ${pkg.sizeFormatted} (${pkg.percentage}%)`);
    }
    console.log('');
  }

  // Updates
  if (result.updates && result.updates.length > 0) {
    console.log(`Available updates (${result.updates.length}):`);
    for (const update of result.updates) {
      console.log(`  - ${update.name}: ${update.current} → ${update.latest} (${update.type})`);
    }
    console.log('');
  }

  // Security
  if (result.security && result.security.total > 0) {
    console.log(`Security vulnerabilities: ${result.security.total}`);
    console.log(`  Critical: ${result.security.bySeverity.critical}`);
    console.log(`  High: ${result.security.bySeverity.high}`);
    console.log(`  Moderate: ${result.security.bySeverity.moderate}`);
    console.log(`  Low: ${result.security.bySeverity.low}`);
  }
}

main().catch(console.error);

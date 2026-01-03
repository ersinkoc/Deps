/**
 * CI Pipeline Integration Example
 *
 * Demonstrates using @oxog/deps in a CI pipeline
 *
 * @packageDocumentation
 */

import { deps } from '@oxog/deps';
import { writeFileSync } from 'node:fs';

async function main() {
  console.log('Running dependency analysis for CI...\n');

  // Run full analysis
  const result = await deps.analyze('./package.json', {
    full: true,
    cache: false // Disable cache in CI
  });

  let exitCode = 0;

  // Check circular dependencies
  if (result.circular.length > 0) {
    console.error(`❌ Found ${result.circular.length} circular dependencies`);
    exitCode = 1;
  } else {
    console.log('✓ No circular dependencies');
  }

  // Check unused dependencies
  if (result.unused && result.unused.length > 0) {
    console.warn(`⚠️  Found ${result.unused.length} unused dependencies`);
  } else {
    console.log('✓ No unused dependencies');
  }

  // Check size limit (e.g., 5MB)
  const sizeLimit = 5 * 1024 * 1024;
  if (result.size && result.size.total > sizeLimit) {
    console.error(`❌ Total size ${result.size.totalFormatted} exceeds limit`);
    exitCode = 1;
  } else if (result.size) {
    console.log(`✓ Total size: ${result.size.totalFormatted}`);
  }

  // Check security
  if (result.security) {
    if (result.security.bySeverity.critical > 0) {
      console.error(`❌ Found ${result.security.bySeverity.critical} critical vulnerabilities`);
      exitCode = 1;
    } else if (result.security.bySeverity.high > 0) {
      console.error(`❌ Found ${result.security.bySeverity.high} high vulnerabilities`);
      exitCode = 1;
    } else if (result.security.total > 0) {
      console.warn(`⚠️  Found ${result.security.total} vulnerabilities`);
    } else {
      console.log('✓ No security vulnerabilities');
    }
  }

  // Generate report for artifacts
  writeFileSync('dependency-report.json', result.toJSON());
  writeFileSync('dependency-report.md', result.toMarkdown());

  console.log('\nReports generated: dependency-report.json, dependency-report.md');

  process.exit(exitCode);
}

main().catch(error => {
  console.error('Analysis failed:', error);
  process.exit(1);
});

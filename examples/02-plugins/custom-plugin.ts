/**
 * Custom Plugin Example
 *
 * Demonstrates creating and using a custom plugin
 *
 * @packageDocumentation
 */

import { createAnalyzer } from '@oxog/deps';
import type { AnalyzerPlugin, AnalyzerContext } from '@oxog/deps';

// Custom plugin to analyze package names
const nameAnalysisPlugin: AnalyzerPlugin<AnalyzerContext> = {
  name: 'name-analysis',
  version: '1.0.0',

  install(kernel) {
    kernel.on('analyze', async (context) => {
      kernel.reportProgress('name-analysis', 0, 'Analyzing package names');

      const allPackages = Array.from(context.graph.metadata.keys());

      // Find packages with specific patterns
      const scopedPackages = allPackages.filter(name => name.startsWith('@'));
      const longNames = allPackages.filter(name => name.length > 20);

      kernel.reportFinding(
        'name-analysis',
        'info',
        `Found ${scopedPackages.length} scoped packages`
      );

      kernel.reportFinding(
        'name-analysis',
        'info',
        `Found ${longNames.length} packages with names > 20 characters`
      );

      // Store result
      (kernel as any).setResult('nameAnalysis', {
        scoped: scopedPackages,
        long: longNames
      });

      kernel.reportProgress('name-analysis', 100, 'Name analysis complete');
    });
  }
};

async function main() {
  const analyzer = createAnalyzer();

  // Register custom plugin
  analyzer.use(nameAnalysisPlugin);

  // Listen to findings
  analyzer.on('finding', ({ type, severity, message }) => {
    console.log(`[${type}] ${message}`);
  });

  await analyzer.run();

  // Get custom plugin results
  const result = analyzer.getResult<{ scoped: string[]; long: string[] }>('nameAnalysis');

  if (result) {
    console.log('\n=== Name Analysis ===');
    console.log(`Scoped packages: ${result.scoped.length}`);
    console.log(`Long names: ${result.long.length}`);
  }
}

main().catch(console.error);

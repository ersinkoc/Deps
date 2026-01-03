/**
 * Size plugin - Analyze dependency size impact
 *
 * Zero-dependency implementation
 *
 * @packageDocumentation
 */

import { join } from 'node:path';
import { getDirectorySize } from '../../utils/fs.js';
import { formatBytes, calculatePercentage } from '../../utils/size.js';
import type { AnalyzerPlugin, AnalyzerContext, SizeAnalysis, PackageSize } from '../../types.js';

/**
 * Size analysis plugin
 */
export const sizePlugin: AnalyzerPlugin<AnalyzerContext> = {
  name: 'size',
  version: '1.0.0',

  install(kernel) {
    kernel.on('analyze', async (context) => {
      kernel.reportProgress('size', 0, 'Calculating dependency sizes');

      const nodeModulesPath = join(context.cwd, 'node_modules');
      const packageSizes: PackageSize[] = [];
      let totalSize = 0;

      // Get all dependencies
      const allDeps = new Set<string>([
        ...Object.keys(context.package.dependencies ?? {}),
        ...Object.keys(context.package.devDependencies ?? {}),
        ...Object.keys(context.package.optionalDependencies ?? {})
      ]);

      // Calculate size for each package
      for (const depName of allDeps) {
        try {
          const depPath = join(nodeModulesPath, depName);
          const bytes = await getDirectorySize(depPath);
          totalSize += bytes;

          packageSizes.push({
            name: depName,
            size: bytes,
            sizeFormatted: formatBytes(bytes),
            percentage: 0 // Will be calculated after total is known
          });
        } catch {
          // Package not found or error reading size
        }
      }

      // Calculate percentages
      for (const pkg of packageSizes) {
        pkg.percentage = calculatePercentage(pkg.size, totalSize);
      }

      // Sort by size (largest first)
      packageSizes.sort((a, b) => b.size - a.size);

      // Create size analysis
      const analysis: SizeAnalysis = {
        total: totalSize,
        totalFormatted: formatBytes(totalSize),
        packages: packageSizes
      };

      // Store result
      (kernel as any).setResult('size', analysis);

      // Report findings for large packages
      for (const pkg of packageSizes) {
        if (pkg.percentage > 10) {
          kernel.reportFinding(
            'size',
            'info',
            `Large package: ${pkg.name} (${pkg.sizeFormatted}, ${pkg.percentage}%)`,
            pkg.name
          );
        }
      }

      kernel.reportProgress('size', 100, `Calculated sizes for ${packageSizes.length} packages`);
    });
  }
};

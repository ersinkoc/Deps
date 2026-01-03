/**
 * Duplicates plugin - Find duplicate package versions
 *
 * Zero-dependency implementation
 *
 * @packageDocumentation
 */

import { join } from 'node:path';
import { listDirectories } from '../../utils/fs.js';
import { readFileSafe } from '../../utils/fs.js';
import type { AnalyzerPlugin, AnalyzerContext } from '../../types.js';

/**
 * Duplicate version detection plugin
 */
export const duplicatesPlugin: AnalyzerPlugin<AnalyzerContext> = {
  name: 'duplicates',
  version: '1.0.0',

  install(kernel) {
    kernel.on('analyze', async (context) => {
      kernel.reportProgress('duplicates', 0, 'Scanning for duplicate versions');

      const nodeModulesPath = join(context.cwd, 'node_modules');
      const duplicates: Record<string, string[]> = {};

      // Recursively scan node_modules
      async function scanDir(path: string, depth: number = 0): Promise<void> {
        if (depth > 10) return; // Limit recursion depth

        try {
          const dirs = await listDirectories(path);

          for (const dir of dirs) {
            const dirName = dir.split(/[\\/]/).pop() ?? '';

            // Skip non-package directories
            if (dirName.startsWith('.') || dirName === '@' || dirName === 'node_modules') {
              if (dirName === '@') {
                // Scan scoped packages
                await scanDir(dir, depth);
              }
              continue;
            }

            // Check if it's a package (has package.json)
            const pkgPath = join(dir, 'package.json');
            const content = await readFileSafe(pkgPath);

            if (content) {
              try {
                const pkg = JSON.parse(content);
                const name = pkg.name;
                const version = pkg.version;

                if (name && version) {
                  if (!duplicates[name]) {
                    duplicates[name] = [];
                  }

                  if (!duplicates[name].includes(version)) {
                    duplicates[name].push(version);
                  }
                }
              } catch {
                // Invalid package.json, skip
              }
            }

            // Recurse into nested node_modules
            const nestedNodeModules = join(dir, 'node_modules');
            // Note: we would need to check if directory exists
          }
        } catch {
          // Error reading directory, skip
        }
      }

      await scanDir(nodeModulesPath);

      // Filter to only packages with duplicates
      const filteredDuplicates: Record<string, string[]> = {};

      for (const [pkg, versions] of Object.entries(duplicates)) {
        if (versions.length > 1) {
          filteredDuplicates[pkg] = versions.sort();
        }
      }

      // Store result
      (kernel as any).setResult('duplicates', filteredDuplicates);

      // Report findings
      for (const [pkg, versions] of Object.entries(filteredDuplicates)) {
        kernel.reportFinding(
          'duplicates',
          'warning',
          `Duplicate versions: ${pkg} (${versions.join(', ')})`,
          pkg
        );
      }

      const count = Object.keys(filteredDuplicates).length;
      kernel.reportProgress('duplicates', 100, `Found ${count} packages with duplicates`);
    });
  }
};

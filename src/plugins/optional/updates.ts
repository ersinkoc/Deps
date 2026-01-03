/**
 * Updates plugin - Check for available dependency updates
 *
 * Zero-dependency implementation using npm registry
 *
 * @packageDocumentation
 */

import type { AnalyzerPlugin, AnalyzerContext, UpdateSuggestion } from '../../types.js';
import { compareSemver, getUpdateType } from '../../utils/semver.js';

/**
 * Get latest package version from npm registry
 * @param packageName - Package name
 */
async function getLatestVersion(packageName: string): Promise<string | null> {
  try {
    const url = `https://registry.npmjs.org/${packageName}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data['dist-tags']?.latest ?? null;
  } catch {
    return null;
  }
}

/**
 * Update suggestions plugin
 */
export const updatesPlugin: AnalyzerPlugin<AnalyzerContext> = {
  name: 'updates',
  version: '1.0.0',

  install(kernel) {
    kernel.on('analyze', async (context) => {
      kernel.reportProgress('updates', 0, 'Checking for updates');

      const pkg = context.package;
      const allDeps = new Map<string, string>([
        ...Object.entries(pkg.dependencies ?? {}),
        ...Object.entries(pkg.devDependencies ?? {}),
        ...Object.entries(pkg.optionalDependencies ?? {})
      ]);

      if (allDeps.size === 0) {
        kernel.reportProgress('updates', 100, 'No dependencies to check');
        (kernel as any).setResult('updates', []);
        return;
      }

      const updates: UpdateSuggestion[] = [];
      const depsArray = Array.from(allDeps.entries());

      for (let i = 0; i < depsArray.length; i++) {
        const [name, currentVersion] = depsArray[i];
        const percent = Math.round((i / depsArray.length) * 100);

        kernel.reportProgress('updates', percent, `Checking ${name}`);

        try {
          // Get latest version from npm
          const latestVersion = await getLatestVersion(name);

          if (latestVersion) {
            const cmp = compareSemver(currentVersion, latestVersion);

            if (cmp < 0) {
              // Update available
              const updateType = getUpdateType(currentVersion, latestVersion);

              if (updateType !== 'none') {
                updates.push({
                  name,
                  current: currentVersion,
                  latest: latestVersion,
                  type: updateType
                });

                kernel.reportFinding(
                  'updates',
                  updateType === 'major' ? 'warning' : 'info',
                  `Update available: ${name} ${currentVersion} → ${latestVersion}`,
                  name
                );
              }
            }
          }
        } catch {
          // Error checking updates, skip
        }
      }

      // Store result
      (kernel as any).setResult('updates', updates);

      kernel.reportProgress('updates', 100, `Found ${updates.length} available updates`);
    });
  }
};

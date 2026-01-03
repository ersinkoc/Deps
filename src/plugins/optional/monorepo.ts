/**
 * Monorepo plugin - Support for workspace-based monorepos
 *
 * Zero-dependency implementation
 *
 * @packageDocumentation
 */

import { join, dirname } from 'node:path';
import { fileExists, readFileSafe } from '../../utils/fs.js';
import type { AnalyzerPlugin, AnalyzerContext } from '../../types.js';

/**
 * Monorepo type
 */
type MonorepoType =
  | 'pnpm'
  | 'npm'
  | 'yarn'
  | 'lerna'
  | 'turborepo'
  | 'nx';

/**
 * Detect monorepo type from configuration files
 * @param cwd - Working directory
 */
async function detectMonorepoType(cwd: string): Promise<MonorepoType | null> {
  // Check for pnpm-workspace.yaml
  if (await fileExists(join(cwd, 'pnpm-workspace.yaml'))) {
    return 'pnpm';
  }

  // Check for package.json with workspaces field
  const pkgJsonPath = join(cwd, 'package.json');
  const pkgContent = await readFileSafe(pkgJsonPath);

  if (pkgContent) {
    try {
      const pkg = JSON.parse(pkgContent);
      if (pkg.workspaces) {
        // Could be npm or yarn (both use workspaces field)
        // Check for yarn.lock vs package-lock.json
        if (await fileExists(join(cwd, 'yarn.lock'))) {
          return 'yarn';
        }
        return 'npm';
      }
    } catch {
      // Invalid JSON
    }
  }

  // Check for lerna.json
  if (await fileExists(join(cwd, 'lerna.json'))) {
    return 'lerna';
  }

  // Check for turbo.json
  if (await fileExists(join(cwd, 'turbo.json'))) {
    return 'turborepo';
  }

  // Check for nx.json
  if (await fileExists(join(cwd, 'nx.json'))) {
    return 'nx';
  }

  return null;
}

/**
 * Get workspace packages for pnpm
 * @param cwd - Working directory
 */
async function getPnpmWorkspaces(cwd: string): Promise<string[]> {
  const yamlPath = join(cwd, 'pnpm-workspace.yaml');
  const content = await readFileSafe(yamlPath);

  if (!content) return [];

  // Simple YAML parser for workspaces
  const packagesMatch = content.match(/packages:\s*\n((?:\s*-\s*[^\n]+\n?)+)/);

  if (packagesMatch) {
    const patterns = packagesMatch[1]
      .split('\n')
      .map(line => line.replace(/^\s*-\s*/, '').trim())
      .filter(Boolean);

    return patterns;
  }

  return [];
}

/**
 * Get workspace packages for npm/yarn
 * @param cwd - Working directory
 */
async function getNpmWorkspaces(cwd: string): Promise<string[]> {
  const pkgJsonPath = join(cwd, 'package.json');
  const content = await readFileSafe(pkgJsonPath);

  if (!content) return [];

  try {
    const pkg = JSON.parse(content);

    if (Array.isArray(pkg.workspaces)) {
      return pkg.workspaces;
    }

    if (pkg.workspaces?.packages) {
      return pkg.workspaces.packages;
    }
  } catch {
    // Invalid JSON
  }

  return [];
}

/**
 * Get workspace packages for lerna
 * @param cwd - Working directory
 */
async function getLernaPackages(cwd: string): Promise<string[]> {
  const lernaPath = join(cwd, 'lerna.json');
  const content = await readFileSafe(lernaPath);

  if (!content) return [];

  try {
    const lerna = JSON.parse(content);
    return lerna.packages ?? [];
  } catch {
    return [];
  }
}

/**
 * Monorepo support plugin
 */
export const monorepoPlugin: AnalyzerPlugin<AnalyzerContext> = {
  name: 'monorepo',
  version: '1.0.0',

  install(kernel) {
    kernel.on('analyze', async (context) => {
      kernel.reportProgress('monorepo', 0, 'Detecting monorepo');

      // Detect monorepo type
      const monorepoType = await detectMonorepoType(context.cwd);

      if (!monorepoType) {
        kernel.reportProgress('monorepo', 100, 'Not a monorepo');
        return;
      }

      kernel.reportFinding('monorepo', 'info', `Detected ${monorepoType} monorepo`);

      // Get workspace packages
      let workspacePatterns: string[] = [];

      switch (monorepoType) {
        case 'pnpm':
          workspacePatterns = await getPnpmWorkspaces(context.cwd);
          break;
        case 'npm':
        case 'yarn':
          workspacePatterns = await getNpmWorkspaces(context.cwd);
          break;
        case 'lerna':
          workspacePatterns = await getLernaPackages(context.cwd);
          break;
        case 'turborepo':
        case 'nx':
          // These use package.json workspaces
          workspacePatterns = await getNpmWorkspaces(context.cwd);
          break;
      }

      kernel.reportProgress('monorepo', 50, `Found ${workspacePatterns.length} workspace patterns`);

      // Store monorepo info
      (kernel as any).setResult('monorepo', {
        type: monorepoType,
        workspacePatterns
      });

      kernel.reportProgress('monorepo', 100, `Monorepo: ${monorepoType}`);
    });
  }
};

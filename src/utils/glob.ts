/**
 * Glob pattern matching utilities
 *
 * Zero-dependency implementation
 *
 * @packageDocumentation
 */

import { sep } from 'node:path';
import { listFiles, listDirectories } from './fs.js';

/**
 * Convert glob pattern to regex
 * @param pattern - Glob pattern
 * @internal
 */
function globToRegex(pattern: string): RegExp {
  // Escape special regex characters except * and ?
  let regex = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');

  // Replace ** with (?:[^/]*(?:\/|$))*
  regex = regex.replace(/\*\*/g, '(?:[^/]*(?:\\/))?');

  // Replace * with [^/]*
  regex = regex.replace(/(?<!\*)\*(?!\*)/g, '[^/]*');

  // Replace ? with .
  regex = regex.replace(/\?/g, '.');

  return new RegExp(`^${regex}$`);
}

/**
 * Check if a path matches a glob pattern
 * @param path - Path to check
 * @param pattern - Glob pattern
 */
export function isMatch(path: string, pattern: string): boolean {
  // Normalize path separators
  const normalizedPath = path.replace(/\\/g, '/');
  const normalizedPattern = pattern.replace(/\\/g, '/');

  const regex = globToRegex(normalizedPattern);
  return regex.test(normalizedPath);
}

/**
 * Match files against glob patterns
 * @param patterns - Glob patterns
 * @param rootPath - Root directory to search (default: current working directory)
 */
export async function glob(
  patterns: string | string[],
  rootPath: string = process.cwd()
): Promise<string[]> {
  const patternList = Array.isArray(patterns) ? patterns : [patterns];
  const results = new Set<string>();

  // Get all files recursively
  const files = await listFiles(rootPath, true);

  for (const file of files) {
    // Get relative path from root
    const relativePath = file.replace(new RegExp(`^${rootPath}[\\/]?`), '');

    // Check if file matches any pattern
    for (const pattern of patternList) {
      if (isMatch(relativePath, pattern)) {
        results.add(file);
        break;
      }
    }
  }

  return Array.from(results);
}

/**
 * Synchronous glob operation (for patterns without directory scanning)
 * @param paths - Paths to filter
 * @param patterns - Glob patterns
 */
export function globSync(paths: string[], patterns: string | string[]): string[] {
  const patternList = Array.isArray(patterns) ? patterns : [patterns];

  return paths.filter(path => {
    for (const pattern of patternList) {
      if (isMatch(path, pattern)) {
        return true;
      }
    }
    return false;
  });
}

/**
 * Filter paths by ignore patterns
 * @param paths - Paths to filter
 * @param ignorePatterns - Glob patterns to ignore
 */
export function ignore(paths: string[], ignorePatterns: string[]): string[] {
  return paths.filter(path => {
    for (const pattern of ignorePatterns) {
      if (isMatch(path, pattern)) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Convert glob pattern to regex (exported for testing)
 * @param pattern - Glob pattern
 */
export function patternToRegex(pattern: string): RegExp {
  return globToRegex(pattern);
}

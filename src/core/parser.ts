/**
 * Package.json parser
 *
 * Zero-dependency implementation
 *
 * @packageDocumentation
 */

import { join, dirname } from 'node:path';
import { readJson, fileExists, fileExistsSync } from '../utils/fs.js';
import {
  PackageNotFoundError,
  InvalidPackageJsonError
} from '../errors.js';
import type { PackageMetadata, DependencyType } from '../types.js';

/**
 * Find package.json in directory or its parents
 * @param startPath - Starting directory
 * @internal
 */
async function findPackageJson(startPath: string): Promise<string | null> {
  let currentPath = startPath;

  while (true) {
    const pkgPath = join(currentPath, 'package.json');

    if (await fileExists(pkgPath)) {
      return pkgPath;
    }

    const parent = dirname(currentPath);

    // Reached root
    if (parent === currentPath) {
      return null;
    }

    currentPath = parent;
  }
}

/**
 * Find package.json synchronously
 * @param startPath - Starting directory
 * @internal
 */
function findPackageJsonSync(startPath: string): string | null {
  let currentPath = startPath;

  while (true) {
    const pkgPath = join(currentPath, 'package.json');

    if (fileExistsSync(pkgPath)) {
      return pkgPath;
    }

    const parent = dirname(currentPath);

    // Reached root
    if (parent === currentPath) {
      return null;
    }

    currentPath = parent;
  }
}

/**
 * Package.json parser
 */
export class PackageParser {
  /** Cache of parsed packages */
  private cache = new Map<string, PackageMetadata>();

  /**
   * Parse package.json from path or directory
   * @param path - Path to package.json or directory containing it
   */
  async parse(path: string): Promise<PackageMetadata> {
    // Check cache first
    if (this.cache.has(path)) {
      return this.cache.get(path)!;
    }

    let pkgPath = path;

    // If directory, find package.json
    if (!path.endsWith('package.json')) {
      const found = await findPackageJson(path);

      if (!found) {
        throw new PackageNotFoundError(
          join(path, 'package.json')
        );
      }

      pkgPath = found;
    }

    // Check if file exists
    if (!(await fileExists(pkgPath))) {
      throw new PackageNotFoundError(pkgPath);
    }

    try {
      const pkg = await readJson<PackageMetadata>(pkgPath);

      // Validate required fields
      if (!pkg.name || typeof pkg.name !== 'string') {
        throw new InvalidPackageJsonError(
          pkgPath,
          new SyntaxError('Missing or invalid "name" field')
        );
      }

      if (!pkg.version || typeof pkg.version !== 'string') {
        throw new InvalidPackageJsonError(
          pkgPath,
          new SyntaxError('Missing or invalid "version" field')
        );
      }

      // Normalize dependencies to empty objects
      pkg.dependencies = pkg.dependencies ?? {};
      pkg.devDependencies = pkg.devDependencies ?? {};
      pkg.peerDependencies = pkg.peerDependencies ?? {};
      pkg.optionalDependencies = pkg.optionalDependencies ?? {};

      // Cache the result
      this.cache.set(path, pkg);
      this.cache.set(pkgPath, pkg);

      return pkg;
    } catch (error) {
      if (error instanceof InvalidPackageJsonError) {
        throw error;
      }

      if (error instanceof SyntaxError) {
        throw new InvalidPackageJsonError(pkgPath, error);
      }

      throw error;
    }
  }

  /**
   * Parse package.json synchronously
   * @param path - Path to package.json or directory containing it
   */
  parseSync(path: string): PackageMetadata {
    // Check cache first
    if (this.cache.has(path)) {
      return this.cache.get(path)!;
    }

    let pkgPath = path;

    // If directory, find package.json
    if (!path.endsWith('package.json')) {
      const found = findPackageJsonSync(path);

      if (!found) {
        throw new PackageNotFoundError(
          join(path, 'package.json')
        );
      }

      pkgPath = found;
    }

    // Check if file exists
    if (!fileExistsSync(pkgPath)) {
      throw new PackageNotFoundError(pkgPath);
    }

    try {
      const fs = require('node:fs');
      const content = fs.readFileSync(pkgPath, 'utf-8');
      const pkg = JSON.parse(content) as PackageMetadata;

      // Validate required fields
      if (!pkg.name || typeof pkg.name !== 'string') {
        throw new InvalidPackageJsonError(
          pkgPath,
          new SyntaxError('Missing or invalid "name" field')
        );
      }

      if (!pkg.version || typeof pkg.version !== 'string') {
        throw new InvalidPackageJsonError(
          pkgPath,
          new SyntaxError('Missing or invalid "version" field')
        );
      }

      // Normalize dependencies to empty objects
      pkg.dependencies = pkg.dependencies ?? {};
      pkg.devDependencies = pkg.devDependencies ?? {};
      pkg.peerDependencies = pkg.peerDependencies ?? {};
      pkg.optionalDependencies = pkg.optionalDependencies ?? {};

      // Cache the result
      this.cache.set(path, pkg);
      this.cache.set(pkgPath, pkg);

      return pkg;
    } catch (error) {
      if (error instanceof InvalidPackageJsonError) {
        throw error;
      }

      if (error instanceof SyntaxError) {
        throw new InvalidPackageJsonError(pkgPath, error);
      }

      throw error;
    }
  }

  /**
   * Validate package metadata
   * @param pkg - Package metadata to validate
   */
  validate(pkg: PackageMetadata): boolean {
    // Check required fields
    if (!pkg.name || typeof pkg.name !== 'string') {
      return false;
    }

    if (!pkg.version || typeof pkg.version !== 'string') {
      return false;
    }

    // Validate semver format
    const semverPattern = /^\d+\.\d+\.\d+(-[0-9A-Za-z-\.]+)?(\+[0-9A-Za-z-\.]+)?$/;
    if (!semverPattern.test(pkg.version)) {
      return false;
    }

    return true;
  }

  /**
   * Get dependencies by type
   * @param pkg - Package metadata
   * @param type - Dependency type
   */
  getDependencies(
    pkg: PackageMetadata,
    type?: DependencyType
  ): Record<string, string> {
    switch (type) {
      case 'prod':
        return pkg.dependencies ?? {};
      case 'dev':
        return pkg.devDependencies ?? {};
      case 'peer':
        return pkg.peerDependencies ?? {};
      case 'optional':
        return pkg.optionalDependencies ?? {};
      default:
        // Return all dependencies merged
        return {
          ...(pkg.dependencies ?? {}),
          ...(pkg.devDependencies ?? {}),
          ...(pkg.peerDependencies ?? {}),
          ...(pkg.optionalDependencies ?? {})
        };
    }
  }

  /**
   * Get all dependencies from package
   * @param pkg - Package metadata
   */
  getAllDependencies(pkg: PackageMetadata): Record<string, string> {
    return this.getDependencies(pkg);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cached package
   * @param path - Package path
   */
  getCached(path: string): PackageMetadata | undefined {
    return this.cache.get(path);
  }
}

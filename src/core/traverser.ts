/**
 * Node modules traverser
 *
 * Zero-dependency implementation
 *
 * @packageDocumentation
 */

import { join, relative } from 'node:path';
import { readFile, directoryExists, fileExists } from '../utils/fs.js';
import { NodeModulesNotFoundError } from '../errors.js';
import type {
  PackageMetadata,
  DependencyNode,
  DependencyTree,
  DependencyGraph,
  DependencyType,
  TraverseOptions
} from '../types.js';

/**
 * Node modules traverser
 */
export class NodeModulesTraverser {
  /** Package cache */
  private cache = new Map<string, PackageMetadata>();

  /**
   * Traverse node_modules and build dependency tree
   * @param rootPackage - Root package metadata
   * @param cwd - Working directory
   * @param options - Traversal options
   */
  async traverse(
    rootPackage: PackageMetadata,
    cwd: string,
    options: TraverseOptions = {}
  ): Promise<DependencyTree> {
    const nodeModulesPath = join(cwd, 'node_modules');

    // Check if node_modules exists
    if (!(await directoryExists(nodeModulesPath))) {
      throw new NodeModulesNotFoundError(nodeModulesPath);
    }

    const {
      maxDepth = Infinity,
      includeDev = true,
      includePeer = false,
      includeOptional = true
    } = options;

    // Build root node
    const root: DependencyNode = {
      name: rootPackage.name,
      version: rootPackage.version,
      type: 'prod',
      dependencies: []
    };

    // Get all dependencies to traverse
    const depsToTraverse = new Map<string, string>();

    // Production dependencies
    for (const [name, range] of Object.entries(rootPackage.dependencies ?? {})) {
      depsToTraverse.set(name, range);
    }

    // Dev dependencies
    if (includeDev) {
      for (const [name, range] of Object.entries(rootPackage.devDependencies ?? {})) {
        depsToTraverse.set(name, range);
      }
    }

    // Optional dependencies
    if (includeOptional) {
      for (const [name, range] of Object.entries(rootPackage.optionalDependencies ?? {})) {
        depsToTraverse.set(name, range);
      }
    }

    // Build tree
    const visited = new Set<string>();
    const depth = { current: 0, max: 0 };
    const count = { value: 0 };

    for (const [name, range] of depsToTraverse) {
      const node = await this.buildNode(
        name,
        range,
        nodeModulesPath,
        1,
        maxDepth,
        visited,
        depth,
        count,
        options
      );

      if (node) {
        root.dependencies.push(node);
      }
    }

    return {
      root,
      count: count.value,
      depth: depth.max
    };
  }

  /**
   * Build dependency node recursively
   * @internal
   */
  private async buildNode(
    name: string,
    range: string,
    parentPath: string,
    currentDepth: number,
    maxDepth: number,
    visited: Set<string>,
    depth: { current: number; max: number },
    count: { value: number },
    options: TraverseOptions
  ): Promise<DependencyNode | null> {
    // Check depth limit
    if (currentDepth > maxDepth) {
      return null;
    }

    // Track depth
    depth.max = Math.max(depth.max, currentDepth);

    // Resolve package version
    const version = await this.resolvePackageVersion(name, range, parentPath);

    if (!version) {
      return null;
    }

    // Create node
    const node: DependencyNode = {
      name,
      version,
      type: 'prod',
      dependencies: []
    };

    count.value++;

    // Check for circular dependencies
    const key = `${name}@${version}`;
    if (visited.has(key)) {
      return node; // Return node without traversing children
    }

    visited.add(key);

    // Get package metadata
    const pkg = await this.getPackageMetadata(name, parentPath);

    if (!pkg) {
      return node;
    }

    // Traverse nested dependencies
    const nestedPath = join(parentPath, name, 'node_modules');

    if (await directoryExists(nestedPath)) {
      const deps = pkg.dependencies ?? {};

      for (const [depName, depRange] of Object.entries(deps)) {
        const childNode = await this.buildNode(
          depName,
          depRange,
          nestedPath,
          currentDepth + 1,
          maxDepth,
          visited,
          depth,
          count,
          options
        );

        if (childNode) {
          node.dependencies.push(childNode);
        }
      }
    }

    return node;
  }

  /**
   * Resolve package version from node_modules
   * @param name - Package name
   * @param range - Version range
   * @param parentPath - Parent node_modules path
   */
  async resolvePackageVersion(
    name: string,
    range: string,
    parentPath: string
  ): Promise<string | null> {
    try {
      // Scoped package (e.g., @types/node)
      // For scoped packages, we need the full name as-is
      const pkgDir = name.startsWith('@')
        ? join(parentPath, name)
        : join(parentPath, name);

      const pkgPath = join(pkgDir, 'package.json');

      if (!(await fileExists(pkgPath))) {
        return null;
      }

      const pkg = await this.getPackageMetadata(name, parentPath);
      return pkg?.version ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Get package metadata from node_modules
   * @param name - Package name
   * @param parentPath - Parent node_modules path
   */
  async getPackageMetadata(
    name: string,
    parentPath: string
  ): Promise<PackageMetadata | null> {
    // For scoped packages (e.g., @types/node), use full name as-is
    const pkgDir = join(parentPath, name);
    const pkgPath = join(pkgDir, 'package.json');

    // Check cache
    if (this.cache.has(pkgPath)) {
      return this.cache.get(pkgPath)!;
    }

    if (!(await fileExists(pkgPath))) {
      return null;
    }

    try {
      const content = await readFile(pkgPath);
      const pkg = JSON.parse(content) as PackageMetadata;

      // Cache the result
      this.cache.set(pkgPath, pkg);

      return pkg;
    } catch {
      return null;
    }
  }

  /**
   * Get package metadata synchronously
   * @param name - Package name
   * @param parentPath - Parent node_modules path
   */
  getPackageMetadataSync(
    name: string,
    parentPath: string
  ): PackageMetadata | null {
    // For scoped packages (e.g., @types/node), use full name as-is
    const pkgDir = join(parentPath, name);
    const pkgPath = join(pkgDir, 'package.json');

    // Check cache
    if (this.cache.has(pkgPath)) {
      return this.cache.get(pkgPath)!;
    }

    try {
      const fs = require('node:fs');
      if (!fs.existsSync(pkgPath)) {
        return null;
      }

      const content = fs.readFileSync(pkgPath, 'utf-8');
      const pkg = JSON.parse(content) as PackageMetadata;

      // Cache the result
      this.cache.set(pkgPath, pkg);

      return pkg;
    } catch {
      return null;
    }
  }

  /**
   * Build dependency graph
   * @param rootPackage - Root package metadata
   * @param cwd - Working directory
   * @param options - Traversal options
   */
  async getDependencyGraph(
    rootPackage: PackageMetadata,
    cwd: string,
    options: TraverseOptions = {}
  ): Promise<DependencyGraph> {
    const nodeModulesPath = join(cwd, 'node_modules');

    const graph: DependencyGraph = {
      adjacency: new Map(),
      metadata: new Map(),
      reverse: new Map()
    };

    // Add root package
    graph.metadata.set(rootPackage.name, rootPackage);
    graph.adjacency.set(rootPackage.name, []);
    graph.reverse.set(rootPackage.name, []);

    // Get all dependencies
    const depsToTraverse = new Map<string, string>();

    for (const [name, range] of Object.entries(rootPackage.dependencies ?? {})) {
      depsToTraverse.set(name, range);
    }

    if (options.includeDev !== false) {
      for (const [name, range] of Object.entries(rootPackage.devDependencies ?? {})) {
        depsToTraverse.set(name, range);
      }
    }

    if (options.includeOptional !== false) {
      for (const [name, range] of Object.entries(rootPackage.optionalDependencies ?? {})) {
        depsToTraverse.set(name, range);
      }
    }

    // Build graph recursively
    for (const [name, range] of depsToTraverse) {
      await this.buildGraph(
        name,
        range,
        rootPackage.name,
        nodeModulesPath,
        graph,
        new Set(),
        options
      );
    }

    return graph;
  }

  /**
   * Build graph recursively
   * @internal
   */
  private async buildGraph(
    name: string,
    range: string,
    parent: string,
    parentPath: string,
    graph: DependencyGraph,
    visited: Set<string>,
    options: TraverseOptions
  ): Promise<void> {
    const key = `${parent}:${name}`;

    if (visited.has(key)) {
      return;
    }

    visited.add(key);

    // Get package metadata
    const pkg = await this.getPackageMetadata(name, parentPath);

    if (!pkg) {
      return;
    }

    // Add to graph
    graph.metadata.set(name, pkg);

    // Add edge from parent to this package
    if (!graph.adjacency.has(parent)) {
      graph.adjacency.set(parent, []);
    }
    graph.adjacency.get(parent)!.push(name);

    // Add reverse edge
    if (!graph.reverse.has(name)) {
      graph.reverse.set(name, []);
    }
    graph.reverse.get(name)!.push(parent);

    // Initialize adjacency for this package
    if (!graph.adjacency.has(name)) {
      graph.adjacency.set(name, []);
    }

    // Traverse nested dependencies
    const nestedPath = join(parentPath, name, 'node_modules');
    const deps = pkg.dependencies ?? {};

    for (const [depName, depRange] of Object.entries(deps)) {
      await this.buildGraph(
        depName,
        depRange,
        name,
        nestedPath,
        graph,
        visited,
        options
      );
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

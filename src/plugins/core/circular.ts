/**
 * Circular plugin - Circular dependency detection using Tarjan's algorithm
 *
 * Zero-dependency implementation
 *
 * @packageDocumentation
 */

import type { AnalyzerPlugin, AnalyzerContext, CircularChain } from '../../types.js';

/**
 * Tarjan's strongly connected components algorithm
 * @param graph - Dependency graph adjacency list
 * @returns Array of cycles (each cycle is an array of package names)
 */
function findCircularDependencies(
  graph: Map<string, string[]>
): CircularChain[] {
  const cycles: CircularChain[] = [];
  let index = 0;
  const stack: string[] = [];
  const indices = new Map<string, number>();
  const lowLink = new Map<string, number>();
  const onStack = new Set<string>();

  function strongConnect(v: string): void {
    // Set the depth index for v to the smallest unused index
    indices.set(v, index);
    lowLink.set(v, index);
    index++;
    stack.push(v);
    onStack.add(v);

    // Consider successors of v
    const successors = graph.get(v) ?? [];

    for (const w of successors) {
      if (!indices.has(w)) {
        // Successor w has not yet been visited; recurse on it
        strongConnect(w);
        const lowLinkV = lowLink.get(v) ?? 0;
        const lowLinkW = lowLink.get(w) ?? 0;
        lowLink.set(v, Math.min(lowLinkV, lowLinkW));
      } else if (onStack.has(w)) {
        // Successor w is in stack S and hence in the current SCC
        const lowLinkV = lowLink.get(v) ?? 0;
        const indexW = indices.get(w) ?? 0;
        lowLink.set(v, Math.min(lowLinkV, indexW));
      }
    }

    // If v is a root node, pop the stack and generate an SCC
    const lowLinkV = lowLink.get(v) ?? 0;
    const indexV = indices.get(v) ?? 0;

    if (lowLinkV === indexV) {
      const scc: string[] = [];

      let w: string | undefined;
      do {
        w = stack.pop();
        if (w) {
          onStack.delete(w);
          scc.push(w);
        }
      } while (w !== v && w !== undefined);

      // A cycle is only present if SCC has more than one node
      // or a node has a self-loop
      if (scc.length > 1) {
        // Find the cycle order
        const startNode = scc[0];
        if (startNode) {
          const cycle = findCycleOrder(graph, startNode, scc);
          if (cycle.length > 1) {
            cycles.push(cycle);
          }
        }
      } else if (scc.length === 1) {
        // Check for self-loop
        const node = scc[0];
        if (node) {
          const successors = graph.get(node) ?? [];
          if (successors.includes(node)) {
            cycles.push([node, node]);
          }
        }
      }
    }
  }

  // Find all SCCs
  for (const v of graph.keys()) {
    if (!indices.has(v)) {
      strongConnect(v);
    }
  }

  return cycles;
}

/**
 * Find the actual cycle order from an SCC
 * @param graph - Dependency graph
 * @param start - Starting node
 * @param scc - Strongly connected component (nodes in the cycle)
 * @returns Ordered cycle
 */
function findCycleOrder(
  graph: Map<string, string[]>,
  start: string,
  scc: string[]
): CircularChain {
  const cycle: string[] = [start];
  const visited = new Set<string>([start]);
  const sccSet = new Set(scc);

  function dfs(current: string): boolean {
    const successors = (graph.get(current) ?? []).filter(s => sccSet.has(s));

    for (const successor of successors) {
      if (successor === start) {
        cycle.push(successor);
        return true;
      }

      if (!visited.has(successor)) {
        visited.add(successor);
        cycle.push(successor);

        if (dfs(successor)) {
          return true;
        }

        cycle.pop();
      }
    }

    return false;
  }

  dfs(start);
  return cycle;
}

/**
 * Circular dependency detection plugin
 */
export const circularPlugin: AnalyzerPlugin<AnalyzerContext> = {
  name: 'circular',
  version: '1.0.0',

  install(kernel) {
    kernel.on('analyze', async (context) => {
      kernel.reportProgress('circular', 0, 'Detecting circular dependencies');

      // Get the dependency graph from context
      const graph = context.graph.adjacency;

      // Find circular dependencies using Tarjan's algorithm
      const cycles = findCircularDependencies(graph);

      // Store result in kernel
      (kernel as any).setResult('circular', cycles);

      // Report findings
      for (const chain of cycles) {
        const message = `Circular dependency: ${chain.join(' → ')} → ${chain[0]}`;
        kernel.reportFinding('circular', 'error', message);
      }

      kernel.reportProgress('circular', 100, `Found ${cycles.length} circular dependencies`);
    });
  }
};

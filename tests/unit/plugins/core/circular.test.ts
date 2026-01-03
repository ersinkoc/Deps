/**
 * Tests for circular plugin
 *
 * @packageDocumentation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { circularPlugin } from '../../../../src/plugins/core/circular.js';
import type { DependencyGraph } from '../../../../src/types.js';

const testDir = 'test-circular-plugin-temp';

describe('circularPlugin', () => {
  it('should have correct plugin metadata', () => {
    expect(circularPlugin.name).toBe('circular');
    expect(circularPlugin.version).toBe('1.0.0');
    expect(typeof circularPlugin.install).toBe('function');
  });

  it('should detect circular dependencies in a simple cycle', async () => {
    // Create a simple circular graph: a -> b -> a
    const graph = new Map<string, string[]>();
    graph.set('pkg-a', ['pkg-b']);
    graph.set('pkg-b', ['pkg-a']);

    const mockContext = {
      graph: { adjacency: graph, metadata: new Map(), reverse: new Map() },
      package: { name: 'test', version: '1.0.0' },
      cwd: testDir,
      startTime: Date.now()
    };

    const mockKernel = {
      on: (event: string, handler: any) => {
        // Simulate the analyze event
        if (event === 'analyze') {
          handler(mockContext);
        }
      },
      reportProgress: () => {},
      reportFinding: () => {},
      setResult: (key: string, value: any) => {
        // Capture the circular dependencies result
        if (key === 'circular') {
          expect(value.length).toBeGreaterThan(0);
          expect(value[0]).toContain('pkg-a');
          expect(value[0]).toContain('pkg-b');
        }
      }
    };

    circularPlugin.install(mockKernel as any);
  });

  it('should detect self-loop (package depending on itself)', async () => {
    // Create a self-loop: a -> a
    const graph = new Map<string, string[]>();
    graph.set('pkg-a', ['pkg-a']);

    const mockContext = {
      graph: { adjacency: graph, metadata: new Map(), reverse: new Map() },
      package: { name: 'test', version: '1.0.0' },
      cwd: testDir,
      startTime: Date.now()
    };

    const mockKernel = {
      on: (event: string, handler: any) => {
        if (event === 'analyze') {
          handler(mockContext);
        }
      },
      reportProgress: () => {},
      reportFinding: () => {},
      setResult: (key: string, value: any) => {
        if (key === 'circular') {
          expect(value.length).toBeGreaterThan(0);
          expect(value[0]).toEqual(['pkg-a', 'pkg-a']);
        }
      }
    };

    circularPlugin.install(mockKernel as any);
  });

  it('should return empty array when no circular dependencies', async () => {
    // Create an acyclic graph: a -> b -> c
    const graph = new Map<string, string[]>();
    graph.set('pkg-a', ['pkg-b']);
    graph.set('pkg-b', ['pkg-c']);
    graph.set('pkg-c', []);

    const mockContext = {
      graph: { adjacency: graph, metadata: new Map(), reverse: new Map() },
      package: { name: 'test', version: '1.0.0' },
      cwd: testDir,
      startTime: Date.now()
    };

    const mockKernel = {
      on: (event: string, handler: any) => {
        if (event === 'analyze') {
          handler(mockContext);
        }
      },
      reportProgress: () => {},
      reportFinding: () => {},
      setResult: (key: string, value: any) => {
        if (key === 'circular') {
          expect(value).toEqual([]);
        }
      }
    };

    circularPlugin.install(mockKernel as any);
  });

  it('should detect complex circular dependency chains', async () => {
    // a -> b -> c -> a
    const graph = new Map<string, string[]>();
    graph.set('pkg-a', ['pkg-b']);
    graph.set('pkg-b', ['pkg-c']);
    graph.set('pkg-c', ['pkg-a']);

    const mockContext = {
      graph: { adjacency: graph, metadata: new Map(), reverse: new Map() },
      package: { name: 'test', version: '1.0.0' },
      cwd: testDir,
      startTime: Date.now()
    };

    const mockKernel = {
      on: (event: string, handler: any) => {
        if (event === 'analyze') {
          handler(mockContext);
        }
      },
      reportProgress: () => {},
      reportFinding: () => {},
      setResult: (key: string, value: any) => {
        if (key === 'circular') {
          expect(value.length).toBeGreaterThan(0);
          expect(value[0]).toContain('pkg-a');
          expect(value[0]).toContain('pkg-b');
          expect(value[0]).toContain('pkg-c');
        }
      }
    };

    circularPlugin.install(mockKernel as any);
  });

  it('should detect multiple separate cycles', async () => {
    // Cycle 1: a -> b -> a
    // Cycle 2: c -> d -> c
    const graph = new Map<string, string[]>();
    graph.set('pkg-a', ['pkg-b']);
    graph.set('pkg-b', ['pkg-a']);
    graph.set('pkg-c', ['pkg-d']);
    graph.set('pkg-d', ['pkg-c']);

    const mockContext = {
      graph: { adjacency: graph, metadata: new Map(), reverse: new Map() },
      package: { name: 'test', version: '1.0.0' },
      cwd: testDir,
      startTime: Date.now()
    };

    const mockKernel = {
      on: (event: string, handler: any) => {
        if (event === 'analyze') {
          handler(mockContext);
        }
      },
      reportProgress: () => {},
      reportFinding: () => {},
      setResult: (key: string, value: any) => {
        if (key === 'circular') {
          expect(value.length).toBeGreaterThanOrEqual(2);
        }
      }
    };

    circularPlugin.install(mockKernel as any);
  });

  it('should report progress', async () => {
    const graph = new Map<string, string[]>();

    const mockContext = {
      graph: { adjacency: graph, metadata: new Map(), reverse: new Map() },
      package: { name: 'test', version: '1.0.0' },
      cwd: testDir,
      startTime: Date.now()
    };

    const progressCalls: any[] = [];

    const mockKernel = {
      on: (event: string, handler: any) => {
        if (event === 'analyze') {
          handler(mockContext);
        }
      },
      reportProgress: (plugin: string, percent: number, message?: string) => {
        if (plugin === 'circular') {
          progressCalls.push({ percent, message });
        }
      },
      reportFinding: () => {},
      setResult: () => {}
    };

    circularPlugin.install(mockKernel as any);
    // Should have at least one progress call with 100%
    const finalCall = progressCalls[progressCalls.length - 1];
    expect(finalCall.percent).toBe(100);
  });

  it('should report findings for each cycle', async () => {
    // a -> b -> a
    const graph = new Map<string, string[]>();
    graph.set('pkg-a', ['pkg-b']);
    graph.set('pkg-b', ['pkg-a']);

    const mockContext = {
      graph: { adjacency: graph, metadata: new Map(), reverse: new Map() },
      package: { name: 'test', version: '1.0.0' },
      cwd: testDir,
      startTime: Date.now()
    };

    let findingReported = false;

    const mockKernel = {
      on: (event: string, handler: any) => {
        if (event === 'analyze') {
          handler(mockContext);
        }
      },
      reportProgress: () => {},
      reportFinding: (type: string, severity: string, message: string) => {
        if (type === 'circular') {
          findingReported = true;
          expect(severity).toBe('error');
          expect(message).toContain('Circular dependency');
        }
      },
      setResult: () => {}
    };

    circularPlugin.install(mockKernel as any);
    expect(findingReported).toBe(true);
  });

  it('should handle larger complex graphs', async () => {
    // Multiple interconnected packages with some cycles
    const graph = new Map<string, string[]>();
    graph.set('pkg-a', ['pkg-b', 'pkg-c']);
    graph.set('pkg-b', ['pkg-d']);
    graph.set('pkg-c', ['pkg-d']);
    graph.set('pkg-d', ['pkg-e']);
    graph.set('pkg-e', []); // No cycle
    graph.set('pkg-f', ['pkg-g']);
    graph.set('pkg-g', ['pkg-f']); // Cycle: f -> g -> f

    const mockContext = {
      graph: { adjacency: graph, metadata: new Map(), reverse: new Map() },
      package: { name: 'test', version: '1.0.0' },
      cwd: testDir,
      startTime: Date.now()
    };

    const mockKernel = {
      on: (event: string, handler: any) => {
        if (event === 'analyze') {
          handler(mockContext);
        }
      },
      reportProgress: () => {},
      reportFinding: () => {},
      setResult: (key: string, value: any) => {
        if (key === 'circular') {
          // Should find the f -> g -> f cycle
          expect(value.length).toBeGreaterThan(0);
        }
      }
    };

    circularPlugin.install(mockKernel as any);
  });

  it('should handle graph with no cycles', async () => {
    // Linear graph: a -> b -> c -> d (no cycle)
    const graph = new Map<string, string[]>();
    graph.set('pkg-a', ['pkg-b']);
    graph.set('pkg-b', ['pkg-c']);
    graph.set('pkg-c', ['pkg-d']);
    graph.set('pkg-d', []);

    const mockContext = {
      graph: { adjacency: graph, metadata: new Map(), reverse: new Map() },
      package: { name: 'test', version: '1.0.0' },
      cwd: testDir,
      startTime: Date.now()
    };

    const mockKernel = {
      on: (event: string, handler: any) => {
        if (event === 'analyze') {
          handler(mockContext);
        }
      },
      reportProgress: () => {},
      reportFinding: () => {},
      setResult: (key: string, value: any) => {
        if (key === 'circular') {
          // Should find no cycles
          expect(value).toEqual([]);
        }
      }
    };

    circularPlugin.install(mockKernel as any);
  });

  it('should backtrack when encountering already visited node', async () => {
    // Diamond graph: a -> b, a -> c, b -> d, c -> d (no cycle, but d is visited twice)
    const graph = new Map<string, string[]>();
    graph.set('pkg-a', ['pkg-b', 'pkg-c']);
    graph.set('pkg-b', ['pkg-d']);
    graph.set('pkg-c', ['pkg-d']);
    graph.set('pkg-d', []);

    const mockContext = {
      graph: { adjacency: graph, metadata: new Map(), reverse: new Map() },
      package: { name: 'test', version: '1.0.0' },
      cwd: testDir,
      startTime: Date.now()
    };

    const mockKernel = {
      on: (event: string, handler: any) => {
        if (event === 'analyze') {
          handler(mockContext);
        }
      },
      reportProgress: () => {},
      reportFinding: () => {},
      setResult: (key: string, value: any) => {
        if (key === 'circular') {
          // Should find no cycles despite d being reached from two paths
          expect(value).toEqual([]);
        }
      }
    };

    circularPlugin.install(mockKernel as any);
  });

  it('should find cycle order in complex SCC requiring backtracking', async () => {
    // Complex cycle: a -> b -> c -> d -> a, plus additional edges
    // This tests lines 130-131, 134 (backtracking and return false)
    const graph = new Map<string, string[]>();
    graph.set('pkg-a', ['pkg-b', 'pkg-x']);  // a has an extra edge to x
    graph.set('pkg-b', ['pkg-c']);
    graph.set('pkg-c', ['pkg-d', 'pkg-y']); // c has extra edge to y
    graph.set('pkg-d', ['pkg-a']); // This creates the cycle: a -> b -> c -> d -> a
    graph.set('pkg-x', []);
    graph.set('pkg-y', []);

    const mockContext = {
      graph: { adjacency: graph, metadata: new Map(), reverse: new Map() },
      package: { name: 'test', version: '1.0.0' },
      cwd: testDir,
      startTime: Date.now()
    };

    const mockKernel = {
      on: (event: string, handler: any) => {
        if (event === 'analyze') {
          handler(mockContext);
        }
      },
      reportProgress: () => {},
      reportFinding: () => {},
      setResult: (key: string, value: any) => {
        if (key === 'circular') {
          // Should find the cycle a -> b -> c -> d -> a
          expect(value.length).toBeGreaterThan(0);
          const cycle = value[0];
          expect(cycle).toContain('pkg-a');
          expect(cycle).toContain('pkg-b');
          expect(cycle).toContain('pkg-c');
          expect(cycle).toContain('pkg-d');
        }
      }
    };

    circularPlugin.install(mockKernel as any);
  });

  it('should backtrack and explore multiple paths', async () => {
    // More specific test for lines 130-131, 134 (cycle.pop() and return false)
    // Graph: a -> b, a -> c, b -> d, c -> d, d -> e (no cycle, but requires backtracking)
    const graph = new Map<string, string[]>();
    graph.set('pkg-a', ['pkg-b', 'pkg-c']);  // a has two paths
    graph.set('pkg-b', ['pkg-d']);
    graph.set('pkg-c', ['pkg-d']);  // both b and c lead to d
    graph.set('pkg-d', ['pkg-e']);
    graph.set('pkg-e', []);

    const mockContext = {
      graph: { adjacency: graph, metadata: new Map(), reverse: new Map() },
      package: { name: 'test', version: '1.0.0' },
      cwd: testDir,
      startTime: Date.now()
    };

    const mockKernel = {
      on: (event: string, handler: any) => {
        if (event === 'analyze') {
          handler(mockContext);
        }
      },
      reportProgress: () => {},
      reportFinding: () => {},
      setResult: (key: string, value: any) => {
        if (key === 'circular') {
          // Should find no cycles despite complex path exploration
          expect(value).toEqual([]);
        }
      }
    };

    circularPlugin.install(mockKernel as any);
  });

  it('should handle multiple start nodes in same graph', async () => {
    // Tests line 134: return false after exhausting all paths
    const graph = new Map<string, string[]>();
    graph.set('pkg-a', ['pkg-b']);
    graph.set('pkg-b', []);
    graph.set('pkg-c', ['pkg-d']);
    graph.set('pkg-d', []);

    const mockContext = {
      graph: { adjacency: graph, metadata: new Map(), reverse: new Map() },
      package: { name: 'test', version: '1.0.0' },
      cwd: testDir,
      startTime: Date.now()
    };

    let callCount = 0;
    const mockKernel = {
      on: (event: string, handler: any) => {
        if (event === 'analyze') {
          handler(mockContext);
        }
      },
      reportProgress: () => {},
      reportFinding: () => {},
      setResult: (key: string, value: any) => {
        if (key === 'circular') {
          callCount++;
          // Should find no cycles
          expect(value).toEqual([]);
        }
      }
    };

    circularPlugin.install(mockKernel as any);
    expect(callCount).toBe(1);
  });

  it('should handle self-loop dependency', async () => {
    // Tests lines 76-82: scc.length === 1 and self-loop check
    const graph = new Map<string, string[]>();
    graph.set('pkg-a', ['pkg-a']); // Self-loop

    const mockContext = {
      graph: { adjacency: graph, metadata: new Map(), reverse: new Map() },
      package: { name: 'test', version: '1.0.0' },
      cwd: testDir,
      startTime: Date.now()
    };

    const mockKernel = {
      on: (event: string, handler: any) => {
        if (event === 'analyze') {
          handler(mockContext);
        }
      },
      reportProgress: () => {},
      reportFinding: () => {},
      setResult: (key: string, value: any) => {
        if (key === 'circular') {
          // Should find self-loop cycle: [pkg-a, pkg-a]
          expect(value.length).toBe(1);
          expect(value[0]).toEqual(['pkg-a', 'pkg-a']);
        }
      }
    };

    circularPlugin.install(mockKernel as any);
  });

  it('should handle multiple separate cycles', async () => {
    // Tests lines 70-75: scc.length > 1 and findCycleOrder
    const graph = new Map<string, string[]>();
    // First cycle: a -> b -> a
    graph.set('pkg-a', ['pkg-b']);
    graph.set('pkg-b', ['pkg-a']);
    // Second cycle: x -> y -> x
    graph.set('pkg-x', ['pkg-y']);
    graph.set('pkg-y', ['pkg-x']);

    const mockContext = {
      graph: { adjacency: graph, metadata: new Map(), reverse: new Map() },
      package: { name: 'test', version: '1.0.0' },
      cwd: testDir,
      startTime: Date.now()
    };

    const mockKernel = {
      on: (event: string, handler: any) => {
        if (event === 'analyze') {
          handler(mockContext);
        }
      },
      reportProgress: () => {},
      reportFinding: () => {},
      setResult: (key: string, value: any) => {
        if (key === 'circular') {
          // Should find both cycles
          expect(value.length).toBe(2);
        }
      }
    };

    circularPlugin.install(mockKernel as any);
  });

  it('should handle already visited successor in DFS', async () => {
    // Tests line 122: when !visited.has(successor) is false (successor already visited)
    // This creates a cycle where DFS encounters a node already in the current path
    const graph = new Map<string, string[]>();
    // Triangle: a -> b -> c -> a, but also a -> c (direct edge)
    graph.set('pkg-a', ['pkg-b', 'pkg-c']);
    graph.set('pkg-b', ['pkg-c']);
    graph.set('pkg-c', ['pkg-a']);

    const mockContext = {
      graph: { adjacency: graph, metadata: new Map(), reverse: new Map() },
      package: { name: 'test', version: '1.0.0' },
      cwd: testDir,
      startTime: Date.now()
    };

    const mockKernel = {
      on: (event: string, handler: any) => {
        if (event === 'analyze') {
          handler(mockContext);
        }
      },
      reportProgress: () => {},
      reportFinding: () => {},
      setResult: (key: string, value: any) => {
        if (key === 'circular') {
          // Should find the cycle
          expect(value.length).toBeGreaterThan(0);
        }
      }
    };

    circularPlugin.install(mockKernel as any);
  });

  it('should handle complex cycle with cross references', async () => {
    // Tests line 56: lowLinkV === indexV check (node is root of SCC)
    // Graph with multiple interconnected nodes forming one SCC
    const graph = new Map<string, string[]>();
    // Complex SCC: a <-> b, b <-> c, c <-> a (fully connected triangle)
    graph.set('pkg-a', ['pkg-b', 'pkg-c']);
    graph.set('pkg-b', ['pkg-a', 'pkg-c']);
    graph.set('pkg-c', ['pkg-a', 'pkg-b']);

    const mockContext = {
      graph: { adjacency: graph, metadata: new Map(), reverse: new Map() },
      package: { name: 'test', version: '1.0.0' },
      cwd: testDir,
      startTime: Date.now()
    };

    const mockKernel = {
      on: (event: string, handler: any) => {
        if (event === 'analyze') {
          handler(mockContext);
        }
      },
      reportProgress: () => {},
      reportFinding: () => {},
      setResult: (key: string, value: any) => {
        if (key === 'circular') {
          // Should detect cycle(s) in the SCC
          expect(value.length).toBeGreaterThan(0);
        }
      }
    };

    circularPlugin.install(mockKernel as any);
  });

  it('should handle node with no dependencies in cycle detection', async () => {
    // Tests line 90: strongConnect(v) when indices.has(v) is true (already visited)
    // We need multiple components where some nodes have no dependencies
    const graph = new Map<string, string[]>();
    graph.set('pkg-a', ['pkg-b']);
    graph.set('pkg-b', ['pkg-a']);
    graph.set('pkg-c', []); // No dependencies, separate component
    graph.set('pkg-d', []); // Another separate component

    const mockContext = {
      graph: { adjacency: graph, metadata: new Map(), reverse: new Map() },
      package: { name: 'test', version: '1.0.0' },
      cwd: testDir,
      startTime: Date.now()
    };

    const mockKernel = {
      on: (event: string, handler: any) => {
        if (event === 'analyze') {
          handler(mockContext);
        }
      },
      reportProgress: () => {},
      reportFinding: () => {},
      setResult: (key: string, value: any) => {
        if (key === 'circular') {
          // Should find the a -> b -> a cycle
          expect(value.length).toBe(1);
          expect(value[0]).toContain('pkg-a');
          expect(value[0]).toContain('pkg-b');
        }
      }
    };

    circularPlugin.install(mockKernel as any);
  });
});

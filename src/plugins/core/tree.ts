/**
 * Tree plugin - Dependency tree visualization
 *
 * Zero-dependency implementation
 *
 * @packageDocumentation
 */

import type { AnalyzerPlugin, AnalyzerContext, DependencyNode, DependencyTree } from '../../types.js';
import type { AnalyzerKernel as IAnalyzerKernel } from '../../types.js';

/**
 * Tree plugin for dependency tree visualization
 */
export const treePlugin: AnalyzerPlugin<AnalyzerContext> = {
  name: 'tree',
  version: '1.0.0',

  install(kernel) {
    kernel.on('analyze', async (context) => {
      kernel.reportProgress('tree', 0, 'Building dependency tree');

      // Tree is already built by the kernel
      // Just report completion
      kernel.reportProgress('tree', 100, 'Dependency tree complete');
    });
  },

  onInit(context) {
    // Tree is built during kernel run
  }
};

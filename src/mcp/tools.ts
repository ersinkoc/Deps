/**
 * MCP tool definitions
 *
 * @packageDocumentation
 */

import type { MCPTool } from './server.js';

/**
 * Get available MCP tools
 */
export function getMCPTools(): MCPTool[] {
  return [
    {
      name: 'analyze_dependencies',
      description: 'Analyze dependencies of a Node.js project with comprehensive analysis including tree, circular deps, unused, missing, duplicates, size, updates, and security',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to package.json or project directory'
          },
          plugins: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Plugins to enable (tree, circular, unused, missing, duplicates, size, updates, security, monorepo)'
          }
        },
        required: []
      }
    },
    {
      name: 'get_circular_deps',
      description: 'Get circular dependencies in a Node.js project using Tarjan\'s algorithm',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to package.json or project directory'
          }
        },
        required: []
      }
    },
    {
      name: 'get_unused_deps',
      description: 'Get unused dependencies that are listed in package.json but not imported in the codebase',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to package.json or project directory'
          }
        },
        required: []
      }
    },
    {
      name: 'check_size_budget',
      description: 'Check if project dependencies exceed a specified size budget',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to package.json or project directory'
          },
          limit: {
            type: 'string',
            description: 'Size limit (e.g., "500kb", "2MB")'
          }
        },
        required: []
      }
    },
    {
      name: 'security_audit',
      description: 'Run security audit on dependencies using npm audit',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to package.json or project directory'
          }
        },
        required: []
      }
    }
  ];
}

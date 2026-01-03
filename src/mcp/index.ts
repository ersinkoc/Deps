/**
 * MCP (Model Context Protocol) server for @oxog/deps
 *
 * Allows AI assistants to analyze dependencies through a standardized protocol
 *
 * @packageDocumentation
 */

import type { MCPServer } from './server.js';
import { createMCPServerImpl } from './server.js';

/**
 * Create an MCP server instance
 *
 * @returns MCP server instance
 *
 * @example
 * ```typescript
 * const server = createMCPServer();
 * await server.start();
 * ```
 */
export function createMCPServer(): MCPServer {
  return createMCPServerImpl();
}

// Export server types
export type { MCPServer, MCPTool, MCPToolResponse } from './server.js';

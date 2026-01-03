/**
 * MCP server implementation
 *
 * Zero-dependency implementation for stdio communication
 *
 * @packageDocumentation
 */

import { resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { deps } from '../index.js';
import { getMCPTools } from './tools.js';

/**
 * MCP tool definition
 */
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
    }>;
    required?: string[];
  };
}

/**
 * MCP tool response
 */
export interface MCPToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

/**
 * MCP server interface
 */
export interface MCPServer {
  start(): Promise<void>;
  stop(): Promise<void>;
}

/**
 * MCP server implementation
 */
class StdioMCPServer implements MCPServer {
  private rl: ReturnType<typeof createInterface> | null = null;
  private running = false;

  /**
   * Initialize stdin/stdio interface
   */
  private initStdio(): void {
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    this.rl.on('line', async (line) => {
      if (!this.running) return;

      try {
        const data = JSON.parse(line);
        await this.handleMessage(data);
      } catch {
        // Invalid JSON, ignore
      }
    });
  }

  /**
   * Handle incoming MCP message
   */
  private async handleMessage(data: {
    jsonrpc: string;
    id?: string | number;
    method?: string;
    params?: unknown;
  }): Promise<void> {
    const { jsonrpc, id, method, params } = data;

    if (jsonrpc !== '2.0') {
      return;
    }

    switch (method) {
      case 'initialize':
        this.sendResponse(id, {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: '@oxog/deps',
            version: '1.0.0'
          }
        });
        break;

      case 'tools/list':
        this.sendResponse(id, {
          tools: getMCPTools()
        });
        break;

      case 'tools/call':
        const toolParams = params as { name: string; arguments: Record<string, unknown> };
        const result = await this.callTool(toolParams.name, toolParams.arguments);
        this.sendResponse(id, result);
        break;

      case 'shutdown':
        this.sendResponse(id, null);
        await this.stop();
        break;

      default:
        this.sendError(id, -32601, 'Method not found');
    }
  }

  /**
   * Call a tool
   */
  private async callTool(
    name: string,
    args: Record<string, unknown>
  ): Promise<MCPToolResponse> {
    const cwd = resolve((args.path as string) ?? process.cwd());

    try {
      switch (name) {
        case 'analyze_dependencies': {
          const plugins = (args.plugins as string[]) ?? ['tree', 'circular'];
          const result = await deps.analyze(cwd, {
            plugins: plugins as any[],
            full: true
          });

          return {
            content: [{
              type: 'text',
              text: result.toReport('json')
            }]
          };
        }

        case 'get_circular_deps': {
          const result = await deps.analyze(cwd, {
            plugins: ['tree', 'circular']
          });

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                count: result.circular.length,
                chains: result.circular
              }, null, 2)
            }]
          };
        }

        case 'get_unused_deps': {
          const result = await deps.analyze(cwd, {
            full: true
          });

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                count: result.unused?.length ?? 0,
                packages: result.unused ?? []
              }, null, 2)
            }]
          };
        }

        case 'check_size_budget': {
          const limit = (args.limit as string) ?? '500kb';
          const result = await deps.analyze(cwd, {
            full: true
          });

          const { parseSize } = await import('../utils/size.js');
          const limitBytes = parseSize(limit);
          const totalBytes = result.size?.total ?? 0;
          const exceeds = totalBytes > limitBytes;

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                total: result.size?.totalFormatted ?? '0 B',
                limit: limit,
                exceeds,
                withinBudget: !exceeds
              }, null, 2)
            }]
          };
        }

        case 'security_audit': {
          const result = await deps.analyze(cwd, {
            full: true
          });

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                total: result.security?.total ?? 0,
                bySeverity: result.security?.bySeverity ?? {
                  critical: 0,
                  high: 0,
                  moderate: 0,
                  low: 0
                },
                vulnerabilities: result.security?.vulnerabilities ?? []
              }, null, 2)
            }]
          };
        }

        default:
          return {
            content: [{
              type: 'text',
              text: `Unknown tool: ${name}`
            }],
            isError: true
          };
      }
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }

  /**
   * Send response to client
   */
  private sendResponse(id: string | number | undefined, result: unknown): void {
    const response = {
      jsonrpc: '2.0',
      id,
      result
    };

    console.log(JSON.stringify(response));
  }

  /**
   * Send error to client
   */
  private sendError(id: string | number | undefined, code: number, message: string): void {
    const response = {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message
      }
    };

    console.log(JSON.stringify(response));
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    this.running = true;
    this.initStdio();

    // Send ready notification
    console.log(JSON.stringify({
      jsonrpc: '2.0',
      method: 'notifications/initialized'
    }));
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    this.running = false;

    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }
}

/**
 * Create MCP server instance
 */
export function createMCPServerImpl(): MCPServer {
  return new StdioMCPServer();
}

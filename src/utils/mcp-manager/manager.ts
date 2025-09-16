import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Client as MCPClient } from '@modelcontextprotocol/sdk/client/index.js';

import { MCPServerId, MCPServer, MCPTool } from './types.js';

export class MCPManager {
  private clients: Map<string, MCPClient> = new Map();
  private servers: Map<string, MCPServer> = new Map();

  async connectServer(mcpServer: MCPServer): Promise<void> {
    const mcpClients = new MCPClient({
      name: `${mcpServer.id}-client`,
      version: '1.0.0',
    });

    const transport = new StreamableHTTPClientTransport(new URL(mcpServer.remoteUrl));

    await mcpClients.connect(transport);
    this.clients.set(mcpServer.id, mcpClients);
    this.servers.set(mcpServer.id, mcpServer);
  }

  async disconnectServer(serverId: string): Promise<void> {
    const client = this.clients.get(serverId);
    if (client) {
      await client.close();
      this.clients.delete(serverId);
    }
  }

  getServerConfig(serverId: string): MCPServer | undefined {
    return this.servers.get(serverId);
  }

  async getAvailableTools(): Promise<Map<MCPServerId, MCPTool[]>> {
    const toolsByServer = new Map<MCPServerId, MCPTool[]>();

    for (const [serverId, client] of this.clients) {
      try {
        const tools = await client.listTools();
        toolsByServer.set(serverId, tools.tools);
      } catch (error) {
        console.error(`Failed to get tools from ${serverId}:`, error);
        toolsByServer.set(serverId, []);
      }
    }

    return toolsByServer;
  }

  async executeCallTool(serverId: string, toolName: string, args: any): Promise<any> {
    const client = this.clients.get(serverId);
    if (!client) {
      throw new Error(`MCP server ${serverId} not found or not connected`);
    }

    return await client.callTool({
      name: toolName,
      arguments: args,
    });
  }
}

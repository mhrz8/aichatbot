import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Client as MCPClient } from '@modelcontextprotocol/sdk/client/index.js';

import { ToolDictionary, MCPServerId, MCPToolName, MCPServer, MCPTool } from './types.js';

export class MCPManager {
  private clients: Map<string, MCPClient> = new Map();
  private servers: Map<string, MCPServer> = new Map();

  async connectServer(mcpServer: MCPServer): Promise<void> {
    await new Promise((res) => setTimeout(res, 5000));
    const mcpClients = new MCPClient({
      name: `${mcpServer.id}-client`,
      version: '1.0.0',
    });

    console.info(`Connecting to MCP Server '${mcpServer.name}' (${mcpServer.remoteUrl})`);

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

  async listTools(): Promise<Map<MCPServerId, MCPTool[]>> {
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

  async getAvailableTools(): Promise<{
    allServerTools: MCPTool[],
    serverToolsMap: Map<MCPServerId, MCPTool[]>,
    toolDictionary: ToolDictionary,
  }> {
    const allServerTools: MCPTool[] = [];
    const serverToolsMap = await this.listTools();
    const toolDictionary: ToolDictionary = new Map<MCPToolName, { serverId: MCPServerId }>();

    for (const [serverId, tools] of serverToolsMap) {
      for (const tool of tools) {
        allServerTools.push({
          name: `${serverId}__${tool.name}`,
          description: `[${serverId}] ${tool.description}`,
          inputSchema: tool.inputSchema,
        });
        toolDictionary.set(`${serverId}__${tool.name}`, { serverId });
      }
    }

    return {
      allServerTools,
      serverToolsMap,
      toolDictionary,
    };
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

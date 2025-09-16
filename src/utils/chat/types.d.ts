import { MCPServerId } from '../mcp-manager/types.js';

export type ToolDictionary = Map<FullMCPToolName, {
  serverId: MCPServerId
}>;

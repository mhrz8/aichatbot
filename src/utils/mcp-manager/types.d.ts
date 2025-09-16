export type MCPServerId = string;
export type MCPToolName = string;

export type ToolDictionary = Map<MCPToolName, {
  serverId: MCPServerId
}>;

export type MCPServer = {
  id: MCPServerId;
  name: string;
  description: string;
  remoteUrl: string;
};

export type MCPTool = {
  name: MCPToolName;
  description?: string;
  inputSchema: {
    [x: string]: unknown;
    type: 'object';
    required?: string[] | undefined;
    properties?: { [x: string]: unknown; } | undefined;
  }
};

/**
 * MCP Tool name as string with `'serverId__toolName'` format
 */
export type FullMCPToolName = string;

export type FlattenMCPTools = Array<{
  name: FullMCPToolName;
  description?: string;
  inputSchema: {
    [x: string]: unknown;
    type: 'object';
    required?: string[] | undefined;
    properties?: { [x: string]: unknown; } | undefined;
  }
}>;

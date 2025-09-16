import { ContentBlock, Message } from '@aws-sdk/client-bedrock-runtime';

import { FlattenMCPTools, FullMCPToolName } from '../bedrock/types.js';
import { MCPServerId, MCPTool } from '../mcp-manager/types.js';
import { MCPManager } from '../mcp-manager/manager.js';
import { BedrockManager } from '../bedrock/manager.js';
import { ToolDictionary } from './types.js';

export class ChatOrchestrator {
  constructor(
    private mcpManager: MCPManager,
    private bedrockManager: BedrockManager,
  ) {}

  async processUserMessage(
    modelId: string,
    sessionId: string,
    rawMessages: Message[],
  ) {
    let messages = structuredClone(rawMessages);
    const {
      allServerTools,
      serverToolsMap,
      toolDictionary,
    } = await this.getMCPTools();

    const systemPrompt = this.buildToolSystemPrompt(serverToolsMap);

    console.log('systemPrompt', systemPrompt);

    const response = await this.bedrockManager.generateResponse(
      modelId,
      messages,
      allServerTools,
      systemPrompt,
    );

    if (response.stopReason === 'tool_use') {
      const toolRequests = response.output?.message?.content?.filter((c) => c.toolUse) ?? [];
      const {
        toolsUsed,
        mcpServersUsed,
        additionalMessages,
      } = await this.processToolResponse(toolRequests, toolDictionary);

      messages = [
        ...messages,
        ...additionalMessages,
      ];

      const finalResponse = await this.bedrockManager.generateResponse(
        modelId,
        messages,
      );

      return {
        response: finalResponse.output?.message?.content?.[0]?.text ?? 'No response',
        toolsUsed,
        mcpServersUsed,
      };
    }

    return {
      response: response.output?.message?.content?.[0]?.text ?? 'No response',
      toolsUsed: [],
      mcpServersUsed: [],
    };
  }

  private async getMCPTools(): Promise<{
    allServerTools: FlattenMCPTools,
    serverToolsMap: Map<MCPServerId, MCPTool[]>,
    toolDictionary: ToolDictionary,
  }> {
    const allServerTools: FlattenMCPTools = [];
    const serverToolsMap = await this.mcpManager.getAvailableTools();
    const toolDictionary: ToolDictionary = new Map<FullMCPToolName, { serverId: MCPServerId }>();

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

  private async processToolResponse(toolRequests: ContentBlock[], toolDictionary: ToolDictionary) {
    const toolsUsed: string[] = [];
    const mcpServersUsed: string[] = [];
    const additionalMessages: Message[] = [];

    for (const toolUse of toolRequests) {
      if (!toolUse.toolUse || !toolUse.toolUse.name) {
        continue;
      }

      const fullToolName = toolUse.toolUse.name;

      const tool = toolDictionary.get(fullToolName);
      if (!tool) {
        continue;
      }

      const { serverId } = tool;
      const actualToolName = fullToolName.replace(`${serverId}__`, '');

      if (serverId) {
        try {
          const toolResult = await this.mcpManager.executeCallTool(
            serverId,
            actualToolName,
            toolUse.toolUse.input,
          );

          console.log('toolResult', toolResult);

          toolsUsed.push(actualToolName);
          if (!mcpServersUsed.includes(serverId)) {
            mcpServersUsed.push(serverId);
          }

          additionalMessages.push({
            role: 'assistant',
            content: [
              {
                text: `Used tool ${actualToolName}`,
              },
            ],
          });
          additionalMessages.push({
            role: 'user',
            content: [
              {
                text: `Tool result: ${JSON.stringify(toolResult.content)}`,
              },
            ],
          });
        } catch (error) {
          console.error(`Tool execution failed:`, error);
        }
      }
    }

    return {
      toolsUsed,
      mcpServersUsed,
      additionalMessages,
    };
  }

  private buildToolSystemPrompt(toolsByServer: Map<string, any[]>): string {
    let prompt = 'You are a helpful AI assistant with access to various tools through MCP servers.\n\n';
    prompt += 'Available MCP servers and their capabilities:\n';

    for (const [serverId, tools] of toolsByServer) {
      const mcpServer = this.mcpManager.getServerConfig(serverId);
      prompt += `\n${serverId} (${mcpServer?.description ?? 'No description'}):\n`;

      for (const tool of tools) {
        prompt += `  - ${tool.name}: ${tool.description}\n`;
      }
    }

    prompt += "\nWhen using tools, consider which MCP server would be most appropriate for the user's request.";
    return prompt;
  }
}

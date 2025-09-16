import { ContentBlock, Message } from '@aws-sdk/client-bedrock-runtime';

import { ToolDictionary } from '../mcp-manager/types.js';
import { MCPManager } from '../mcp-manager/manager.js';
import { BedrockManager } from '../bedrock/manager.js';

export class ChatOrchestrator {
  constructor(
    private mcpManager: MCPManager,
    private bedrockManager: BedrockManager,
  ) {}

  async processUserMessage(
    modelId: string,
    sessionId: string,
    rawMessages: Message[],
  ): Promise<{
    response: ContentBlock[];
    messages: Message[];
    toolsUsed: string[];
    mcpServersUsed: string[];
  }> {
    const messages = structuredClone(rawMessages);
    const {
      allServerTools,
      serverToolsMap,
      toolDictionary,
    } = await this.mcpManager.getAvailableTools();

    const systemPrompt = this.buildToolSystemPrompt(serverToolsMap);

    const toolsUsed: string[] = [];
    const mcpServersUsed: string[] = [];
    let response = await this.bedrockManager.generateResponse(
      modelId,
      messages,
      allServerTools,
      systemPrompt,
    );

    while (response.stopReason === 'tool_use') {
      const toolRequests = response.output?.message?.content?.filter((c) => c.toolUse) ?? [];

      if (toolRequests.length === 0) {
        break;
      }

      const {
        toolsUsed: currentToolsUsed,
        mcpServersUsed: currentMcpServersUsed,
        additionalMessages,
      } = await this.processToolResponse(toolRequests, toolDictionary);

      toolsUsed.push(...currentToolsUsed);
      currentMcpServersUsed.forEach((serverId) => {
        if (!mcpServersUsed.includes(serverId)) {
          mcpServersUsed.push(serverId);
        }
      });

      messages.push({
        role: 'assistant',
        content: response.output?.message?.content ?? [],
      });
      messages.push(...additionalMessages);

      response = await this.bedrockManager.generateResponse(
        modelId,
        messages,
        allServerTools,
        systemPrompt,
      );
    }

    messages.push({
      role: 'assistant',
      content: response.output?.message?.content ?? [],
    });

    return {
      response: response.output?.message?.content ?? [],
      messages,
      toolsUsed,
      mcpServersUsed,
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
        console.warn(`Tool ${fullToolName} not found in dictionary`);
        additionalMessages.push({
          role: 'user',
          content: [{
            text: `Error: Tool ${fullToolName} not found`,
          }],
        });
        continue;
      }

      const { serverId } = tool;
      const actualToolName = fullToolName.replace(`${serverId}__`, '');

      try {
        console.info(`Executing tool: ${actualToolName} on server: ${serverId}`);

        const toolResult = await this.mcpManager.executeCallTool(
          serverId,
          actualToolName,
          toolUse.toolUse.input,
        );

        console.info(`Successfully executed tool: ${actualToolName} on server: ${serverId}`);

        toolsUsed.push(actualToolName);
        if (!mcpServersUsed.includes(serverId)) {
          mcpServersUsed.push(serverId);
        }

        additionalMessages.push({
          role: 'user',
          content: [{
            toolResult: {
              toolUseId: toolUse.toolUse.toolUseId,
              content: [{
                text: this.formatToolResult(toolResult.content),
              }],
            },
          }],
        });
      } catch (error) {
        console.error(`Tool execution failed for ${actualToolName}:`, error);

        additionalMessages.push({
          role: 'user',
          content: [{
            toolResult: {
              toolUseId: toolUse.toolUse.toolUseId,
              content: [{
                text: `Error executing ${actualToolName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
              }],
              status: 'error',
            },
          }],
        });
      }
    }

    return {
      toolsUsed,
      mcpServersUsed,
      additionalMessages,
    };
  }

  private formatToolResult(content: any): string {
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content.map((item) => {
        if (typeof item === 'object' && item.text) {
          return item.text;
        }
        return JSON.stringify(item);
      }).join('\n');
    }

    return JSON.stringify(content, null, 2);
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
    prompt += '\nYou can use multiple tools in sequence to complete complex tasks. Each tool result will be provided to you, and you can then decide if additional tools are needed.';
    prompt += '\nOnly stop using tools when you have all the information needed to provide a complete response to the user.';

    return prompt;
  }
}

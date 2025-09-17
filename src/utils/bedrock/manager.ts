import {
  ConverseCommandOutput,
  ConverseStreamCommand,
  BedrockRuntimeClient,
  ConverseCommandInput,
  ToolUseBlockStart,
  ToolUseBlockDelta,
  ConverseCommand,
  ContentBlock,
  StopReason,
  Message,
  Tool,
} from '@aws-sdk/client-bedrock-runtime';
import {
  ListFoundationModelsCommand,
  FoundationModelSummary,
  BedrockClient,
} from '@aws-sdk/client-bedrock';

import { DEFAULT_TEMPERATURES, DEFAULT_MAX_TOKENS, DEFAULT_TOP_P } from './constant.js';
import { safeJSONStringify } from '../../helpers/json.js';
import { MCPTool } from '../mcp-manager/types.js';

export class BedrockManager {
  constructor(
    private bedrock: BedrockClient,
    private client: BedrockRuntimeClient,
  ) {}

  async isResponseStreamingSupported(modelId: string): Promise<boolean> {
    try {
      const foundationModels = await this.getActiveFoundationModels();

      const modelInfo = foundationModels.find(
        (m) => m.modelId === modelId,
      );

      if (!modelInfo) {
        throw new Error(`Unrecognized model ID: '${modelId}'. Please verify that the model ID is correct and supported.`);
      }

      return modelInfo.responseStreamingSupported ?? false;
    } catch (err) {
      if (err instanceof Error) {
        console.error(`Error while checking supports streaming for model '${modelId}': ${err.message}`);
      }

      throw err;
    }
  };

  async generateResponse(
    modelId: string,
    messages: Message[],
    tools?: MCPTool[],
    systemPrompt?: string,
  ): Promise<ConverseCommandOutput> {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) {
      throw new Error('Expecting messages to be a non-empty array');
    }

    console.info(`Generating non-streaming response for message from '${lastMessage.role}': ${safeJSONStringify(lastMessage.content)}`);

    const input: ConverseCommandInput = this.buildInputCommand(
      modelId,
      messages,
      tools,
      systemPrompt,
    );

    const command = new ConverseCommand(input);
    const response = await this.client.send(command);

    if (response.output?.message) {
      console.info(`Non-streaming response generated: ${safeJSONStringify(response.output.message.content)}`);
    }
    return response;
  }

  async generateStreamResponse(
    modelId: string,
    messages: Message[],
    onChunk: (chunk: string) => void,
    tools?: MCPTool[],
    systemPrompt?: string,
  ): Promise<ConverseCommandOutput> {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) {
      throw new Error('Expecting messages to be a non-empty array');
    }

    console.info(`Streaming response for message from '${lastMessage.role}': ${safeJSONStringify(lastMessage.content)}`);

    const input: ConverseCommandInput = this.buildInputCommand(
      modelId,
      messages,
      tools,
      systemPrompt,
    );

    const command = new ConverseStreamCommand(input);
    const streamableResponse = await this.client.send(command);

    if (!streamableResponse.stream) {
      throw new Error('Response stream is undefined.');
    }

    let accumulatedText = '';
    const toolUses: (ToolUseBlockStart & ToolUseBlockDelta)[] = [];
    let finalStopReason: StopReason = 'end_turn';

    for await (const response of streamableResponse.stream) {
      if (response.contentBlockDelta?.delta?.text) {
        const chunk = response.contentBlockDelta.delta.text;
        accumulatedText += chunk;
        onChunk(chunk);
      }

      if (response.contentBlockStart?.start?.toolUse) {
        const toolStart = response.contentBlockStart.start.toolUse;
        toolUses.push({
          toolUseId: toolStart.toolUseId,
          name: toolStart.name,
          input: '',
        });
      }

      if (response.contentBlockDelta?.delta?.toolUse && toolUses.length > 0) {
        const lastToolUse = toolUses[toolUses.length - 1];
        const toolDelta = response.contentBlockDelta.delta.toolUse;

        if (toolDelta.input) {
          lastToolUse!.input += toolDelta.input;
        }
      }

      if (response.messageStop?.stopReason) {
        finalStopReason = response.messageStop.stopReason;
      }
    }

    const response = this.constructStreamResponse(
      accumulatedText,
      toolUses,
      finalStopReason,
    );

    if (response.output?.message) {
      console.info(`Streaming response completed with stop reason '${finalStopReason}': ${safeJSONStringify(response.output.message.content)}`);
    }
    return response;
  }

  private buildInputCommand(
    modelId: string,
    messages: Message[],
    tools?: MCPTool[],
    systemPrompt?: string,
  ): ConverseCommandInput {
    const input: ConverseCommandInput = {
      modelId,
      messages,
      inferenceConfig: {
        maxTokens: DEFAULT_MAX_TOKENS,
        temperature: DEFAULT_TEMPERATURES,
        topP: DEFAULT_TOP_P,
      },
    };

    if (tools?.length) {
      input.toolConfig = {
        tools: tools.map((tool): Tool => ({
          toolSpec: {
            name: tool.name,
            description: tool.description,
            inputSchema: {
              json: tool.inputSchema as any,
            },
          },
        })),
      };
    }

    if (systemPrompt) {
      input.system = [{ text: systemPrompt }];
    }

    return input;
  }

  private async getActiveFoundationModels(): Promise<FoundationModelSummary[]> {
    const command = new ListFoundationModelsCommand({});

    const response = await this.bedrock.send(command);
    const models = response.modelSummaries;

    if (!models) {
      return [];
    }

    return models.filter(
      (m) => m.modelLifecycle?.status === 'ACTIVE',
    );
  }

  constructStreamResponse(
    accumulatedText: string,
    toolUses: (ToolUseBlockStart & ToolUseBlockDelta)[],
    stopReason: StopReason,
  ): ConverseCommandOutput {
    const content: ContentBlock[] = [];

    if (accumulatedText) {
      content.push({ text: accumulatedText });
    }

    for (const toolUse of toolUses) {
      let input: any;
      try {
        input = toolUse.input ? JSON.parse(toolUse.input) : {};
      } catch  {
        throw new Error(`Failed parsing the input for tool: ${toolUse.name}`);
      }
      content.push({
        toolUse: {
          toolUseId: toolUse.toolUseId,
          name: toolUse.name,
          input,
        },
      });
    }

    return {
      output: {
        message: {
          role: 'assistant',
          content,
        },
      },
      stopReason,
      usage: undefined,
      metrics: undefined,
      $metadata: {},
    };
  }
}

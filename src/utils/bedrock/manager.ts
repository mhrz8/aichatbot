import { ConverseCommandOutput, BedrockRuntimeClient, ConverseCommandInput, ConverseCommand, Message, Tool } from '@aws-sdk/client-bedrock-runtime';
import { ListFoundationModelsCommand, FoundationModelSummary, BedrockClient } from '@aws-sdk/client-bedrock';

import { FlattenMCPTools } from './types.js';
import { AWS_REGION } from '../config.js';

export class BedrockManager {
  private bedrock: BedrockClient;
  private client: BedrockRuntimeClient;

  constructor() {
    this.bedrock = new BedrockClient({ region: AWS_REGION });
    this.client = new BedrockRuntimeClient({ region: AWS_REGION });
  }

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
    tools?: FlattenMCPTools,
    systemPrompt?: string,
  ): Promise<ConverseCommandOutput> {
    const input: ConverseCommandInput = {
      modelId,
      messages,
      inferenceConfig: {
        maxTokens: 1000,
        temperature: 0.0,
        topP: 0.9,
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

    const command = new ConverseCommand(input);
    const response = await this.client.send(command);
    return response;
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
}

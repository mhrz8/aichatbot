import { Message } from '@aws-sdk/client-bedrock-runtime';

export type ChatRequestBody = {
  query: string;
  histories: Message[];
  model?: string;
  streamingFormat?: string;
  promptOverride?: {
    promptHeader?: string;
    noContextFooter?: string;
    contextFooter?: string;
  };
};

import { randomUUID } from 'node:crypto';

import { BedrockRuntimeClient, Message } from '@aws-sdk/client-bedrock-runtime';
import { BedrockClient } from '@aws-sdk/client-bedrock';
import express from 'express';
import cors from 'cors';

import { ChatOrchestrator } from '../utils/chat/orchestrator.js';
import { BedrockManager } from '../utils/bedrock/manager.js';
import { DEFAULT_MODEL } from '../utils/bedrock/constant.js';
import { MCPManager } from '../utils/mcp-manager/manager.js';
import { mcpServers } from '../utils/mcp-manager/servers.js';
import { PlaygroundHTML } from './playground.js';
import { AWS_REGION } from '../utils/config.js';
import { ChatRequestBody } from './types.js';

const bedrock = new BedrockClient({ region: AWS_REGION });
const bedrockClient = new BedrockRuntimeClient({ region: AWS_REGION });

const mcpManager = new MCPManager();

function registerMiddlewares(app: express.Express) {
  app.use(cors({
    origin: '*',
  }));

  app.use(express.json());
}

export function createExpressApp(): express.Express {
  const app = express();

  Promise.all(mcpServers.map((mcpServer) => {
    mcpManager
      .connectServer(mcpServer)
      .then(() => console.info(`Successfully connected to MCP Server: '${mcpServer.name}'`))
      .catch((err) => console.error(`Failed while connecting to MCP Server '${mcpServer.name}': ${err.message}`));
  }));

  registerMiddlewares(app);

  app.get('/playground', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(PlaygroundHTML(
      'AI Flight Booking Assistant - Playground',
      'Testing with EventSource streaming',
    ));
  });

  app.get('/health', async (req, res) => {
    const { allServerTools } = await mcpManager.getAvailableTools();

    res.json({
      status: 'healthy',
      tools: allServerTools,
    });
  });

  app.post('/chat', async function (
    req: express.Request<{}, {}, ChatRequestBody>,
    res: express.Response,
  ) {
    const model = req.body.model ?? DEFAULT_MODEL;
    const message = req.body.query;
    const histories = req.body.histories;

    function stream(type: string, message?: any) {
      res.write(`data: ${JSON.stringify({ type, message })}\n\n`);
    }

    const bedrockManager = new BedrockManager(bedrock, bedrockClient);

    const streaming = await bedrockManager
      .isResponseStreamingSupported(model)
      .catch(() => {
        stream('error', 'An error occurred while checking model details');
        res.end();
        return undefined;
      });

    if (typeof streaming === 'undefined') {
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    const messageHistories: Message[] = [
      ...histories,
      {
        role: 'user',
        content: [{ text: message }],
      },
    ];

    const chatOrchestrator = new ChatOrchestrator(
      mcpManager,
      bedrockManager,
    );

    chatOrchestrator.on('thinking', () => stream('thinking'));
    chatOrchestrator.on('stream', ({ text }) => stream('text', text));
    chatOrchestrator.on('done', () => stream('stop'));

    req.on('close', () => {
      chatOrchestrator.removeAllListeners();
    });

    try {
      await chatOrchestrator.processUserMessage(
        model,
        randomUUID(),
        messageHistories,
        streaming,
      );
    } catch (error) {
      console.error('Chat orchestrator error:', error);
      stream('error', 'Currently we experiencing turbulence in our system, kindly try again later');
    } finally {
      res.end();
    }
  });

  return app;
}

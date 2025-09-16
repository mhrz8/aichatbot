import { randomUUID } from 'node:crypto';

import { Message } from '@aws-sdk/client-bedrock-runtime';
import express from 'express';
import cors from 'cors';

import { ChatOrchestrator } from '../utils/chat/orchestrator.js';
import { BedrockManager } from '../utils/bedrock/manager.js';
import { DEFAULT_MODEL } from '../utils/bedrock/constant.js';
import { MCPManager } from '../utils/mcp-manager/manager.js';
import { mcpServers } from '../utils/mcp-manager/servers.js';
import { ChatRequestBody } from './types.js';

const bedrockManager = new BedrockManager();
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
      .catch((err) => console.error('Failed while connecting to MCP Server', err.message));
  }));

  registerMiddlewares(app);

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
    const model = req.body.model ??  DEFAULT_MODEL;
    const message = req.body.query;
    const histories = req.body.histories;

    const streaming = await bedrockManager.isResponseStreamingSupported(model).catch(() => {
      res.write(`An error occurred while checking model details`);
      res.end();
      return undefined;
    });

    if (typeof streaming === 'undefined') {
      return;
    }

    const messageHistories: Message[] = [
      ...histories,
      {
        role: 'user',
        content: [{ text: message }],
      },
    ];

    if (streaming) {
      console.warn('There is no different between streaming and non-streaming mode at this moment');
    }

    const chatOrchestrator = new ChatOrchestrator(
      mcpManager,
      bedrockManager,
    );

    const response = await chatOrchestrator.processUserMessage(
      model,
      randomUUID(),
      messageHistories,
    );

    res.json({
      response,
    });
  });

  app.get('/stream', async (req, res) => {
    // Set appropriate headers
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    });

    // Stream data - this will work like streamifyResponse when invoke mode is response_stream
    res.write('Starting process...\n');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    res.write('Processing...\n');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    res.write('Almost done...\n');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    res.write('Complete!\n');
    res.end();
  });

  app.get('/binary-stream', async (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Transfer-Encoding': 'chunked',
    });

    // Stream actual binary data
    const buffer1 = Buffer.from([0x48, 0x65, 0x6C, 0x6C, 0x6F]); // "Hello"
    const buffer2 = Buffer.from([0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64]); // " World"

    res.write(buffer1);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    res.write(buffer2);
    res.end();
  });

  return app;
}

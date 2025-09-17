import { MCPServer } from './types.js';

export const mcpServers: MCPServer[] = [
  {
    id: 'dsp-mcpserver',
    name: 'DSP Server',
    description: 'Malaysia Airline IBE',
    remoteUrl: 'https://gx37w3wxpxbaji2onfbygf6alm0idiqz.lambda-url.us-east-1.on.aws/mcp',
    // remoteUrl: 'http://localhost:3067/mcp', // for local development to deccrease latency
  },
];

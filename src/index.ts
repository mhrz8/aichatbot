import http from 'node:http';

import { createExpressApp } from './app/app.js';

const PORT = 3077;

async function main() {
  const app = createExpressApp();

  http.createServer(app).listen(PORT, () => {
    console.info(`listening on http://localhost:${PORT}`);
  });
}

main();

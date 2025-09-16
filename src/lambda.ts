import { RUN_IN_LAMBDA, AWS_LWA_PORT } from './utils/config.js';
import { createExpressApp } from './app/app.js';

const app = createExpressApp();

if (RUN_IN_LAMBDA) {
  app.listen(AWS_LWA_PORT, () => {
    console.info(`listening on http://localhost:${AWS_LWA_PORT}`);
  });
} else {
  console.error('Cannot proceed inside non-lambda environment');
  process.exit(1);
}

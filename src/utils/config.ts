import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

const envSchema = z.object({
  RUN_IN_LAMBDA: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  AWS_LWA_PORT: z
    .string()
    .transform((val) => parseInt(val))
    .default('3000'),
  AWS_REGION: z
    .string()
    .default('us-east-1'),
});

export const {
  RUN_IN_LAMBDA,
  AWS_LWA_PORT,
  AWS_REGION,
} = Object.freeze(envSchema.parse(process.env));

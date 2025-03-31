import { z } from 'zod';

const configSchema = z.object({
  server: z.object({
    port: z.number().default(3000),
    host: z.string().default('0.0.0.0'),
  }),
  cors: z.object({
    origin: z.string().default('*'),
  }),
  jwt: z.object({
    secret: z.string().default('your-secret-key'),
  }),
  ethereum: z.object({
    rpcUrl: z.string().default('http://localhost:8545'),
    chainId: z.number().default(1),
    explorerApiKey: z.string().optional(),
  }),
});

export const config = configSchema.parse({
  server: {
    port: Number(process.env.PORT) || 3000,
    host: process.env.HOST || '0.0.0.0',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
  },
  ethereum: {
    rpcUrl: process.env.ETH_RPC_URL || 'http://localhost:8545',
    chainId: Number(process.env.ETH_CHAIN_ID) || 1,
    explorerApiKey: process.env.ETHERSCAN_API_KEY,
  },
}); 
import { FastifyInstance } from 'fastify';
import { compileHandler as compileContract } from './handlers/compile';
import { deployContract } from './handlers/deploy';
import { verifyContract } from './handlers/verify';
import { getContractInfo } from './handlers/info';

export async function ethereumRoutes(fastify: FastifyInstance) {
  // Compile a Solidity contract
  fastify.post('/compile', {
    schema: {
      body: {
        type: 'object',
        required: ['source'],
        properties: {
          source: { type: 'string' },
          version: { type: 'string', default: '0.8.0' },
          optimization: { type: 'boolean', default: true },
        },
      },
    },
    handler: compileContract,
  });

  // Deploy a compiled contract
  fastify.post('/deploy', {
    schema: {
      body: {
        type: 'object',
        required: ['bytecode', 'abi'],
        properties: {
          bytecode: { type: 'string' },
          abi: { type: 'array' },
          constructorArgs: { type: 'array', default: [] },
          network: { type: 'string', default: 'mainnet' },
        },
      },
    },
    handler: deployContract,
  });

  // Verify a contract on Etherscan
  fastify.post('/verify', {
    schema: {
      body: {
        type: 'object',
        required: ['address', 'source'],
        properties: {
          address: { type: 'string' },
          source: { type: 'string' },
          network: { type: 'string', default: 'mainnet' },
        },
      },
    },
    handler: verifyContract,
  });

  // Get contract information
  fastify.get('/contract/:address', {
    schema: {
      params: {
        type: 'object',
        required: ['address'],
        properties: {
          address: { type: 'string' },
        },
      },
    },
    handler: getContractInfo,
  });
} 
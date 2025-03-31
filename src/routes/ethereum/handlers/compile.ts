import { FastifyRequest, FastifyReply } from 'fastify';
import solc from 'solc';
import { logger } from '../../../utils/logger';

interface SolcInstance {
  compile: (input: string) => string;
}

export async function compileHandler(
  request: FastifyRequest<{
    Body: {
      source: string;
      version: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const { source, version } = request.body;

    // Load the appropriate solc version
    const solcInstance = (await solc(version) as unknown) as SolcInstance;

    // Compile the contract
    const input = {
      language: 'Solidity',
      sources: {
        'contract.sol': {
          content: source,
        },
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['*'],
          },
        },
      },
    };

    const output = JSON.parse(solcInstance.compile(JSON.stringify(input)));

    return reply.send(output);
  } catch (error) {
    logger.error('Compilation error:', error);
    return reply.status(500).send({ error: 'Compilation failed' });
  }
} 
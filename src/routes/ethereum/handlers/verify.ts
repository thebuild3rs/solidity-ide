import { FastifyRequest, FastifyReply } from 'fastify';
import { ethers } from 'ethers';
import { config } from '../../../config';
import { logger } from '../../../utils/logger';

interface VerifyRequest {
  address: string;
  source: string;
  network?: string;
}

export async function verifyContract(
  request: FastifyRequest<{ Body: VerifyRequest }>,
  reply: FastifyReply
) {
  try {
    const { address, source, network = 'mainnet' } = request.body;

    if (!config.ethereum.explorerApiKey) {
      return reply.status(400).send({
        error: {
          message: 'Etherscan API key not configured',
        },
      });
    }

    // Create provider
    const provider = new ethers.JsonRpcProvider(config.ethereum.rpcUrl);

    // Verify contract on Etherscan
    const verificationResult = await provider.send('eth_verifyContract', [
      address,
      source,
      config.ethereum.explorerApiKey,
    ]);

    return reply.send({
      success: true,
      message: 'Contract verified successfully',
      verificationResult,
    });
  } catch (error) {
    logger.error(error);
    return reply.status(500).send({
      error: {
        message: 'Failed to verify contract',
      },
    });
  }
} 
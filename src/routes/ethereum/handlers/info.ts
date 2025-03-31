import { FastifyRequest, FastifyReply } from 'fastify';
import { ethers } from 'ethers';
import { config } from '../../../config';
import { logger } from '../../../utils/logger';

interface InfoRequest {
  address: string;
}

export async function getContractInfo(
  request: FastifyRequest<{ Params: InfoRequest }>,
  reply: FastifyReply
) {
  try {
    const { address } = request.params;

    // Create provider
    const provider = new ethers.JsonRpcProvider(config.ethereum.rpcUrl);

    // Get contract code
    const code = await provider.getCode(address);

    // Get contract balance
    const balance = await provider.getBalance(address);

    // Get transaction count (nonce)
    const nonce = await provider.getTransactionCount(address);

    // Get block number
    const blockNumber = await provider.getBlockNumber();

    return reply.send({
      address,
      code: code === '0x' ? null : code,
      balance: ethers.formatEther(balance),
      nonce,
      blockNumber,
    });
  } catch (error) {
    logger.error(error);
    return reply.status(500).send({
      error: {
        message: 'Failed to get contract information',
      },
    });
  }
} 
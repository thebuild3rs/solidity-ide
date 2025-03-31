import { FastifyRequest, FastifyReply } from 'fastify';
import { ethers } from 'ethers';
import { config } from '../../../config';
import { logger } from '../../../utils/logger';

interface DeployRequest {
  bytecode: string;
  abi: any[];
  constructorArgs?: any[];
  network?: string;
}

export async function deployContract(
  request: FastifyRequest<{ Body: DeployRequest }>,
  reply: FastifyReply
) {
  try {
    const { bytecode, abi, constructorArgs = [], network = 'mainnet' } = request.body;

    // Get the appropriate provider based on network
    const provider = new ethers.JsonRpcProvider(config.ethereum.rpcUrl);

    // Create a wallet instance (you'll need to implement proper key management)
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '', provider);

    // Create contract factory
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);

    // Deploy the contract
    const contract = await factory.deploy(...constructorArgs);

    // Wait for deployment transaction
    await contract.waitForDeployment();

    return reply.send({
      address: await contract.getAddress(),
      transactionHash: contract.deploymentTransaction()?.hash,
    });
  } catch (error) {
    logger.error(error);
    return reply.status(500).send({
      error: {
        message: 'Failed to deploy contract',
      },
    });
  }
} 
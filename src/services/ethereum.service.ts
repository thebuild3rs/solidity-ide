import { ethers } from 'ethers';
import { logger } from '../utils/logger';
import solc from 'solc';

interface CompileResult {
  abi: any[];
  bytecode: string;
}

interface SolcInstance {
  compile: (input: string) => string;
}

export class EthereumService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet | null = null;
  private network: string;

  constructor(rpcUrl: string, network: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.network = network;
  }

  async connectWallet(privateKey: string): Promise<void> {
    try {
      this.signer = new ethers.Wallet(privateKey, this.provider);
      const address = await this.signer.getAddress();
      logger.info(`Connected wallet: ${address}`);
    } catch (error) {
      logger.error('Failed to connect wallet', error);
      throw new Error('Failed to connect wallet');
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      logger.error('Failed to get balance', error);
      throw new Error('Failed to get balance');
    }
  }

  async compileContract(source: string, version: string = '0.8.0'): Promise<CompileResult> {
    try {
      const solcInstance = (await solc(version) as unknown) as SolcInstance;
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
      const contract = output.contracts['contract.sol']['Contract'];
      
      return {
        abi: contract.abi,
        bytecode: contract.evm.bytecode.object
      };
    } catch (error) {
      logger.error('Failed to compile contract', error);
      throw new Error(`Failed to compile contract: ${error}`);
    }
  }

  async deployContract(bytecode: string, abi: any[], args: any[] = []): Promise<string> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      const factory = new ethers.ContractFactory(abi, bytecode, this.signer);
      const contract = await factory.deploy(...args);
      await contract.waitForDeployment();

      const address = await contract.getAddress();
      logger.info(`Contract deployed at: ${address}`);
      return address;
    } catch (error) {
      logger.error('Failed to deploy contract', error);
      throw new Error('Failed to deploy contract');
    }
  }

  async interactWithContract(
    address: string,
    abi: any[],
    method: string,
    args: any[] = []
  ): Promise<any> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      const contract = new ethers.Contract(address, abi, this.signer);
      const result = await contract[method](...args);
      return result;
    } catch (error) {
      logger.error('Failed to interact with contract', error);
      throw new Error('Failed to interact with contract');
    }
  }

  async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return receipt;
    } catch (error) {
      logger.error('Failed to get transaction receipt', error);
      throw new Error('Failed to get transaction receipt');
    }
  }

  async estimateGas(
    to: string,
    value: bigint,
    data: string
  ): Promise<bigint> {
    try {
      const gasEstimate = await this.provider.estimateGas({
        to,
        value,
        data
      });
      return gasEstimate;
    } catch (error) {
      logger.error('Failed to estimate gas', error);
      throw new Error('Failed to estimate gas');
    }
  }

  async getNetwork(): Promise<ethers.Network> {
    try {
      const network = await this.provider.getNetwork();
      return network;
    } catch (error) {
      logger.error('Failed to get network', error);
      throw new Error('Failed to get network');
    }
  }
} 
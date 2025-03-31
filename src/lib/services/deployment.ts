import { ethers } from 'ethers';
import type { NetworkInfo, ContractInfo } from '@/lib/types';

export class DeploymentService {
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  private networkInfo: NetworkInfo | null = null;

  async initialize(networkInfo: NetworkInfo) {
    try {
      this.networkInfo = networkInfo;
      
      // Initialize provider with Infura RPC URL
      const infuraUrl = `https://mainnet.infura.io/v3/776ec662181b40f18a91f45a4338f95c`;
      this.provider = new ethers.JsonRpcProvider(infuraUrl);
      
      // Get signer from connected wallet
      if (!window.ethereum) {
        throw new Error('No Web3 wallet found. Please install MetaMask or another Web3 wallet.');
      }

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await browserProvider.getSigner();
      
      // Verify network connection
      const network = await this.provider.getNetwork();
      if (network.chainId !== BigInt(networkInfo.chainId)) {
        throw new Error(`Please switch to ${networkInfo.name} network in your wallet.`);
      }
    } catch (error) {
      console.error('Failed to initialize deployment service:', error);
      throw error;
    }
  }

  async deployContract(
    bytecode: string,
    abi: any[],
    constructorArgs: any[] = []
  ): Promise<ContractInfo> {
    if (!this.provider || !this.signer || !this.networkInfo) {
      throw new Error('Deployment service not initialized');
    }

    try {
      // Create contract factory
      const factory = new ethers.ContractFactory(abi, bytecode, this.signer);
      
      // Deploy contract
      const contract = await factory.deploy(...constructorArgs);
      
      // Wait for deployment transaction
      const deploymentTx = contract.deploymentTransaction();
      const receipt = await deploymentTx?.wait();
      
      // Get contract address
      const address = await contract.getAddress();

      return {
        address,
        name: abi.find(item => item.type === 'contract')?.name || 'Unknown Contract',
        network: this.networkInfo.id,
        abi,
        bytecode,
        deployedAt: Date.now(),
        verified: false,
        deploymentTx: {
          hash: deploymentTx?.hash || '',
          gasUsed: receipt?.gasUsed.toString() || '0',
          gasPrice: deploymentTx?.gasPrice?.toString() || '0',
          blockNumber: receipt?.blockNumber || 0
        }
      };
    } catch (error) {
      console.error('Contract deployment failed:', error);
      throw error;
    }
  }

  async verifyContract(address: string, sourceCode: string): Promise<boolean> {
    if (!this.networkInfo) {
      throw new Error('Network not selected');
    }

    try {
      const apiKey = process.env.VITE_ETHERSCAN_API_KEY;
      if (!apiKey) {
        throw new Error('Etherscan API key not configured');
      }

      // Get the appropriate Etherscan API URL based on the network
      const apiUrl = this.networkInfo.id === 'mainnet' 
        ? 'https://api.etherscan.io/api'
        : `https://api-${this.networkInfo.id}.etherscan.io/api`;

      // Prepare the verification request
      const params = new URLSearchParams({
        apikey: apiKey,
        module: 'contract',
        action: 'verifysourcecode',
        contractaddress: address,
        sourceCode,
        codeformat: 'solidity-single-file',
        contractname: sourceCode.match(/contract\s+(\w+)/)?.[1] || 'Contract',
        compilerversion: 'v0.8.24+commit.e11b9ed9', // Use the latest stable version
        optimizationUsed: '1',
        runs: '200',
        licenseType: '3', // MIT License
        evmversion: 'paris'
      });

      // Send verification request
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const result = await response.json();

      if (result.status === '1') {
        // Check verification status
        const guid = result.result;
        let verificationStatus = 'pending';
        let attempts = 0;
        const maxAttempts = 30; // 5 minutes with 10-second intervals

        while (verificationStatus === 'pending' && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
          
          const statusResponse = await fetch(`${apiUrl}?apikey=${apiKey}&module=contract&action=checkverifystatus&guid=${guid}`);
          const statusResult = await statusResponse.json();
          
          verificationStatus = statusResult.result;
          attempts++;
        }

        return verificationStatus === 'Pass - Verified';
      }

      throw new Error(result.message || 'Contract verification failed');
    } catch (error) {
      console.error('Contract verification failed:', error);
      throw error;
    }
  }

  async getContract(address: string, abi: any[]): Promise<ethers.Contract> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    return new ethers.Contract(address, abi, this.provider);
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async sendTransaction(to: string, value: string): Promise<string> {
    if (!this.signer || !this.provider) {
      throw new Error('Signer or provider not initialized');
    }

    try {
      // Estimate gas before sending
      const gasEstimate = await this.provider.estimateGas({
        from: await this.signer.getAddress(),
        to,
        value: ethers.parseEther(value)
      });

      // Send transaction with gas limit
      const tx = await this.signer.sendTransaction({
        to,
        value: ethers.parseEther(value),
        gasLimit: gasEstimate * BigInt(120) / BigInt(100) // Add 20% buffer
      });

      // Wait for transaction confirmation
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }
} 
import { ethers } from 'ethers';
import type { FileSystemNode } from '@/lib/types';
import solc from 'solc';

interface CompilationResult {
  bytecode: string;
  abi: any[];
  errors: string[];
  warnings: string[];
}

export class CompilerService {
  private compiler: any;

  constructor() {
    // Initialize solc compiler
    this.compiler = solc;
  }

  async compileContract(file: FileSystemNode): Promise<CompilationResult> {
    if (!file.content) {
      throw new Error('File content is empty');
    }

    try {
      // Prepare input for solc
      const input = {
        language: 'Solidity',
        sources: {
          [file.path]: {
            content: file.content
          }
        },
        settings: {
          outputSelection: {
            '*': {
              '*': ['abi', 'evm.bytecode']
            }
          },
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      };

      // Compile the contract
      const output = JSON.parse(this.compiler.compile(JSON.stringify(input)));

      // Check for errors
      const errors = output.errors?.filter((error: any) => error.severity === 'error') || [];
      const warnings = output.errors?.filter((error: any) => error.severity === 'warning') || [];

      if (errors.length > 0) {
        throw new Error(errors.map((e: any) => e.message).join('\n'));
      }

      // Get the contract name from the file path
      const contractName = file.path.split('/').pop()?.replace('.sol', '') || 'Contract';

      // Get the contract output
      const contractOutput = output.contracts[file.path][contractName];

      return {
        bytecode: contractOutput.evm.bytecode.object,
        abi: contractOutput.abi,
        errors: [],
        warnings: warnings.map((w: any) => w.message)
      };
    } catch (error) {
      console.error('Compilation failed:', error);
      throw error;
    }
  }

  async compileProject(files: FileSystemNode[]): Promise<Map<string, CompilationResult>> {
    const results = new Map<string, CompilationResult>();

    for (const file of files) {
      if (file.type === 'file' && file.extension === '.sol') {
        try {
          const result = await this.compileContract(file);
          results.set(file.path, result);
        } catch (error) {
          console.error(`Failed to compile ${file.path}:`, error);
          results.set(file.path, {
            bytecode: '',
            abi: [],
            errors: [error instanceof Error ? error.message : 'Unknown error'],
            warnings: []
          });
        }
      }
    }

    return results;
  }

  async validateContract(file: FileSystemNode): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    if (!file.content) {
      return {
        isValid: false,
        errors: ['File content is empty'],
        warnings: []
      };
    }

    try {
      // Prepare input for solc
      const input = {
        language: 'Solidity',
        sources: {
          [file.path]: {
            content: file.content
          }
        },
        settings: {
          outputSelection: {
            '*': {
              '*': ['abi', 'evm.bytecode']
            }
          }
        }
      };

      // Compile the contract
      const output = JSON.parse(this.compiler.compile(JSON.stringify(input)));

      // Check for errors and warnings
      const errors = output.errors?.filter((error: any) => error.severity === 'error') || [];
      const warnings = output.errors?.filter((error: any) => error.severity === 'warning') || [];

      return {
        isValid: errors.length === 0,
        errors: errors.map((e: any) => e.message),
        warnings: warnings.map((w: any) => w.message)
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      };
    }
  }

  async getContractSize(bytecode: string): Promise<number> {
    // Remove '0x' prefix and calculate size in bytes
    return (bytecode.length - 2) / 2;
  }

  async estimateGas(bytecode: string): Promise<bigint> {
    try {
      // Calculate gas based on bytecode size
      // Each byte of bytecode costs 16 gas
      const bytecodeSize = (bytecode.length - 2) / 2; // Remove '0x' prefix
      const baseGas = BigInt(bytecodeSize) * BigInt(16);

      // Add gas for contract creation (32000 gas)
      const creationGas = BigInt(32000);

      // Add gas for each non-zero byte in the bytecode
      const nonZeroBytes = bytecode.slice(2).match(/.{1,2}/g)?.filter(byte => byte !== '00').length || 0;
      const nonZeroGas = BigInt(nonZeroBytes) * BigInt(16);

      // Add gas for each zero byte in the bytecode
      const zeroBytes = bytecode.slice(2).match(/.{1,2}/g)?.filter(byte => byte === '00').length || 0;
      const zeroGas = BigInt(zeroBytes) * BigInt(4);

      // Total gas estimation
      const totalGas = baseGas + creationGas + nonZeroGas + zeroGas;

      // Add 20% buffer for safety
      return (totalGas * BigInt(120)) / BigInt(100);
    } catch (error) {
      console.error('Gas estimation failed:', error);
      throw error;
    }
  }
} 
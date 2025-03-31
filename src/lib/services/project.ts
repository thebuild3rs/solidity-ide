import type { Project, FileSystemNode, ContractInfo } from '@/lib/types';
import { FileSystemService } from './fileSystem';
import { CompilerService } from './compiler';
import { DeploymentService } from './deployment';

export class ProjectService {
  private fileSystem: FileSystemService;
  private compiler: CompilerService;
  private deployment: DeploymentService;
  private currentProject: Project | null = null;

  constructor() {
    this.fileSystem = new FileSystemService();
    this.compiler = new CompilerService();
    this.deployment = new DeploymentService();
  }

  async createProject(name: string, network: string): Promise<Project> {
    try {
      // Create project directory
      const projectDir = await this.fileSystem.createDirectory(`/projects/${name}`);
      
      // Create contracts directory
      const contractsDir = await this.fileSystem.createDirectory(`/projects/${name}/contracts`);
      
      // Create test directory
      const testDir = await this.fileSystem.createDirectory(`/projects/${name}/test`);
      
      // Create scripts directory
      const scriptsDir = await this.fileSystem.createDirectory(`/projects/${name}/scripts`);

      // Create hardhat config
      const hardhatConfig = await this.fileSystem.createFile(
        `/projects/${name}/hardhat.config.ts`,
        this.generateHardhatConfig(network),
        'ts'
      );

      // Create package.json
      const packageJson = await this.fileSystem.createFile(
        `/projects/${name}/package.json`,
        this.generatePackageJson(name),
        'json'
      );

      // Create .gitignore
      const gitignore = await this.fileSystem.createFile(
        `/projects/${name}/.gitignore`,
        this.generateGitignore(),
        ''
      );

      // Create README.md
      const readme = await this.fileSystem.createFile(
        `/projects/${name}/README.md`,
        this.generateReadme(name),
        'md'
      );

      // Add all files to project directory
      await this.fileSystem.addChildToDirectory(projectDir.path, contractsDir.path);
      await this.fileSystem.addChildToDirectory(projectDir.path, testDir.path);
      await this.fileSystem.addChildToDirectory(projectDir.path, scriptsDir.path);
      await this.fileSystem.addChildToDirectory(projectDir.path, hardhatConfig.path);
      await this.fileSystem.addChildToDirectory(projectDir.path, packageJson.path);
      await this.fileSystem.addChildToDirectory(projectDir.path, gitignore.path);
      await this.fileSystem.addChildToDirectory(projectDir.path, readme.path);

      const project: Project = {
        id: name,
        name,
        network,
        root: projectDir.path,
        contracts: [],
        wallets: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      this.currentProject = project;
      return project;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }

  async openProject(projectId: string): Promise<Project> {
    try {
      const projectDir = await this.fileSystem.getNode(`/projects/${projectId}`);
      if (!projectDir || projectDir.type !== 'directory') {
        throw new Error('Project not found');
      }

      const project: Project = {
        id: projectId,
        name: projectId,
        network: 'mainnet', // This should be read from project config
        root: projectDir.path,
        contracts: [],
        wallets: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      this.currentProject = project;
      return project;
    } catch (error) {
      console.error('Failed to open project:', error);
      throw error;
    }
  }

  async saveProject(): Promise<void> {
    if (!this.currentProject) {
      throw new Error('No project open');
    }

    try {
      // Update project metadata
      this.currentProject.updatedAt = Date.now();
      
      // Save project config
      const configPath = `${this.currentProject.root}/project.config.json`;
      await this.fileSystem.createFile(
        configPath,
        JSON.stringify(this.currentProject, null, 2),
        'json'
      );
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
    }
  }

  async createContract(name: string, content: string): Promise<ContractInfo> {
    if (!this.currentProject) {
      throw new Error('No project open');
    }

    try {
      // Create contract file
      const contractFile = await this.fileSystem.createFile(
        `${this.currentProject.root}/contracts/${name}.sol`,
        content,
        'sol'
      );

      // Compile contract
      const compilationResult = await this.compiler.compileContract(contractFile);

      // Deploy contract
      const contractInfo = await this.deployment.deployContract(
        compilationResult.bytecode,
        compilationResult.abi
      );

      // Add contract to project
      this.currentProject.contracts.push(contractInfo);
      await this.saveProject();

      return contractInfo;
    } catch (error) {
      console.error('Failed to create contract:', error);
      throw error;
    }
  }

  async compileProject(): Promise<Map<string, any>> {
    if (!this.currentProject) {
      throw new Error('No project open');
    }

    try {
      // Get all Solidity files in the project
      const files = await this.fileSystem.getDirectoryContents(this.currentProject.root);
      const solFiles = files.filter(file => file.type === 'file' && file.extension === '.sol');

      // Compile all contracts
      return await this.compiler.compileProject(solFiles);
    } catch (error) {
      console.error('Failed to compile project:', error);
      throw error;
    }
  }

  async deployContract(contractPath: string): Promise<ContractInfo> {
    if (!this.currentProject) {
      throw new Error('No project open');
    }

    try {
      // Get contract file
      const contractFile = await this.fileSystem.getNode(contractPath);
      if (!contractFile || contractFile.type !== 'file' || contractFile.extension !== '.sol') {
        throw new Error('Invalid contract file');
      }

      // Compile contract
      const compilationResult = await this.compiler.compileContract(contractFile);

      // Deploy contract
      const contractInfo = await this.deployment.deployContract(
        compilationResult.bytecode,
        compilationResult.abi
      );

      // Add contract to project
      this.currentProject.contracts.push(contractInfo);
      await this.saveProject();

      return contractInfo;
    } catch (error) {
      console.error('Failed to deploy contract:', error);
      throw error;
    }
  }

  async verifyContract(contractPath: string): Promise<boolean> {
    if (!this.currentProject) {
      throw new Error('No project open');
    }

    try {
      // Get contract file
      const contractFile = await this.fileSystem.getNode(contractPath);
      if (!contractFile || contractFile.type !== 'file' || contractFile.extension !== '.sol') {
        throw new Error('Invalid contract file');
      }

      // Get contract content
      const content = await this.fileSystem.getFileContent(contractPath);

      // Find contract info
      const contractInfo = this.currentProject.contracts.find(
        c => c.name === contractFile.path.split('/').pop()?.replace('.sol', '')
      );

      if (!contractInfo) {
        throw new Error('Contract not found in project');
      }

      // Verify contract
      return await this.deployment.verifyContract(contractInfo.address, content);
    } catch (error) {
      console.error('Failed to verify contract:', error);
      throw error;
    }
  }

  private generateHardhatConfig(network: string): string {
    return `import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    ${network}: {
      url: process.env.${network.toUpperCase()}_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};

export default config;`;
  }

  private generatePackageJson(name: string): string {
    return `{
  "name": "${name}",
  "version": "1.0.0",
  "description": "Smart contract project created with DeFi IDE",
  "scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "deploy": "hardhat run scripts/deploy.ts --network mainnet",
    "verify": "hardhat verify"
  },
  "dependencies": {
    "@openzeppelin/contracts": "^5.0.1",
    "hardhat": "^2.19.5"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "@nomicfoundation/hardhat-verify": "^2.0.0",
    "@types/chai": "^4.3.11",
    "@types/mocha": "^10.0.6",
    "@types/node": "^20.11.19",
    "chai": "^4.3.10",
    "dotenv": "^16.4.4",
    "ethers": "^6.11.0",
    "hardhat-gas-reporter": "^1.0.10",
    "mocha": "^10.3.0",
    "solidity-coverage": "^0.8.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}`;
  }

  private generateGitignore(): string {
    return `# Hardhat files
cache
artifacts
typechain
typechain-types

# IDE
.idea
.vscode

# Environment
.env
.env.local

# Node
node_modules
coverage
coverage.json

# Gas reporter
gas-report.txt`;
  }

  private generateReadme(name: string): string {
    return `# ${name}

This project was created using DeFi IDE.

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Create a \`.env\` file with the following variables:
\`\`\`
PRIVATE_KEY=your_private_key
MAINNET_RPC_URL=your_rpc_url
ETHERSCAN_API_KEY=your_etherscan_api_key
\`\`\`

3. Compile contracts:
\`\`\`bash
npm run compile
\`\`\`

4. Run tests:
\`\`\`bash
npm run test
\`\`\`

5. Deploy contracts:
\`\`\`bash
npm run deploy
\`\`\`

6. Verify contracts:
\`\`\`bash
npm run verify
\`\`\`

## Project Structure

- \`contracts/\`: Smart contract source files
- \`test/\`: Test files
- \`scripts/\`: Deployment and other scripts
- \`hardhat.config.ts\`: Hardhat configuration
- \`package.json\`: Project dependencies and scripts`;
  }
} 
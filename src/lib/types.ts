export interface FileSystemNode {
  type: 'file' | 'directory';
  path: string;
  content?: string;
  extension?: string;
  isOpen?: boolean;
  isModified?: boolean;
  children?: FileSystemNode[];
  id: string;
  name: string;
}

export interface EditorTab {
  id: string;
  path: string;
  name: string;
  content: string;
  language: string;
}

export interface TerminalCommand {
  id: string;
  command: string;
  timestamp: number;
  output?: string;
}

export interface ProtocolTemplate {
  id: string;
  name: string;
  description: string;
  category: 'DEX' | 'Lending' | 'Yield' | 'Other';
  files: FileSystemNode[];
  preview: {
    url: string;
  };
}

export interface AnalyticsData {
  tvl: number;
  volume24h: number;
  transactions24h: number;
  activeUsers24h: number;
  gasUsed24h: number;
}

export interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
}

export interface User {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  cursor?: {
    line: number;
    column: number;
  };
}

export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  timestamp: number;
  type: 'chat' | 'system';
}

export interface CodeComment {
  id: string;
  userId: string;
  filePath: string;
  lineNumber: number;
  content: string;
  timestamp: number;
  resolved?: boolean;
}

export interface CommitInfo {
  id: string;
  message: string;
  author: string;
  timestamp: number;
  changes: {
    added: number;
    removed: number;
    modified: number;
  };
}

export interface BranchInfo {
  name: string;
  current: boolean;
  lastCommit: string;
  author: string;
  timestamp: number;
}

export interface NetworkInfo {
  id: string;
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface ContractInfo {
  address: string;
  name: string;
  network: string;
  abi: any[];
  bytecode: string;
  deployedAt: number;
  verified: boolean;
  deploymentTx?: {
    hash: string;
    gasUsed: string;
    gasPrice: string;
    blockNumber: number;
  };
}

export interface TransactionInfo {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  timestamp: number;
  status: 'success' | 'failed' | 'pending';
  method?: string;
}

export interface BlockInfo {
  number: number;
  hash: string;
  timestamp: number;
  transactions: number;
  gasUsed: string;
  miner: string;
}

export interface ABIFunction {
  name: string;
  type: 'function' | 'constructor' | 'event';
  stateMutability?: 'pure' | 'view' | 'nonpayable' | 'payable';
  inputs: {
    name: string;
    type: string;
    components?: any[];
  }[];
  outputs?: {
    name: string;
    type: string;
    components?: any[];
  }[];
}

export interface EventLog {
  id: string;
  name: string;
  address: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
  args: Record<string, any>;
}

export interface WalletConfig {
  address: string;
  network: string;
  isDefault: boolean;
}

export interface Project {
  id: string;
  name: string;
  network: string;
  root: string;
  contracts: ContractInfo[];
  wallets: WalletConfig[];
  createdAt: number;
  updatedAt: number;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (eventName: string, handler: (args: any) => void) => void;
      removeListener: (eventName: string, handler: (args: any) => void) => void;
    };
  }
}
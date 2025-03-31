import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (params: any) => void) => void;
      removeListener: (event: string, callback: (params: any) => void) => void;
    };
  }
}

export interface Project {
  id: string;
  name: string;
  description: string;
  template: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileSystemNode {
  path: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileSystemNode[];
  name: string;
}

export interface EthereumState {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  address: string | null;
  chainId: number | null;
  balance: string | null;
  connected: boolean;
  loading: boolean;
  error: string | null;
}

export interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
}

export interface FileSystemState {
  currentPath: string;
  structure: FileSystemNode | null;
  selectedFile: string | null;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  project: ProjectState;
  fileSystem: FileSystemState;
  ethereum: EthereumState;
} 
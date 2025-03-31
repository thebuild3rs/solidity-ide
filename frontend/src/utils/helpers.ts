import { ethers } from 'ethers';
import { FileSystemNode } from '../types';

export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalance = (balance: string): string => {
  if (!balance) return '0';
  return ethers.formatEther(balance);
};

export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 1).toLowerCase();
};

export const getLanguageFromExtension = (extension: string): string => {
  const languageMap: { [key: string]: string } = {
    sol: 'solidity',
    js: 'javascript',
    ts: 'typescript',
    json: 'json',
    md: 'markdown',
    txt: 'plaintext',
  };
  return languageMap[extension] || 'plaintext';
};

export const findFileInTree = (
  tree: FileSystemNode | null,
  path: string
): FileSystemNode | null => {
  if (!tree) return null;

  if (tree.path === path) {
    return tree;
  }

  if (tree.children) {
    for (const child of tree.children) {
      const found = findFileInTree(child, path);
      if (found) return found;
    }
  }

  return null;
};

export const getParentPath = (path: string): string => {
  const parts = path.split('/');
  parts.pop();
  return parts.join('/') || '.';
};

export const getFileName = (path: string): string => {
  const parts = path.split('/');
  return parts[parts.length - 1];
};

export const isDirectory = (path: string): boolean => {
  return path.endsWith('/');
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}; 
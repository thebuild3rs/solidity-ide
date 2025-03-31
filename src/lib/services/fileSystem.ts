import type { FileSystemNode } from '@/lib/types';

export class FileSystemService {
  private files: Map<string, FileSystemNode>;

  constructor() {
    this.files = new Map();
  }

  async createFile(path: string, content: string, extension: string): Promise<FileSystemNode> {
    const file: FileSystemNode = {
      type: 'file',
      path,
      content,
      extension,
      isOpen: false,
      isModified: false,
      id: path,
      name: path.split('/').pop() || path
    };

    this.files.set(path, file);
    return file;
  }

  async createDirectory(path: string): Promise<FileSystemNode> {
    const directory: FileSystemNode = {
      type: 'directory',
      path,
      children: [],
      isOpen: false,
      id: path,
      name: path.split('/').pop() || path
    };

    this.files.set(path, directory);
    return directory;
  }

  async deleteNode(path: string): Promise<void> {
    this.files.delete(path);
  }

  async getNode(path: string): Promise<FileSystemNode | undefined> {
    return this.files.get(path);
  }

  async updateFile(path: string, content: string): Promise<FileSystemNode> {
    const file = this.files.get(path);
    if (!file || file.type !== 'file') {
      throw new Error('File not found');
    }

    file.content = content;
    file.isModified = true;
    return file;
  }

  async saveFile(path: string): Promise<FileSystemNode> {
    const file = this.files.get(path);
    if (!file || file.type !== 'file') {
      throw new Error('File not found');
    }

    file.isModified = false;
    return file;
  }

  async toggleFileOpen(path: string): Promise<FileSystemNode> {
    const file = this.files.get(path);
    if (!file) {
      throw new Error('File not found');
    }

    file.isOpen = !file.isOpen;
    return file;
  }

  async toggleDirectoryOpen(path: string): Promise<FileSystemNode> {
    const directory = this.files.get(path);
    if (!directory || directory.type !== 'directory') {
      throw new Error('Directory not found');
    }

    directory.isOpen = !directory.isOpen;
    return directory;
  }

  async addChildToDirectory(parentPath: string, childPath: string): Promise<void> {
    const parent = this.files.get(parentPath);
    if (!parent || parent.type !== 'directory') {
      throw new Error('Parent directory not found');
    }

    const child = this.files.get(childPath);
    if (!child) {
      throw new Error('Child node not found');
    }

    if (!parent.children) {
      parent.children = [];
    }

    parent.children.push(child);
  }

  async removeChildFromDirectory(parentPath: string, childPath: string): Promise<void> {
    const parent = this.files.get(parentPath);
    if (!parent || parent.type !== 'directory') {
      throw new Error('Parent directory not found');
    }

    if (!parent.children) {
      return;
    }

    parent.children = parent.children.filter(child => child.path !== childPath);
  }

  async getFileContent(path: string): Promise<string> {
    const file = this.files.get(path);
    if (!file || file.type !== 'file') {
      throw new Error('File not found');
    }

    return file.content || '';
  }

  async getDirectoryContents(path: string): Promise<FileSystemNode[]> {
    const directory = this.files.get(path);
    if (!directory || directory.type !== 'directory') {
      throw new Error('Directory not found');
    }

    return directory.children || [];
  }

  async searchFiles(query: string): Promise<FileSystemNode[]> {
    const results: FileSystemNode[] = [];

    for (const node of this.files.values()) {
      if (node.type === 'file' && node.content?.includes(query)) {
        results.push(node);
      }
    }

    return results;
  }
} 
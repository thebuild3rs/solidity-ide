import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

export interface FileSystemNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  extension?: string;
  content?: string;
  children?: FileSystemNode[];
}

export class FileSystemService {
  public baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  async createDirectory(dirPath: string): Promise<void> {
    const fullPath = path.join(this.baseDir, dirPath);
    try {
      await fs.mkdir(fullPath, { recursive: true });
      logger.info(`Created directory: ${fullPath}`);
    } catch (error) {
      logger.error(`Failed to create directory: ${fullPath}`, error);
      throw error;
    }
  }

  async createFile(filePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.baseDir, filePath);
    try {
      await fs.writeFile(fullPath, content, 'utf-8');
      logger.info(`Created file: ${fullPath}`);
    } catch (error) {
      logger.error(`Failed to create file: ${fullPath}`, error);
      throw error;
    }
  }

  async readFile(filePath: string): Promise<string> {
    const fullPath = path.join(this.baseDir, filePath);
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      return content;
    } catch (error) {
      logger.error(`Failed to read file: ${fullPath}`, error);
      throw error;
    }
  }

  async updateFile(filePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.baseDir, filePath);
    try {
      await fs.writeFile(fullPath, content, 'utf-8');
      logger.info(`Updated file: ${fullPath}`);
    } catch (error) {
      logger.error(`Failed to update file: ${fullPath}`, error);
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.baseDir, filePath);
    try {
      await fs.unlink(fullPath);
      logger.info(`Deleted file: ${fullPath}`);
    } catch (error) {
      logger.error(`Failed to delete file: ${fullPath}`, error);
      throw error;
    }
  }

  async deleteDirectory(dirPath: string): Promise<void> {
    const fullPath = path.join(this.baseDir, dirPath);
    try {
      await fs.rm(fullPath, { recursive: true, force: true });
      logger.info(`Deleted directory: ${fullPath}`);
    } catch (error) {
      logger.error(`Failed to delete directory: ${fullPath}`, error);
      throw error;
    }
  }

  async getDirectoryStructure(dirPath: string): Promise<FileSystemNode> {
    const fullPath = path.join(this.baseDir, dirPath);
    try {
      const stats = await fs.stat(fullPath);
      if (!stats.isDirectory()) {
        throw new Error('Path is not a directory');
      }

      const name = path.basename(fullPath);
      const children = await this.readDirectory(fullPath);

      return {
        id: this.generateId(),
        name,
        type: 'directory',
        path: dirPath,
        children,
      };
    } catch (error) {
      logger.error(`Failed to get directory structure: ${fullPath}`, error);
      throw error;
    }
  }

  private async readDirectory(dirPath: string): Promise<FileSystemNode[]> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const nodes: FileSystemNode[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(this.baseDir, fullPath);

      if (entry.isDirectory()) {
        const children = await this.readDirectory(fullPath);
        nodes.push({
          id: this.generateId(),
          name: entry.name,
          type: 'directory',
          path: relativePath,
          children,
        });
      } else {
        const content = await this.readFile(relativePath);
        nodes.push({
          id: this.generateId(),
          name: entry.name,
          type: 'file',
          path: relativePath,
          extension: path.extname(entry.name),
          content,
        });
      }
    }

    return nodes;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
} 
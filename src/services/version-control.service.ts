import { FileSystemService, FileSystemNode } from './file-system.service';
import { logger } from '../utils/logger';

interface Commit {
  id: string;
  message: string;
  timestamp: Date;
  changes: FileChange[];
}

interface FileChange {
  path: string;
  type: 'added' | 'modified' | 'deleted';
  content?: string;
}

export class VersionControlService {
  private fileSystem: FileSystemService;
  private commits: Map<string, Commit>;
  private currentBranch: string;
  private branches: Map<string, string>;

  constructor(baseDir: string) {
    this.fileSystem = new FileSystemService(baseDir);
    this.commits = new Map();
    this.currentBranch = 'main';
    this.branches = new Map();
  }

  async initialize(): Promise<void> {
    try {
      // Create initial commit
      const initialCommit: Commit = {
        id: this.generateId(),
        message: 'Initial commit',
        timestamp: new Date(),
        changes: [],
      };

      this.commits.set(initialCommit.id, initialCommit);
      this.branches.set('main', initialCommit.id);

      logger.info('Initialized version control');
    } catch (error) {
      logger.error('Failed to initialize version control', error);
      throw error;
    }
  }

  async commit(message: string): Promise<string> {
    try {
      const currentFiles = await this.fileSystem.getDirectoryStructure('.');
      const previousCommit = this.commits.get(this.branches.get(this.currentBranch) || '');
      
      if (!previousCommit) {
        throw new Error('No previous commit found');
      }

      const changes = await this.detectChanges(currentFiles, previousCommit);
      
      const commit: Commit = {
        id: this.generateId(),
        message,
        timestamp: new Date(),
        changes,
      };

      this.commits.set(commit.id, commit);
      this.branches.set(this.currentBranch, commit.id);

      logger.info(`Created commit: ${commit.id}`);
      return commit.id;
    } catch (error) {
      logger.error('Failed to create commit', error);
      throw error;
    }
  }

  async createBranch(name: string): Promise<void> {
    try {
      const currentCommitId = this.branches.get(this.currentBranch);
      if (!currentCommitId) {
        throw new Error('No current commit found');
      }

      this.branches.set(name, currentCommitId);
      logger.info(`Created branch: ${name}`);
    } catch (error) {
      logger.error(`Failed to create branch: ${name}`, error);
      throw error;
    }
  }

  async switchBranch(name: string): Promise<void> {
    try {
      if (!this.branches.has(name)) {
        throw new Error(`Branch not found: ${name}`);
      }

      const commitId = this.branches.get(name);
      if (!commitId) {
        throw new Error(`No commit found for branch: ${name}`);
      }

      await this.restoreCommit(commitId);
      this.currentBranch = name;
      logger.info(`Switched to branch: ${name}`);
    } catch (error) {
      logger.error(`Failed to switch branch: ${name}`, error);
      throw error;
    }
  }

  async merge(sourceBranch: string): Promise<void> {
    try {
      const sourceCommitId = this.branches.get(sourceBranch);
      const targetCommitId = this.branches.get(this.currentBranch);

      if (!sourceCommitId || !targetCommitId) {
        throw new Error('Source or target commit not found');
      }

      const sourceCommit = this.commits.get(sourceCommitId);
      const targetCommit = this.commits.get(targetCommitId);

      if (!sourceCommit || !targetCommit) {
        throw new Error('Source or target commit not found');
      }

      // Apply changes from source branch
      for (const change of sourceCommit.changes) {
        if (change.type === 'added' || change.type === 'modified') {
          await this.fileSystem.createFile(change.path, change.content || '');
        } else if (change.type === 'deleted') {
          await this.fileSystem.deleteFile(change.path);
        }
      }

      // Create merge commit
      await this.commit(`Merge ${sourceBranch} into ${this.currentBranch}`);
      logger.info(`Merged ${sourceBranch} into ${this.currentBranch}`);
    } catch (error) {
      logger.error(`Failed to merge branch: ${sourceBranch}`, error);
      throw error;
    }
  }

  private async detectChanges(
    currentFiles: FileSystemNode,
    previousCommit: Commit
  ): Promise<FileChange[]> {
    const changes: FileChange[] = [];
    const previousFiles = new Set(
      previousCommit.changes.map(change => change.path)
    );

    // Detect added and modified files
    for (const file of this.flattenFiles(currentFiles)) {
      if (!previousFiles.has(file.path)) {
        changes.push({
          path: file.path,
          type: 'added',
          content: file.content,
        });
      } else {
        const previousChange = previousCommit.changes.find(
          change => change.path === file.path
        );
        if (previousChange?.content !== file.content) {
          changes.push({
            path: file.path,
            type: 'modified',
            content: file.content,
          });
        }
      }
    }

    // Detect deleted files
    for (const file of previousFiles) {
      if (!this.findFile(currentFiles, file)) {
        changes.push({
          path: file,
          type: 'deleted',
        });
      }
    }

    return changes;
  }

  private async restoreCommit(commitId: string): Promise<void> {
    const commit = this.commits.get(commitId);
    if (!commit) {
      throw new Error(`Commit not found: ${commitId}`);
    }

    // Restore files to commit state
    for (const change of commit.changes) {
      if (change.type === 'added' || change.type === 'modified') {
        await this.fileSystem.createFile(change.path, change.content || '');
      } else if (change.type === 'deleted') {
        await this.fileSystem.deleteFile(change.path);
      }
    }
  }

  private flattenFiles(node: FileSystemNode): FileSystemNode[] {
    const files: FileSystemNode[] = [];
    if (node.type === 'file') {
      files.push(node);
    } else if (node.children) {
      for (const child of node.children) {
        files.push(...this.flattenFiles(child));
      }
    }
    return files;
  }

  private findFile(node: FileSystemNode, path: string): boolean {
    if (node.path === path) {
      return true;
    }
    if (node.children) {
      return node.children.some(child => this.findFile(child, path));
    }
    return false;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
} 
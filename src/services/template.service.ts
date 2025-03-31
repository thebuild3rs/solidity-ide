import path from 'path';
import { FileSystemService, FileSystemNode } from './file-system.service';
import { logger } from '../utils/logger';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  files: FileSystemNode[];
  dependencies?: Record<string, string>;
}

export class TemplateService {
  private fileSystem: FileSystemService;
  private templates: Map<string, Template>;

  constructor(baseDir: string) {
    this.fileSystem = new FileSystemService(baseDir);
    this.templates = new Map();
  }

  async loadTemplates(): Promise<void> {
    try {
      const templatesDir = path.join(this.fileSystem.baseDir, 'templates');
      const structure = await this.fileSystem.getDirectoryStructure('templates');

      for (const category of structure.children || []) {
        if (category.type === 'directory') {
          for (const template of category.children || []) {
            if (template.type === 'directory') {
              const templateConfig = await this.loadTemplateConfig(template.path);
              this.templates.set(templateConfig.id, templateConfig);
            }
          }
        }
      }

      logger.info(`Loaded ${this.templates.size} templates`);
    } catch (error) {
      logger.error('Failed to load templates', error);
      throw error;
    }
  }

  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async getTemplateById(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createProjectFromTemplate(
    templateId: string,
    projectPath: string,
    variables: Record<string, string>
  ): Promise<void> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    try {
      // Create project directory
      await this.fileSystem.createDirectory(projectPath);

      // Copy and process template files
      for (const file of template.files) {
        if (file.type === 'file') {
          let content = file.content || '';
          
          // Replace variables in content
          for (const [key, value] of Object.entries(variables)) {
            content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
          }

          // Create file with processed content
          await this.fileSystem.createFile(
            path.join(projectPath, file.path),
            content
          );
        } else if (file.type === 'directory') {
          await this.fileSystem.createDirectory(
            path.join(projectPath, file.path)
          );
        }
      }

      logger.info(`Created project from template: ${templateId}`);
    } catch (error) {
      logger.error(`Failed to create project from template: ${templateId}`, error);
      throw error;
    }
  }

  private async loadTemplateConfig(templatePath: string): Promise<Template> {
    const configPath = path.join(templatePath, 'template.json');
    const configContent = await this.fileSystem.readFile(configPath);
    const config = JSON.parse(configContent);

    const files = await this.fileSystem.getDirectoryStructure(templatePath);

    return {
      id: config.id,
      name: config.name,
      description: config.description,
      category: config.category,
      version: config.version,
      files: files.children || [],
      dependencies: config.dependencies,
    };
  }
} 
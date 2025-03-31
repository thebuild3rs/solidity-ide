export interface TemplateFile {
  name: string;
  path: string;
  content: string;
}

export interface ProtocolTemplate {
  name: string;
  description: string;
  version: string;
  files: TemplateFile[];
} 
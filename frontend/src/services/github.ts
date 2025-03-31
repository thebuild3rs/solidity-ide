import axios from 'axios';
import type { ProtocolTemplate, TemplateFile } from '../lib/types';

export async function fetchGithubContent(url: string): Promise<string> {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching GitHub content:', error);
    throw error;
  }
}

export async function fetchContractContent(template: ProtocolTemplate): Promise<ProtocolTemplate> {
  const files = await Promise.all(
    template.files.map(async (file: TemplateFile) => {
      try {
        const content = await fetchGithubContent(file.content);
        return { ...file, content };
      } catch (error) {
        console.error(`Error fetching content for ${file.name}:`, error);
        return file;
      }
    })
  );

  return { ...template, files };
} 
import axios from 'axios';
import { Project, FileSystemNode } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Project API
export const projectApi = {
  getAll: () => api.get<Project[]>('/projects'),
  getById: (id: string) => api.get<Project>(`/projects/${id}`),
  create: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Project>('/projects', data),
  update: (id: string, data: Partial<Project>) =>
    api.put<Project>(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// File System API
export const fileSystemApi = {
  getStructure: (projectId: string) =>
    api.get<FileSystemNode>(`/projects/${projectId}/files`),
  getFile: (projectId: string, path: string) =>
    api.get<{ content: string }>(`/projects/${projectId}/files/${path}`),
  saveFile: (projectId: string, path: string, content: string) =>
    api.put(`/projects/${projectId}/files/${path}`, { content }),
  createFile: (projectId: string, path: string, content: string) =>
    api.post(`/projects/${projectId}/files/${path}`, { content }),
  deleteFile: (projectId: string, path: string) =>
    api.delete(`/projects/${projectId}/files/${path}`),
};

// Contract API
export const contractApi = {
  compile: (projectId: string) =>
    api.post(`/projects/${projectId}/contracts/compile`),
  deploy: (projectId: string, data: { network: string; contract: string }) =>
    api.post(`/projects/${projectId}/contracts/deploy`, data),
  getDeployed: (projectId: string) =>
    api.get(`/projects/${projectId}/contracts/deployed`),
};

// Error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      return Promise.reject(new Error('No response received from server'));
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
      return Promise.reject(error);
    }
  }
);

export default api; 
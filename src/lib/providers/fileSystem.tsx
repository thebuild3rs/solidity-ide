import { createContext, useContext, useState } from 'react';
import type { FileSystemNode } from '@/lib/types';

interface FileSystemContextType {
  files: FileSystemNode[];
  activeFile: FileSystemNode | null;
  openFiles: FileSystemNode[];
  addFile: (file: FileSystemNode) => void;
  removeFile: (path: string) => void;
  updateFile: (path: string, content: string) => void;
  setActiveFile: (file: FileSystemNode | null) => void;
  openFile: (file: FileSystemNode) => void;
  closeFile: (path: string) => void;
}

const FileSystemContext = createContext<FileSystemContextType>({
  files: [],
  activeFile: null,
  openFiles: [],
  addFile: () => {},
  removeFile: () => {},
  updateFile: () => {},
  setActiveFile: () => {},
  openFile: () => {},
  closeFile: () => {},
});

export function FileSystemProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<FileSystemNode[]>([]);
  const [activeFile, setActiveFile] = useState<FileSystemNode | null>(null);
  const [openFiles, setOpenFiles] = useState<FileSystemNode[]>([]);

  const addFile = (file: FileSystemNode) => {
    setFiles(prev => [...prev, file]);
  };

  const removeFile = (path: string) => {
    setFiles(prev => prev.filter(f => f.path !== path));
    if (activeFile?.path === path) {
      setActiveFile(null);
    }
    closeFile(path);
  };

  const updateFile = (path: string, content: string) => {
    setFiles(prev =>
      prev.map(f =>
        f.path === path
          ? { ...f, content }
          : f
      )
    );
  };

  const openFile = (file: FileSystemNode) => {
    if (!openFiles.find(f => f.path === file.path)) {
      setOpenFiles(prev => [...prev, file]);
    }
    setActiveFile(file);
  };

  const closeFile = (path: string) => {
    setOpenFiles(prev => prev.filter(f => f.path !== path));
    if (activeFile?.path === path) {
      setActiveFile(openFiles.find(f => f.path !== path) || null);
    }
  };

  return (
    <FileSystemContext.Provider
      value={{
        files,
        activeFile,
        openFiles,
        addFile,
        removeFile,
        updateFile,
        setActiveFile,
        openFile,
        closeFile,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
}

export const useFileSystem = () => useContext(FileSystemContext); 
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FileSystemNode {
  path: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileSystemNode[];
}

interface FileSystemState {
  currentPath: string;
  structure: FileSystemNode | null;
  selectedFile: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: FileSystemState = {
  currentPath: '.',
  structure: null,
  selectedFile: null,
  loading: false,
  error: null,
};

const fileSystemSlice = createSlice({
  name: 'fileSystem',
  initialState,
  reducers: {
    setCurrentPath: (state, action: PayloadAction<string>) => {
      state.currentPath = action.payload;
    },
    setStructure: (state, action: PayloadAction<FileSystemNode>) => {
      state.structure = action.payload;
    },
    setSelectedFile: (state, action: PayloadAction<string | null>) => {
      state.selectedFile = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateFileContent: (state, action: PayloadAction<{ path: string; content: string }>) => {
      if (state.structure) {
        const updateNode = (node: FileSystemNode): FileSystemNode => {
          if (node.path === action.payload.path) {
            return { ...node, content: action.payload.content };
          }
          if (node.children) {
            return {
              ...node,
              children: node.children.map(updateNode),
            };
          }
          return node;
        };
        state.structure = updateNode(state.structure);
      }
    },
  },
});

export const {
  setCurrentPath,
  setStructure,
  setSelectedFile,
  setLoading,
  setError,
  updateFileContent,
} = fileSystemSlice.actions;

export default fileSystemSlice.reducer; 
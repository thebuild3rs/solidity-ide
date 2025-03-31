import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Grid, Paper, Typography, IconButton, Tooltip } from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Save as SaveIcon,
  Build as BuildIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import FileTree from '../components/FileTree';

const ProjectEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const project = useSelector((state: RootState) =>
    state.project.projects.find((p) => p.id === id)
  );
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');

  const handleFileSelect = (filePath: string) => {
    setCurrentFile(filePath);
    // TODO: Load file content from backend
    setEditorContent('// TODO: Load file content');
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value);
    }
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving file:', currentFile, editorContent);
  };

  const handleBuild = () => {
    // TODO: Implement build functionality
    console.log('Building project');
  };

  const handleDeploy = () => {
    // TODO: Implement deploy functionality
    console.log('Deploying contract');
  };

  const handleConnectWallet = () => {
    // TODO: Implement wallet connection
    console.log('Connecting wallet');
  };

  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">Project not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {project.name}
        </Typography>
        <Tooltip title="Connect Wallet">
          <IconButton onClick={handleConnectWallet}>
            <WalletIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Save">
          <IconButton onClick={handleSave}>
            <SaveIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Build">
          <IconButton onClick={handleBuild}>
            <BuildIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Deploy">
          <IconButton onClick={handleDeploy} color="primary">
            <PlayArrowIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* File Tree */}
        <Grid item xs={3} sx={{ borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
          <FileTree onFileSelect={handleFileSelect} />
        </Grid>

        {/* Editor */}
        <Grid item xs={9} sx={{ overflow: 'hidden' }}>
          <Editor
            height="100%"
            defaultLanguage="solidity"
            theme="vs-dark"
            value={editorContent}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectEditor; 
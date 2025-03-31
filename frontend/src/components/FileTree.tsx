import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
} from '@mui/material';
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface FileTreeProps {
  onFileSelect: (filePath: string) => void;
}

interface FileNode {
  path: string;
  type: 'file' | 'directory';
  name: string;
  children?: FileNode[];
}

const FileTree: React.FC<FileTreeProps> = ({ onFileSelect }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const fileSystem = useSelector((state: RootState) => state.fileSystem.structure);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isDirectory = node.type === 'directory';

    return (
      <React.Fragment key={node.path}>
        <ListItem
          button
          onClick={() => {
            if (isDirectory) {
              toggleFolder(node.path);
            } else {
              onFileSelect(node.path);
            }
          }}
          sx={{ pl: level * 2 }}
        >
          <ListItemIcon>
            {isDirectory ? (
              isExpanded ? <FolderOpenIcon /> : <FolderIcon />
            ) : (
              <FileIcon />
            )}
          </ListItemIcon>
          <ListItemText primary={node.name} />
        </ListItem>
        {isDirectory && node.children && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {node.children.map((child) => renderNode(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  if (!fileSystem) {
    return (
      <Box sx={{ p: 2 }}>
        <ListItem>
          <ListItemText primary="No files available" />
        </ListItem>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <List>
        {renderNode(fileSystem)}
      </List>
    </Box>
  );
};

export default FileTree; 
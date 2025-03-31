import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { FileSystemNode } from '@/lib/types';

interface FileExplorerProps {
  files: FileSystemNode[];
  onFileSelect: (file: FileSystemNode) => void;
}

export function FileExplorer({ files, onFileSelect }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderNode = (node: FileSystemNode, level = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isFolder = node.type === 'directory';

    return (
      <div key={node.path}>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start px-2 py-1.5 h-8 hover:bg-muted',
            'text-sm font-normal'
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => isFolder ? toggleFolder(node.path) : onFileSelect(node)}
        >
          <span className="flex items-center">
            {isFolder ? (
              <>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1" />
                )}
                <Folder className="h-4 w-4 mr-2" />
              </>
            ) : (
              <File className="h-4 w-4 mr-2" />
            )}
            {node.name}
          </span>
        </Button>
        {isFolder && isExpanded && node.children?.map(child => renderNode(child, level + 1))}
      </div>
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-2">
        {files.map(node => renderNode(node))}
      </div>
    </ScrollArea>
  );
}
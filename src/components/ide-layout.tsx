import React from 'react';
import { FileExplorer } from './file-explorer';
import { Terminal } from './terminal';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import Editor from '@monaco-editor/react';
import type { FileSystemNode, EditorTab, TerminalCommand } from '@/lib/types';

interface IDELayoutProps {
  files: FileSystemNode[];
  openTabs: EditorTab[];
  activeTab: string;
  commands: TerminalCommand[];
  onFileSelect: (file: FileSystemNode) => void;
  onCommand: (command: string) => void;
}

export function IDELayout({
  files,
  openTabs,
  activeTab,
  commands,
  onFileSelect,
  onCommand
}: IDELayoutProps) {
  const activeFile = openTabs.find(tab => tab.name === activeTab);

  return (
    <div className="h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <div className="h-14 border-b px-4 flex items-center justify-between">
        <div className="font-semibold">DeFi IDE</div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Sidebar - File Explorer */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <FileExplorer files={files} onFileSelect={onFileSelect} />
          </ResizablePanel>

          <ResizableHandle />

          {/* Main Editor Area */}
          <ResizablePanel defaultSize={60}>
            <Tabs defaultValue="editor" className="h-full flex flex-col">
              <div className="border-b px-4">
                <TabsList>
                  {openTabs.map(tab => (
                    <TabsTrigger key={tab.path} value={tab.name}>
                      {tab.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              <div className="flex-1 p-4">
                {activeFile && (
                  <Editor
                    height="100%"
                    defaultLanguage={activeFile.language}
                    defaultValue={activeFile.content}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      readOnly: false,
                      wordWrap: 'on'
                    }}
                  />
                )}
              </div>
            </Tabs>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Sidebar - Documentation/Help */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full border-l p-4">
              <h3 className="font-semibold mb-4">Documentation</h3>
              {/* Documentation content will be added here */}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Bottom Terminal */}
      <ResizablePanelGroup direction="vertical">
        <ResizableHandle />
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <Terminal commands={commands} onCommand={onCommand} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
} 
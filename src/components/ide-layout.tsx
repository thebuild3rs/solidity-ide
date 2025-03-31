import React, { useState } from 'react';
import { FileExplorer } from '@/components/file-explorer';
import { Terminal } from '@/components/terminal';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import Editor from '@monaco-editor/react';
import type { FileSystemNode, EditorTab, TerminalCommand } from '@/lib/types';
import { useFileSystem } from '@/lib/providers/fileSystem';
import { useProject } from '@/lib/providers/project';
import { useEthereum } from '@/lib/providers/ethereum';
import { WalletConnect } from '@/components/wallet-connect';
import { ContractExplorer } from '@/components/blockchain/contract-explorer';
import { ContractFunctionCaller } from '@/components/blockchain/contract-function-caller';
import { NetworkSelector } from '@/components/blockchain/network-selector';
import { TransactionHistory } from '@/components/blockchain/transaction-history';
import { Presence } from '@/components/collaboration/presence';
import { BranchSelector } from '@/components/version-control/branch-selector';
import { CommitHistory } from '@/components/version-control/commit-history';

interface IDELayoutProps {
  files: FileSystemNode[];
  openTabs: EditorTab[];
  activeTab: string;
  commands: TerminalCommand[];
  onFileSelect: (file: FileSystemNode) => void;
  onCommand: (command: string) => void;
}

export function IDELayout() {
  const { files, activeFile, openFile, closeFile } = useFileSystem();
  const { currentProject } = useProject();
  const { address, chainId } = useEthereum();

  // Mock data for components that need it
  const [networks] = useState([
    { id: '1', name: 'Ethereum Mainnet', chainId: 1 },
    { id: '5', name: 'Goerli Testnet', chainId: 5 },
    { id: '137', name: 'Polygon Mainnet', chainId: 137 },
  ]);

  const [currentNetwork, setCurrentNetwork] = useState(networks[0]);

  const [users] = useState([
    { id: '1', name: 'User 1', avatar: 'https://github.com/shadcn.png' },
    { id: '2', name: 'User 2', avatar: 'https://github.com/shadcn.png' },
  ]);

  const [branches] = useState([
    { id: 'main', name: 'main' },
    { id: 'develop', name: 'develop' },
    { id: 'feature/new-contract', name: 'feature/new-contract' },
  ]);

  const [currentBranch, setCurrentBranch] = useState(branches[0]);

  const [transactions] = useState([
    {
      id: '1',
      hash: '0x123...',
      type: 'deploy',
      status: 'success',
      timestamp: Date.now(),
    },
  ]);

  const [commits] = useState([
    {
      id: '1',
      message: 'Initial commit',
      author: 'User 1',
      timestamp: Date.now(),
    },
  ]);

  const [commands, setCommands] = useState([]);

  const handleCommand = (command: string) => {
    setCommands(prev => [...prev, { id: Date.now(), command, output: 'Command executed' }]);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Sidebar */}
      <div className="w-64 border-r">
        <FileExplorer
          files={files}
          onFileSelect={openFile}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-12 border-b flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <NetworkSelector
              networks={networks}
              currentNetwork={currentNetwork}
              onNetworkChange={setCurrentNetwork}
            />
            <WalletConnect />
            <Presence
              users={users}
              currentUserId="1"
            />
          </div>
          <div className="flex items-center space-x-4">
            <BranchSelector
              branches={branches}
              currentBranch={currentBranch}
              onBranchChange={setCurrentBranch}
              onCreateBranch={(name) => {
                const newBranch = { id: name, name };
                setCurrentBranch(newBranch);
              }}
            />
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex">
          {/* Editor */}
          <div className="flex-1">
            {/* Editor content will go here */}
          </div>

          {/* Right Sidebar */}
          <div className="w-80 border-l">
            <div className="h-full flex flex-col">
              <ContractExplorer
                contract={currentProject?.contracts[0]}
                onCallFunction={() => {}}
                events={[]}
              />
              <ContractFunctionCaller
                function={currentProject?.contracts[0]?.abi[0]}
                onCall={() => {}}
              />
              <TransactionHistory
                transactions={transactions}
              />
              <CommitHistory
                commits={commits}
                onSelectCommit={() => {}}
              />
            </div>
          </div>
        </div>

        {/* Terminal */}
        <div className="h-64 border-t">
          <Terminal
            commands={commands}
            onCommand={handleCommand}
          />
        </div>
      </div>
    </div>
  );
} 
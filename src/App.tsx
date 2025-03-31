import { useState } from 'react';
import { IDELayout } from '@/components/ide-layout';
import { TemplateGallery } from '@/components/protocol-templates/template-gallery';
import { Dashboard } from '@/components/analytics/dashboard';
import { Chat } from '@/components/collaboration/chat';
import { Button } from '@/components/ui/button';
import { FileText, Terminal as TerminalIcon, Wallet, Settings, Play, Plus, LayoutDashboard, BookTemplate, MessageSquare } from 'lucide-react';
import type { FileSystemNode, EditorTab, TerminalCommand, AnalyticsData, TokenPrice, User, ChatMessage } from '@/lib/types';

function App() {
  const [files, setFiles] = useState<FileSystemNode[]>([
    {
      id: '1',
      name: 'contracts',
      type: 'directory',
      path: '/contracts',
      children: [
        {
          id: '2',
          name: 'Token.sol',
          type: 'file',
          path: '/contracts/Token.sol',
          extension: '.sol',
          content: '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract Token {\n    string public name;\n    string public symbol;\n    uint8 public decimals;\n    uint256 public totalSupply;\n\n    constructor() {\n        name = "DeFi Token";\n        symbol = "DFT";\n        decimals = 18;\n        totalSupply = 1000000 * 10**uint256(decimals);\n    }\n}'
        }
      ]
    }
  ]);

  const [activeTab, setActiveTab] = useState('Token.sol');
  const [openTabs, setOpenTabs] = useState<EditorTab[]>([
    {
      id: '2',
      name: 'Token.sol',
      path: '/contracts/Token.sol',
      content: '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract Token {\n    string public name;\n    string public symbol;\n    uint8 public decimals;\n    uint256 public totalSupply;\n\n    constructor() {\n        name = "DeFi Token";\n        symbol = "DFT";\n        decimals = 18;\n        totalSupply = 1000000 * 10**uint256(decimals);\n    }\n}',
      language: 'sol'
    }
  ]);

  const [commands, setCommands] = useState<TerminalCommand[]>([]);

  const [view, setView] = useState<'editor' | 'templates' | 'analytics'>('editor');

  // Sample analytics data
  const analyticsData: AnalyticsData = {
    tvl: 2500000,
    volume24h: 750000,
    transactions24h: 1200,
    activeUsers24h: 450,
    gasUsed24h: 25.5
  };

  const tokenPrices: TokenPrice[] = [
    { symbol: 'ETH', price: 3500, change24h: 2.5 },
    { symbol: 'BTC', price: 50000, change24h: -1.2 },
    { symbol: 'DFT', price: 1.25, change24h: 5.8 }
  ];

  // Chat data
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'system',
      content: 'Welcome to the project chat! 👋',
      timestamp: Date.now(),
      type: 'system'
    }
  ]);

  const users: User[] = [
    {
      id: 'current',
      name: 'You',
      color: '#10B981',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60'
    },
    {
      id: 'system',
      name: 'System',
      color: '#6366F1',
      avatar: 'https://images.unsplash.com/photo-1544991185-13fe5d113fe3?w=80&auto=format&fit=crop&q=60'
    }
  ];

  const handleFileSelect = (file: FileSystemNode) => {
    if (file.type === 'file' && file.id && file.name) {
      if (!openTabs.find(tab => tab.path === file.path)) {
        setOpenTabs([...openTabs, {
          id: file.id,
          name: file.name,
          path: file.path,
          content: file.content || '',
          language: file.extension?.replace('.', '') || 'text'
        }]);
      }
      setActiveTab(file.name);
      setView('editor');
    }
  };

  const handleCommand = (command: string) => {
    const output = getCommandOutput(command);
    setCommands([...commands, {
      id: Date.now().toString(),
      command,
      timestamp: Date.now(),
      output
    }]);

    // Add system message to chat for important commands
    if (['deploy', 'upgrade', 'pause'].includes(command.split(' ')[0])) {
      setMessages([...messages, {
        id: Date.now().toString(),
        userId: 'system',
        content: `Command executed: ${command}\n${output}`,
        timestamp: Date.now(),
        type: 'system'
      }]);
    }
  };

  const getCommandOutput = (command: string): string => {
    const [cmd, ...args] = command.split(' ');
    
    if (cmd === 'help') {
      return 'Type a command to get started. Use --help with any command for more details.';
    }
    
    if (args.includes('--help')) {
      return `Help for ${cmd}:\n` +
        `Usage: ${cmd} [options]\n` +
        `Options:\n` +
        `  --network   Specify the network (mainnet, testnet)\n` +
        `  --verbose   Show detailed output\n` +
        `  --help     Show this help message`;
    }

    switch (cmd) {
      case 'deploy':
        return 'Deploying contracts to network...\n' +
          '✓ Token.sol deployed to 0x1234...\n' +
          '✓ Deployment completed successfully!';
      case 'test':
        return 'Running tests...\n' +
          '  ✓ Should deploy token\n' +
          '  ✓ Should set correct initial supply\n' +
          '  ✓ Should transfer tokens\n' +
          '3 passing (1.2s)';
      case 'compile':
        return 'Compiling contracts...\n' +
          '✓ Token.sol\n' +
          'Compilation completed successfully!';
      case 'verify':
        return 'Verifying contract on Etherscan...\n' +
          '✓ Contract verified successfully!\n' +
          'View at: https://etherscan.io/address/0x1234';
      case 'audit':
        return 'Running security audit...\n' +
          '✓ No critical vulnerabilities found\n' +
          'Medium: 0 | Low: 2 | Info: 5';
      case 'simulate':
        return 'Simulating attack vectors...\n' +
          '✓ Reentrancy check passed\n' +
          '✓ Overflow check passed\n' +
          '✓ Access control check passed';
      case 'gas':
        return 'Analyzing gas usage...\n' +
          'Function: transfer\n' +
          '  Base: 21,000\n' +
          '  Execution: 34,245\n' +
          '  Total: 55,245 gas';
      case 'clear':
        setCommands([]);
        return '';
      default:
        return `Unknown command: ${cmd}. Type 'help' for available commands.`;
    }
  };

  const handleSendMessage = (content: string) => {
    setMessages([...messages, {
      id: Date.now().toString(),
      userId: 'current',
      content,
      timestamp: Date.now(),
      type: 'chat'
    }]);
  };

  const activeFile = openTabs.find(tab => tab.name === activeTab);

  return (
    <div className="h-screen w-screen bg-background text-foreground">
      <div className="flex h-14 items-center border-b px-4 justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('editor')}
            className={view === 'editor' ? 'bg-muted' : ''}
          >
            <FileText className="h-4 w-4 mr-2" />
            Editor
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('templates')}
            className={view === 'templates' ? 'bg-muted' : ''}
          >
            <BookTemplate className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('analytics')}
            className={view === 'analytics' ? 'bg-muted' : ''}
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Wallet className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {view === 'editor' && (
        <IDELayout
          files={files}
          openTabs={openTabs}
          activeTab={activeTab}
          commands={commands}
          onFileSelect={handleFileSelect}
          onCommand={handleCommand}
        />
      )}
      {view === 'templates' && (
        <TemplateGallery onSelectTemplate={(template) => {
          setFiles([...files, ...template.files]);
          setView('editor');
        }} />
      )}
      {view === 'analytics' && (
        <Dashboard
          analytics={analyticsData}
          tokenPrices={tokenPrices}
        />
      )}
    </div>
  );
}

export default App;
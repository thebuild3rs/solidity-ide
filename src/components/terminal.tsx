import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Rocket, TestTube2, FileCode, Search, Shield, RotateCw, Fuel, Dice1 as Dice, TrendingUp, Pause, LineChart, Coins, Grid as Bridge, Save, Trash, HelpCircle } from 'lucide-react';
import type { TerminalCommand } from '@/lib/types';

interface TerminalProps {
  commands: TerminalCommand[];
  onCommand: (command: string) => void;
}

const AVAILABLE_COMMANDS = {
  core: [
    { name: 'deploy', icon: <Rocket className="h-4 w-4" />, description: 'Deploy smart contracts to the network' },
    { name: 'test', icon: <TestTube2 className="h-4 w-4" />, description: 'Run the test suite' },
    { name: 'compile', icon: <FileCode className="h-4 w-4" />, description: 'Compile all contracts' },
    { name: 'verify', icon: <Search className="h-4 w-4" />, description: 'Verify contract on Etherscan' },
  ],
  security: [
    { name: 'audit', icon: <Shield className="h-4 w-4" />, description: 'Run security audit' },
    { name: 'simulate', icon: <RotateCw className="h-4 w-4" />, description: 'Simulate attack vectors' },
    { name: 'gas', icon: <Fuel className="h-4 w-4" />, description: 'Analyze gas optimization' },
    { name: 'fuzzing', icon: <Dice className="h-4 w-4" />, description: 'Run fuzzing tests' },
  ],
  protocol: [
    { name: 'upgrade', icon: <TrendingUp className="h-4 w-4" />, description: 'Upgrade protocol contracts' },
    { name: 'pause', icon: <Pause className="h-4 w-4" />, description: 'Pause protocol operations' },
    { name: 'monitor', icon: <LineChart className="h-4 w-4" />, description: 'Track protocol metrics' },
    { name: 'stake', icon: <Coins className="h-4 w-4" />, description: 'Manage staking operations' },
    { name: 'bridge', icon: <Bridge className="h-4 w-4" />, description: 'Manage cross-chain bridges' },
  ],
  utility: [
    { name: 'save', icon: <Save className="h-4 w-4" />, description: 'Save current changes' },
    { name: 'clear', icon: <Trash className="h-4 w-4" />, description: 'Clear console output' },
    { name: 'help', icon: <HelpCircle className="h-4 w-4" />, description: 'Show this help message' },
  ],
};

const WELCOME_MESSAGE = `Welcome to framew0rk Console! 🚀

Available Commands:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Core Commands:
  deploy   🚀  Deploy smart contracts to the network
  test     🧪  Run the test suite
  compile  📝  Compile all contracts
  verify   🔍  Verify contract on Etherscan

Security Commands:
  audit    🛡️   Run security audit
  simulate 🔄  Simulate attack vectors
  gas      ⛽  Analyze gas optimization
  fuzzing  🎲  Run fuzzing tests

Protocol Commands:
  upgrade  📈  Upgrade protocol contracts
  pause    ⏸️   Pause protocol operations
  monitor  📊  Track protocol metrics
  stake    💰  Manage staking operations
  bridge   🌉  Manage cross-chain bridges

Utility Commands:
  save     💾  Save current changes
  clear    🧹  Clear console output
  help     ❓  Show this help message

Tips:
  • Use ↑/↓ arrows to navigate command history
  • Press Tab for command completion
  • Type 'clear' to reset the console
  • Add --help to any command for detailed usage

Get started by typing a command...`;

export function Terminal({ commands, onCommand }: TerminalProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [commands, suggestions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const allCommands = Object.values(AVAILABLE_COMMANDS).flat().map(cmd => cmd.name);
      const matches = allCommands.filter(cmd => cmd.startsWith(input.toLowerCase()));
      if (matches.length === 1) {
        setInput(matches[0]);
      } else if (matches.length > 1) {
        setSuggestions(matches);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setHistory([...history, input]);
      setHistoryIndex(-1);
      onCommand(input);
      setInput('');
      setSuggestions([]);
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-green-400 font-mono text-sm">
      <div 
        ref={outputRef}
        className="flex-1 overflow-y-auto p-4"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#4a5568 #1a202c',
          overflowY: 'scroll',
          height: 'calc(100% - 60px)'
        }}
      >
        <div className="whitespace-pre-wrap mb-4">{WELCOME_MESSAGE}</div>
        {commands.map((cmd) => (
          <div key={cmd.id} className="mb-2">
            <div className="flex items-center gap-2">
              <span className="text-white">$</span>
              <span className="text-white">{cmd.command}</span>
              {cmd.timestamp && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {new Date(cmd.timestamp).toLocaleTimeString()}
                </Badge>
              )}
            </div>
            {cmd.output && (
              <div className="whitespace-pre-wrap mt-1 text-green-400 pl-4">{cmd.output}</div>
            )}
          </div>
        ))}
        {suggestions.length > 0 && (
          <div className="mb-2 p-2 bg-gray-900 rounded">
            <div className="text-xs text-gray-400 mb-1">Suggestions:</div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Badge
                  key={suggestion}
                  className="cursor-pointer hover:bg-gray-800"
                  onClick={() => {
                    setInput(suggestion);
                    setSuggestions([]);
                    inputRef.current?.focus();
                  }}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-800">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="text-white">$</span>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none text-green-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Enter command..."
            autoComplete="off"
            spellCheck="false"
          />
        </form>
      </div>
    </div>
  );
}
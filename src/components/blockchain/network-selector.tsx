import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Network, Signal, SignalHigh, SignalLow } from 'lucide-react';
import type { NetworkInfo } from '@/lib/types';

interface NetworkSelectorProps {
  networks: NetworkInfo[];
  currentNetwork: string;
  onNetworkChange: (networkId: string) => void;
}

export function NetworkSelector({ networks, currentNetwork, onNetworkChange }: NetworkSelectorProps) {
  const getNetworkStatus = (networkId: string) => {
    // Simulate network status - in production, this would check actual network health
    const statuses = {
      '1': { icon: SignalHigh, color: 'text-green-500', text: 'Excellent' },
      '5': { icon: Signal, color: 'text-yellow-500', text: 'Good' },
      '11155111': { icon: SignalLow, color: 'text-orange-500', text: 'Fair' },
    };
    return statuses[networkId as keyof typeof statuses] || 
           { icon: SignalLow, color: 'text-gray-500', text: 'Unknown' };
  };

  return (
    <div className="flex items-center space-x-2 p-2 border rounded-lg bg-muted/50">
      <Network className="h-4 w-4 text-muted-foreground" />
      <Select value={currentNetwork} onValueChange={onNetworkChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select network" />
        </SelectTrigger>
        <SelectContent>
          {networks.map((network) => {
            const status = getNetworkStatus(network.id);
            const StatusIcon = status.icon;
            return (
              <SelectItem key={network.id} value={network.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{network.name}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <StatusIcon className={`h-4 w-4 ${status.color}`} />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Network Status: {status.text}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <Badge variant="outline" className="ml-2">
        Chain ID: {networks.find(n => n.id === currentNetwork)?.chainId}
      </Badge>
    </div>
  );
}
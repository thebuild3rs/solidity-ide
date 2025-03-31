import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Code, History, FileJson } from 'lucide-react';
import { ContractFunctionCaller } from './contract-function-caller';
import type { ContractInfo, ABIFunction, EventLog } from '@/lib/types';

interface ContractExplorerProps {
  contract: ContractInfo;
  onCallFunction: (functionName: string, args: any[]) => Promise<any>;
  events: EventLog[];
}

export function ContractExplorer({ contract, onCallFunction, events }: ContractExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFunction, setSelectedFunction] = useState<ABIFunction | null>(null);

  const functions = contract.abi.filter((item: ABIFunction) => 
    item.type === 'function' && 
    (!searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>Contract Explorer</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search functions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[200px] pl-9"
              />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="functions">
          <TabsList>
            <TabsTrigger value="functions">Functions</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="abi">ABI</TabsTrigger>
          </TabsList>

          <TabsContent value="functions" className="mt-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {functions.map((func: ABIFunction) => (
                  <div
                    key={func.name}
                    className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedFunction(func)}
                  >
                    <h3 className="font-medium">{func.name}</h3>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <span className="px-2 py-1 rounded-full bg-muted">
                        {func.stateMutability || 'nonpayable'}
                      </span>
                    </div>
                    {selectedFunction?.name === func.name && (
                      <ContractFunctionCaller
                        function={func}
                        onCall={(args) => onCallFunction(func.name, args)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="events" className="mt-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{event.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        Block #{event.blockNumber}
                      </span>
                    </div>
                    <pre className="mt-2 p-2 bg-muted rounded-md text-sm">
                      {JSON.stringify(event.args, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="abi" className="mt-4">
            <ScrollArea className="h-[500px]">
              <pre className="p-4 bg-muted rounded-lg text-sm">
                {JSON.stringify(contract.abi, null, 2)}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
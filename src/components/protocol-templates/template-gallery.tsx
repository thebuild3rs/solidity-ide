import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitFork, Code, Coins, Building, Zap, Vote } from 'lucide-react';
import { uniswapV2Template } from '@/lib/templates/uniswap-v2';
import { aaveV3Template } from '@/lib/templates/aave-v3';
import { yieldFarmTemplate } from '@/lib/templates/yield-farm';
import { optionsTemplate } from '@/lib/templates/options';
import { governanceTemplate } from '@/lib/templates/governance';
import { flashLoanTemplate } from '@/lib/templates/flash-loan';
import type { ProtocolTemplate } from '@/lib/types';

interface TemplateGalleryProps {
  onSelectTemplate: (template: ProtocolTemplate) => void;
}

const TEMPLATES: ProtocolTemplate[] = [
  {
    id: 'uniswap-v2',
    name: 'Uniswap V2 DEX',
    description: 'Automated Market Maker (AMM) with constant product formula, flash swaps, and LP tokens.',
    category: 'DEX',
    files: uniswapV2Template,
    preview: { url: '#' }
  },
  {
    id: 'aave-v3',
    name: 'Aave V3 Lending',
    description: 'Decentralized lending protocol with multiple asset pools, variable/stable rates, and risk parameters.',
    category: 'Lending',
    files: aaveV3Template,
    preview: { url: '#' }
  },
  {
    id: 'yield-farm',
    name: 'Yield Farm',
    description: 'Staking and reward distribution protocol with time-based rewards and governance token.',
    category: 'Yield',
    files: yieldFarmTemplate,
    preview: { url: '#' }
  },
  {
    id: 'options',
    name: 'European Options',
    description: 'On-chain options protocol with oracle integration, collateralization, and settlement.',
    category: 'Other',
    files: optionsTemplate,
    preview: { url: '#' }
  },
  {
    id: 'governance',
    name: 'DAO Governance',
    description: 'Complete governance system with proposal voting, timelock, and token-based voting power.',
    category: 'Other',
    files: governanceTemplate,
    preview: { url: '#' }
  },
  {
    id: 'flash-loan',
    name: 'Flash Loans',
    description: 'Flash loan provider with fee system, multiple asset support, and example receiver contract.',
    category: 'Other',
    files: flashLoanTemplate,
    preview: { url: '#' }
  }
];

const CATEGORY_ICONS = {
  DEX: <Coins className="h-5 w-5" />,
  Lending: <Building className="h-5 w-5" />,
  Yield: <Zap className="h-5 w-5" />,
  Other: <Vote className="h-5 w-5" />
};

export function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ProtocolTemplate | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTemplates = activeCategory === 'all'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <div className="border-b px-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="dex">DEX</TabsTrigger>
            <TabsTrigger value="lending">Lending</TabsTrigger>
            <TabsTrigger value="yield">Yield</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="flex flex-col">
                <CardHeader className="flex-1">
                  <div className="flex items-center gap-2">
                    {CATEGORY_ICONS[template.category as keyof typeof CATEGORY_ICONS]}
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <CardDescription className="mt-2">{template.description}</CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col gap-2 border-t pt-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedTemplate(template)}>
                        <Code className="h-4 w-4 mr-2" />
                        View Code
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl h-[80vh]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          {CATEGORY_ICONS[template.category as keyof typeof CATEGORY_ICONS]}
                          {template.name}
                        </DialogTitle>
                        <DialogDescription>{template.description}</DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="mt-4 border rounded-lg p-4 h-full">
                        <pre className="text-sm font-mono">
                          {template.files.map((file) => (
                            <div key={file.id} className="mb-4">
                              <div className="font-bold text-primary mb-2">{file.path}</div>
                              <code className="block bg-muted p-4 rounded-lg overflow-x-auto">
                                {file.content}
                              </code>
                            </div>
                          ))}
                        </pre>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" className="w-full" onClick={() => onSelectTemplate(template)}>
                    <GitFork className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
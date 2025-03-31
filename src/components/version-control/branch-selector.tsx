import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { GitBranch, Plus } from 'lucide-react';
import type { BranchInfo } from '@/lib/types';

interface BranchSelectorProps {
  branches: BranchInfo[];
  currentBranch: string;
  onBranchChange: (branch: string) => void;
  onCreateBranch: () => void;
}

export function BranchSelector({
  branches,
  currentBranch,
  onBranchChange,
  onCreateBranch,
}: BranchSelectorProps) {
  return (
    <div className="flex items-center space-x-2 p-2 border-b">
      <GitBranch className="h-4 w-4 text-muted-foreground" />
      <Select value={currentBranch} onValueChange={onBranchChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select branch" />
        </SelectTrigger>
        <SelectContent>
          {branches.map((branch) => (
            <SelectItem key={branch.name} value={branch.name}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" size="icon" onClick={onCreateBranch}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
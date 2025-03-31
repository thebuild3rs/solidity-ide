import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { GitCommit, Plus, Minus, FileCode } from 'lucide-react';
import type { CommitInfo } from '@/lib/types';

interface CommitHistoryProps {
  commits: CommitInfo[];
  onSelectCommit: (commit: CommitInfo) => void;
}

export function CommitHistory({ commits, onSelectCommit }: CommitHistoryProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {commits.map((commit) => (
          <div
            key={commit.id}
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => onSelectCommit(commit)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <GitCommit className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{commit.message}</span>
              </div>
              <Badge variant="outline">
                {commit.id.substring(0, 7)}
              </Badge>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>
                {commit.author} committed{' '}
                {formatDistanceToNow(commit.timestamp, { addSuffix: true })}
              </p>
            </div>
            <div className="mt-2 flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <FileCode className="h-4 w-4" />
                <span>{commit.changes.modified} changed</span>
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <Plus className="h-4 w-4" />
                <span>{commit.changes.added}</span>
              </div>
              <div className="flex items-center space-x-1 text-red-600">
                <Minus className="h-4 w-4" />
                <span>{commit.changes.removed}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
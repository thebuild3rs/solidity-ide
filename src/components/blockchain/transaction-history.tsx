import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { TransactionInfo } from '@/lib/types';

interface TransactionHistoryProps {
  transactions: TransactionInfo[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const getStatusIcon = (status: TransactionInfo['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-4 p-4">
        {transactions.map((tx) => (
          <div key={tx.hash} className="p-4 border rounded-lg hover:bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(tx.status)}
                <span className="font-medium">
                  {tx.method || 'Transaction'}
                </span>
              </div>
              <Badge variant={tx.status === 'success' ? 'default' : 'secondary'}>
                {tx.status}
              </Badge>
            </div>

            <div className="mt-2 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <span className="truncate w-24">{tx.from}</span>
                <ArrowRight className="h-4 w-4" />
                <span className="truncate w-24">{tx.to}</span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatDistanceToNow(tx.timestamp, { addSuffix: true })}</span>
              <div className="flex items-center space-x-4">
                <span>{tx.value} ETH</span>
                <span>{tx.gasUsed} gas</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
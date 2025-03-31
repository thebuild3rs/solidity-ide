import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { User } from '@/lib/types';

interface PresenceProps {
  users: User[];
  currentUserId: string;
}

export function Presence({ users, currentUserId }: PresenceProps) {
  return (
    <div className="border-b p-2">
      <ScrollArea className="w-full">
        <div className="flex items-center space-x-2 p-1">
          {users.map((user) => (
            <TooltipProvider key={user.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Avatar className="h-8 w-8 border-2" style={{ borderColor: user.color }}>
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {user.id === currentUserId && (
                      <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center">
                        you
                      </Badge>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{user.name}</p>
                  {user.cursor && (
                    <p className="text-xs text-muted-foreground">
                      Line {user.cursor.line}, Column {user.cursor.column}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
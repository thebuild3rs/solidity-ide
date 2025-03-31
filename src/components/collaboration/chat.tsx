import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import type { ChatMessage, User } from '@/lib/types';

interface ChatProps {
  messages: ChatMessage[];
  users: User[];
  onSendMessage: (content: string) => void;
}

export function Chat({ messages, users, onSendMessage }: ChatProps) {
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current;
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 space-y-4">
          {messages.map((message) => {
            const user = users.find((u) => u.id === message.userId);
            const isSystem = message.type === 'system';
            
            return (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  isSystem ? 'bg-muted/50 p-3 rounded-lg' : ''
                }`}
              >
                {user && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback style={{ backgroundColor: user.color }}>
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-baseline space-x-2">
                    <span className="font-medium">
                      {user?.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <p className={`mt-1 text-sm whitespace-pre-wrap break-words ${
                    isSystem ? 'font-mono' : ''
                  }`}>
                    {message.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
}
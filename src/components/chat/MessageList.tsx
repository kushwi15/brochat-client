import { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '../../lib/utils';
import { Bot, User } from 'lucide-react';

export function MessageList() {
  const { messages, isTyping } = useChatStore();
  const { user } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Bot className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
        <p className="text-muted-foreground max-w-md">
          I'm an AI assistant. You can ask me questions, have me explain concepts, or help you write code.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-6 pb-20">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-4 w-full",
              msg.role === 'user' ? "flex-row-reverse" : "flex-row"
            )}
          >
            <Avatar className={cn(
              "w-8 h-8 flex-shrink-0 border-none",
              msg.role === 'user' ? "bg-primary" : "bg-muted"
            )}>
              {msg.role === 'user' ? (
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold border-none">
                  {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              ) : (
                <AvatarFallback className="bg-muted text-muted-foreground border-none">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              )}
            </Avatar>
            
            <div
              className={cn(
                "px-4 py-3 rounded-2xl max-w-[85%] text-sm",
                msg.role === 'user' 
                  ? "bg-primary text-primary-foreground rounded-tr-sm" 
                  : "bg-muted/50 rounded-tl-sm"
              )}
            >
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-4 w-full flex-row">
            <Avatar className="w-8 h-8 flex-shrink-0 border bg-muted">
              <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
            </Avatar>
            <div className="px-4 py-3 rounded-2xl bg-muted/50 rounded-tl-sm flex items-center gap-1 h-[44px]">
              <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
}

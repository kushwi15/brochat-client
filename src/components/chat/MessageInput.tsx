import { Send, Square } from 'lucide-react';
import { Button } from '../ui/button';
import { useChatStore } from '../../store/useChatStore';

import { useSendMessage } from '../../hooks/useSendMessage';

export function MessageInput() {
  const { 
    inputText, 
    setInputText, 
    isTyping, 
    setTyping
  } = useChatStore();
  
  const { sendMessage } = useSendMessage();

  const handleSend = async () => {
    await sendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative flex items-end w-full bg-muted/50 rounded-3xl border focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all p-2 gap-2">
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Send a message..."
        className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none border-0 focus-visible:ring-0 px-3 py-3 text-sm focus:outline-none"
        rows={1}
      />
      <div className="flex shrink-0 mb-1">
        {isTyping ? (
          <Button 
            size="icon" 
            variant="default" 
            className="w-10 h-10 rounded-full bg-primary"
            onClick={() => setTyping(false)} // Mock stop generation
            title="Stop generating"
          >
            <Square className="w-4 h-4 fill-current" />
          </Button>
        ) : (
          <Button 
            size="icon" 
            variant="default" 
            className="w-10 h-10 rounded-full"
            disabled={!inputText.trim()}
            onClick={handleSend}
          >
            <Send className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

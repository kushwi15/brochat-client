import { useState } from 'react';
import { Send, Square } from 'lucide-react';
import { Button } from '../ui/button';
import { useChatStore } from '../../store/useChatStore';

export function MessageInput() {
  const [input, setInput] = useState('');
  const { addMessage, isTyping, setTyping } = useChatStore();

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    addMessage(userMessage);
    setInput('');
    setTyping(true);

    // Mock API call / SignalR send
    // In a real app, you would send this to the backend
    // await api.post('/chat/message', { conversationId: activeConversationId, content: userMessage.content });

    // Mocking a response for demonstration if SignalR is not connected
    setTimeout(() => {
      const aiMessageId = (Date.now() + 1).toString();
      addMessage({
        id: aiMessageId,
        role: 'ai',
        content: '',
        createdAt: new Date().toISOString(),
      });
      
      const responseText = "This is a mocked streaming response from the AI. In a real environment, this would come through SignalR!";
      let i = 0;
      
      const interval = setInterval(() => {
        if (i < responseText.length) {
          useChatStore.getState().updateMessageStream(aiMessageId, responseText.charAt(i));
          i++;
        } else {
          clearInterval(interval);
          setTyping(false);
        }
      }, 30);
    }, 1000);
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
        value={input}
        onChange={(e) => setInput(e.target.value)}
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
            disabled={!input.trim()}
            onClick={handleSend}
          >
            <Send className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

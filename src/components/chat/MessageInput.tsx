import { useState } from 'react';
import { Send, Square } from 'lucide-react';
import { Button } from '../ui/button';
import { useChatStore } from '../../store/useChatStore';
import { chatApi } from '../../services/api';
import { signalRService } from '../../services/signalrService';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export function MessageInput() {
  const [input, setInput] = useState('');
  const { addMessage, isTyping, setTyping, activeConversationId, setActiveConversation, setConversations, conversations } = useChatStore();
  const { isAuthenticated, initializeGuest } = useAuthStore();
  const navigate = useNavigate();

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

    try {
      if (isAuthenticated) {
        let currentConvId = activeConversationId;

        // If no active conversation, create one
        if (!currentConvId) {
          const title = input.trim().substring(0, 30) + (input.trim().length > 30 ? '...' : '');
          const response = await chatApi.createConversation(title);
          const newConv = response.data;
          
          currentConvId = newConv.id;
          setConversations([newConv, ...conversations]);
          setActiveConversation(currentConvId);
          navigate(`/c/${currentConvId}`);
        }

        if (!currentConvId) return;

        // Send via SignalR (Authenticated)
        await signalRService.sendMessage(currentConvId, input.trim());
      } else {
        // Guest Mode
        initializeGuest();
        const currentGuestId = useAuthStore.getState().guestId;
        if (!currentGuestId) return;

        await signalRService.sendGuestMessage(currentGuestId, input.trim());
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setTyping(false);
      // Optional: Add error message to chat or toast
    }
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

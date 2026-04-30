import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useChatStore } from '../../store/useChatStore';
import { MessageList } from '../../components/chat/MessageList';
import { MessageInput } from '../../components/chat/MessageInput';
import { signalRService } from '../../services/signalrService';

export default function ChatPage() {
  const { conversationId } = useParams();
  const { setActiveConversation, setMessages } = useChatStore();

  useEffect(() => {
    // Start SignalR connection when chat page mounts
    signalRService.startConnection();

    return () => {
      signalRService.stopConnection();
    };
  }, []);

  useEffect(() => {
    if (conversationId) {
      setActiveConversation(conversationId);
      // Mock loading messages for the conversation
      setMessages([
        { id: 'm1', role: 'user', content: 'Hello! Can you help me with React?', createdAt: new Date().toISOString() },
        { id: 'm2', role: 'ai', content: 'Of course! I can help you with React. What do you need to know?', createdAt: new Date().toISOString() },
      ]);
    } else {
      setActiveConversation(null);
      setMessages([]);
    }
  }, [conversationId, setActiveConversation, setMessages]);

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative">
        <MessageList />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t">
        <div className="max-w-3xl mx-auto">
          <MessageInput />
          <div className="text-center mt-2">
            <span className="text-xs text-muted-foreground">
              AI can make mistakes. Consider verifying important information.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

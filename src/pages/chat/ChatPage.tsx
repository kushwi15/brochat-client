import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useChatStore } from '../../store/useChatStore';
import { MessageList } from '../../components/chat/MessageList';
import { MessageInput } from '../../components/chat/MessageInput';
import { Preloader } from '../../components/ui/Preloader';

import { chatApi } from '../../services/api';
import type { Message } from '../../store/useChatStore';

export default function ChatPage() {
  const { conversationId } = useParams();
  const { setActiveConversation, setMessages, isLoading, setLoading } = useChatStore();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) {
        setActiveConversation(null);
        setMessages([]);
        return;
      }

      // Read the fresh flag directly from the store (not from deps) to avoid
      // the re-run loop: setting it to null would trigger this effect again.
      const { freshConversationId, setFreshConversationId } = useChatStore.getState();
      if (freshConversationId === conversationId) {
        // This conversation was just created — messages are already in the store.
        // Skip the backend fetch so we don't wipe the optimistic user message.
        setFreshConversationId(null);
        setActiveConversation(conversationId);
        return;
      }

      setLoading(true);
      setActiveConversation(conversationId);
      try {
        const response = await chatApi.getMessages(conversationId);
        const mappedMessages: Message[] = response.data.map((m: any) => ({
          id: m.id,
          role: m.role === 0 ? 'user' : 'ai',
          content: m.content,
          createdAt: m.timestamp
        }));
        setMessages(mappedMessages);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  // freshConversationId intentionally NOT in deps — we read it via getState()
  // to prevent re-running when it is cleared inside this same effect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, setActiveConversation, setMessages, setLoading]);



  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative">
        {isLoading && <Preloader />}
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

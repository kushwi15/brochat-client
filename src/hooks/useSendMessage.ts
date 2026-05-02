import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { chatApi } from '../services/api';
import { signalRService } from '../services/signalrService';
import { useNavigate } from 'react-router-dom';

export function useSendMessage() {
  const {
    inputText,
    setInputText,
    addMessage,
    isTyping,
    setTyping,
    setActiveConversation,
    setConversations,
    setFreshConversationId
  } = useChatStore();


  const { isAuthenticated, initializeGuest } = useAuthStore();
  const navigate = useNavigate();

  const sendMessage = async (content?: string) => {
    const textToSend = content || inputText;
    if (!textToSend.trim() || isTyping) return;

    // Use the latest conversation ID from the store
    let currentConvId = useChatStore.getState().activeConversationId;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: textToSend.trim(),
      createdAt: new Date().toISOString(),
    };

    addMessage(userMessage);
    if (!content) setInputText(''); // Clear global input if it was used
    setTyping(true);

    try {
      if (isAuthenticated) {
        if (!currentConvId) {
          const title = textToSend.trim().substring(0, 30) + (textToSend.trim().length > 30 ? '...' : '');
          const response = await chatApi.createConversation(title);
          const newConv = response.data;

          currentConvId = newConv.id;

          // Add to current list and set active
          setConversations(prev => [newConv, ...prev]);
          setActiveConversation(currentConvId);

          // Mark as fresh so ChatPage skips the backend fetch
          // (which would overwrite the optimistic user message)
          setFreshConversationId(currentConvId);

          // Push to the new route
          navigate(`/c/${currentConvId}`, { replace: true });

          // Re-fetch to ensure sync
          const convsRes = await chatApi.getConversations();
          setConversations(convsRes.data);

        }

        if (!currentConvId) return;
        await signalRService.sendMessage(currentConvId, textToSend.trim());
      } else {
        initializeGuest();
        const currentGuestId = useAuthStore.getState().guestId;
        if (!currentGuestId) return;
        await signalRService.sendGuestMessage(currentGuestId, textToSend.trim());
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setTyping(false);
    }
  };

  return { sendMessage };
}



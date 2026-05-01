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
    activeConversationId, 
    setActiveConversation, 
    setConversations, 
    conversations 
  } = useChatStore();
  
  const { isAuthenticated, initializeGuest } = useAuthStore();
  const navigate = useNavigate();

  const sendMessage = async (content?: string) => {
    const textToSend = content || inputText;
    if (!textToSend.trim() || isTyping) return;

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
        let currentConvId = activeConversationId;

        if (!currentConvId) {
          const title = textToSend.trim().substring(0, 30) + (textToSend.trim().length > 30 ? '...' : '');
          const response = await chatApi.createConversation(title);
          const newConv = response.data;
          
          currentConvId = newConv.id;
          setConversations([newConv, ...conversations]);
          setActiveConversation(currentConvId);
          navigate(`/c/${currentConvId}`);
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

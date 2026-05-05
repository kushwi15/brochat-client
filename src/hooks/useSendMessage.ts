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

  const sendMessage = async (content?: string, attachments?: any[]) => {
    const textToSend = content || inputText;
    const hasAttachments = attachments && attachments.length > 0;
    if ((!textToSend.trim() && !hasAttachments) || isTyping) return;

    setTyping(true);

    let finalAttachments: any[] = [];

    // 1. Upload files to Cloudinary if they are local
    if (hasAttachments) {
      try {
        finalAttachments = await Promise.all((attachments || []).map(async (attr) => {
          if (attr.file) {
            // It's a local file, upload it
            const response = await chatApi.uploadFile(attr.file);
            return {
              url: response.data.url,
              type: attr.type,
              name: attr.name
            };
          }
          return attr; // Already uploaded or just a URL
        }));
      } catch (error) {
        console.error('Failed to upload files to Cloudinary:', error);
        setTyping(false);
        return;
      }
    }

    // Use the latest conversation ID from the store
    let currentConvId = useChatStore.getState().activeConversationId;

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: textToSend.trim(),
      attachments: finalAttachments,
      createdAt: new Date().toISOString(),
    };

    addMessage(userMessage);
    if (!content) setInputText(''); // Clear global input if it was used

    try {
      if (isAuthenticated) {
        if (!currentConvId) {
          const title = textToSend.trim() 
            ? (textToSend.trim().substring(0, 30) + (textToSend.trim().length > 30 ? '...' : ''))
            : (finalAttachments.length > 0 ? "Attached Files" : "New Chat");
            
          const response = await chatApi.createConversation(title);
          const newConv = response.data;

          currentConvId = newConv.id;

          // Add to current list and set active
          setConversations(prev => [newConv, ...prev]);
          setActiveConversation(currentConvId);

          // Mark as fresh so ChatPage skips the backend fetch
          setFreshConversationId(currentConvId);

          // Push to the new route
          navigate(`/c/${currentConvId}`, { replace: true });

          // Re-fetch to ensure sync
          const convsRes = await chatApi.getConversations();
          setConversations(convsRes.data);
        }

        if (!currentConvId) return;
        await signalRService.sendMessage(currentConvId, textToSend.trim(), finalAttachments);
      } else {
        initializeGuest();
        const currentGuestId = useAuthStore.getState().guestId;
        if (!currentGuestId) return;
        await signalRService.sendGuestMessage(currentGuestId, textToSend.trim(), finalAttachments);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setTyping(false);
    }
  };

  return { sendMessage };
}



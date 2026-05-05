import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useChatStore } from '../../store/useChatStore';
import { MessageList } from '../../components/chat/MessageList';
import { MessageInput } from '../../components/chat/MessageInput';
import { Preloader } from '../../components/ui/Preloader';
import { Upload, Loader2 } from 'lucide-react';

import { chatApi } from '../../services/api';
import type { Message } from '../../store/useChatStore';

export default function ChatPage() {
  const { conversationId } = useParams();
  const { setActiveConversation, setMessages, isLoading, setLoading, setSelectedFiles } = useChatStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const dragCounter = useRef(0);

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
          attachments: m.attachments || [],
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

  const addFileLocally = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    const newAttachment = {
      url: previewUrl,
      type: file.type,
      name: file.name,
      file: file
    };
    setSelectedFiles(prev => [...prev, newAttachment]);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      addFileLocally(file);
    }
  };



  return (
    <div 
      className="flex flex-col h-full bg-background relative"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-primary/10 border-4 border-dashed border-primary m-4 rounded-3xl flex flex-col items-center justify-center backdrop-blur-md transition-all duration-300 pointer-events-none">
          <div className="bg-primary text-primary-foreground p-8 rounded-full shadow-2xl mb-4 animate-bounce">
            <Upload className="w-12 h-12" />
          </div>
          <h2 className="text-primary font-bold text-3xl">Drop to upload BRO!</h2>
          <p className="text-muted-foreground mt-2">Any file, any size, anywhere.</p>
        </div>
      )}

      {isUploading && (
        <div className="absolute inset-0 z-[60] bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <span className="font-medium">Uploading to Cloudinary...</span>
        </div>
      )}

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

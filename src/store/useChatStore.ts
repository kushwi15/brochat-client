import { create } from 'zustand';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'ai';
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  isTyping: boolean;
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessageStream: (id: string, content: string) => void;
  setTyping: (isTyping: boolean) => void;
  deleteConversation: (id: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isTyping: false,
  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateMessageStream: (id, content) =>
    set((state) => {
      const messageExists = state.messages.some((m) => m.id === id);
      if (!messageExists) {
        const newMessage: Message = {
          id,
          content,
          role: 'ai',
          createdAt: new Date().toISOString(),
        };
        return { messages: [...state.messages, newMessage] };
      }
      return {
        messages: state.messages.map((m) =>
          m.id === id ? { ...m, content: m.content + content } : m
        ),
      };
    }),
  setTyping: (isTyping) => set({ isTyping }),
  deleteConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
      messages: state.activeConversationId === id ? [] : state.messages,
    })),
}));

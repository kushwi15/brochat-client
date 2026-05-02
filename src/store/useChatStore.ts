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
  isLoading: boolean;
  setConversations: (conversations: Conversation[] | ((prev: Conversation[]) => Conversation[])) => void;
  setActiveConversation: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  setLoading: (isLoading: boolean) => void;
  addMessage: (message: Message) => void;
  updateMessageStream: (id: string, content: string) => void;
  setTyping: (isTyping: boolean) => void;
  deleteConversation: (id: string) => void;
  clearChat: () => void;
  inputText: string;
  setInputText: (text: string) => void;
  isVoiceMode: boolean;
  setIsVoiceMode: (isVoiceMode: boolean) => void;
  // Tracks a brand-new conversation so ChatPage skips the backend fetch
  // (avoids wiping the optimistic user message before AI responds)
  freshConversationId: string | null;
  setFreshConversationId: (id: string | null) => void;
}


export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isTyping: false,
  isLoading: false,
  inputText: '',
  isVoiceMode: false,
  freshConversationId: null,
  setIsVoiceMode: (isVoiceMode) => set({ isVoiceMode }),
  setFreshConversationId: (id) => set({ freshConversationId: id }),
  setConversations: (update) => 
    set((state) => ({ 
      conversations: typeof update === 'function' ? update(state.conversations) : update 
    })),

  setActiveConversation: (id) => set({ activeConversationId: id }),
  setMessages: (messages) => set({ messages }),
  setLoading: (isLoading) => set({ isLoading }),
  setInputText: (inputText) => set({ inputText }),
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
  setTyping: (isTyping: boolean) => set({ isTyping }),
  deleteConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
      messages: state.activeConversationId === id ? [] : state.messages,
    })),
  clearChat: () => set({ conversations: [], activeConversationId: null, messages: [], isTyping: false, isLoading: false, inputText: '' }),
}));

import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { useAppStore } from '../store/useAppStore';
import { toast } from 'sonner';

const HUB_URL = import.meta.env.VITE_HUB_URL || 'http://localhost:5110/hubs/chat';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private startPromise: Promise<void> | null = null;

  public async startConnection() {
    // If already connected or starting, do nothing
    if (this.connection?.state === signalR.HubConnectionState.Connected || this.startPromise) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => useAuthStore.getState().token || "",
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on('ReceiveMessageChunk', (messageId: string, chunk: string) => {
      useChatStore.getState().updateMessageStream(messageId, chunk);
    });

    this.connection.on('MessageComplete', (messageId: string) => {
      console.log('Streaming complete for message:', messageId);
      const state = useChatStore.getState();
      state.setTyping(false);
      
      // If voice response is enabled, speak the message
      if (state.isVoiceMode) {
        const message = state.messages.find(m => m.id === messageId);
        if (message && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(message.content);
          
          const speakWithMessage = () => {
             const voices = window.speechSynthesis.getVoices();
             // JARVIS style: Sophisticated British Male
             const preferredVoice = voices.find(v => v.name.includes('Google UK English Male')) || 
                                    voices.find(v => v.name.includes('UK English')) ||
                                    voices.find(v => v.name.includes('George')) ||
                                    voices.find(v => v.name.includes('Hazel')) || // Sometimes Hazel sounds more "AI"
                                    voices[0];
             
             if (preferredVoice) utterance.voice = preferredVoice;
             utterance.pitch = 1.1; // Slightly higher for that refined AI tone
             utterance.rate = 1.1;  // Slightly faster for Jarvis-like efficiency
             window.speechSynthesis.speak(utterance);
          };


          if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = speakWithMessage;
          } else {
            speakWithMessage();
          }
        }
      }
    });




    this.connection.on('Error', (message: string) => {
      console.error('Backend Error:', message);
      if (message.toLowerCase().includes('guest limit reached')) {
        useAppStore.getState().setGuestLimitModalOpen(true);
      } else {
        toast.error(message);
      }
      useChatStore.getState().setTyping(false);
    });

    this.startPromise = this.connection.start()
      .then(() => {
        console.log('SignalR Connected.');
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          console.log('SignalR Connection aborted (intentional).');
        } else {
          console.error('SignalR Connection Error: ', err);
          setTimeout(() => this.startConnection(), 5000);
        }
      })
      .finally(() => {
        this.startPromise = null;
      });

    return this.startPromise;
  }

  public async stopConnection() {
    if (this.connection) {
      const conn = this.connection;
      this.connection = null; // Clear immediately to prevent re-use
      try {
        await conn.stop();
        console.log('SignalR Disconnected.');
      } catch (err) {
        console.error('Error stopping SignalR connection:', err);
      }
    }
  }

  public async sendMessage(conversationId: string, content: string) {
    if (!this.connection) {
      await this.startConnection();
    }
    
    // Wait for connection to be in 'Connected' state if it's still connecting
    if (this.connection?.state === signalR.HubConnectionState.Connecting) {
      await this.startPromise;
    }

    if (this.connection?.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR connection not established');
    }

    await this.connection.invoke('SendMessage', conversationId, content);
  }

  public async sendGuestMessage(guestId: string, content: string) {
    if (!this.connection) {
      await this.startConnection();
    }
    
    if (this.connection?.state === signalR.HubConnectionState.Connecting) {
      await this.startPromise;
    }

    if (this.connection?.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR connection not established');
    }

    await this.connection.invoke('SendGuestMessage', guestId, content);
  }
  public async cancelGeneration() {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('CancelGeneration');
      } catch (err) {
        console.error('Error cancelling generation:', err);
      }
    }
  }

  public async regenerateResponse(conversationId: string) {
    if (!this.connection) {
      await this.startConnection();
    }
    
    if (this.connection?.state === signalR.HubConnectionState.Connecting) {
      await this.startPromise;
    }

    if (this.connection?.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR connection not established');
    }

    await this.connection.invoke('RegenerateResponse', conversationId);
  }
}

export const signalRService = new SignalRService();

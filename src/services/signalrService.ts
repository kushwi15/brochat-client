import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';

const HUB_URL = import.meta.env.VITE_HUB_URL || 'http://localhost:5110/hubs/chat';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private startPromise: Promise<void> | null = null;

  public async startConnection() {
    // If already connected or starting, do nothing
    if (this.connection?.state === signalR.HubConnectionState.Connected || this.startPromise) {
      return;
    }

    const token = useAuthStore.getState().token;
    if (!token) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on('ReceiveMessageChunk', (messageId: string, chunk: string) => {
      useChatStore.getState().updateMessageStream(messageId, chunk);
    });

    this.connection.on('MessageComplete', (messageId: string) => {
      console.log('Streaming complete for message:', messageId);
      useChatStore.getState().setTyping(false);
    });

    this.connection.on('Error', (message: string) => {
      console.error('Backend Error:', message);
      // You could also trigger a toast here if you import toast
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
}

export const signalRService = new SignalRService();

import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';

const HUB_URL = import.meta.env.VITE_HUB_URL || 'http://localhost:5000/chathub';

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  public async startConnection() {
    const token = useAuthStore.getState().token;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => token || '',
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on('ReceiveMessageChunk', (messageId: string, chunk: string) => {
      useChatStore.getState().updateMessageStream(messageId, chunk);
    });

    this.connection.on('MessageComplete', () => {
      useChatStore.getState().setTyping(false);
    });

    try {
      await this.connection.start();
      console.log('SignalR Connected.');
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  public async stopConnection() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }
}

export const signalRService = new SignalRService();

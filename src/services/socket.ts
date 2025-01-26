import { io, Socket } from 'socket.io-client';
import { CodingChallenge } from '@/types';
import { toast } from 'react-hot-toast';

interface PlayerSolution {
  playerNumber: 1 | 2;
  code: string;
  timeElapsed: number;
  isCorrect: boolean;
}

interface PlayerJoinData {
  roomId: string;
  playerNumber: number;
  playerName: string;
}

interface PlayersUpdateData {
  [playerNumber: string]: {
    name: string;
    connected: boolean;
  };
}

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  connect(roomId: string) {
    try {
      this.socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3002', {
        query: { roomId },
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 10000,
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket');
        this.reconnectAttempts = 0;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          toast.error('Failed to connect to server. Please refresh the page.');
        }
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket');
        toast.error('Connection lost. Attempting to reconnect...');
      });
    } catch (error) {
      console.error('Socket connection error:', error);
      toast.error('Failed to connect to server');
    }
  }

  subscribeToChallenge(callback: (challenge: any) => void) {
    if (!this.socket) return;
    this.socket.on('challenge', callback);
  }

  subscribeToPlayerUpdate(callback: (players: any) => void) {
    if (!this.socket) return;
    this.socket.on('playerUpdate', callback);
  }

  submitSolution(playerNumber: 1 | 2, code: string, timeElapsed: number, isCorrect: boolean) {
    if (!this.socket) return;
    this.socket.emit('submitSolution', {
      playerNumber,
      code,
      timeElapsed,
      isCorrect
    });
  }

  subscribeToOpponentSolution(callback: (solution: PlayerSolution) => void) {
    if (!this.socket) return;
    this.socket.on('opponentSolution', callback);
  }

  emitChallenge(challenge: CodingChallenge) {
    if (this.socket) {
      this.socket.emit('challenge', challenge);
    }
  }

  emitPlayerJoin(data: PlayerJoinData) {
    if (!this.socket || !data.roomId) return;
    this.socket.emit('playerJoin', data);
  }

  subscribeToPlayersUpdate(callback: (players: PlayersUpdateData) => void) {
    if (!this.socket) return;
    this.socket.on('playersUpdate', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }
}

export const socketService = new SocketService(); 
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
    ready?: boolean;
  };
}

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  connect(roomId: string) {
    try {
      if (this.socket) {
        this.socket.disconnect();
      }

      this.socket = io('http://localhost:3002', {
        query: { roomId },
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 10000,
        transports: ['polling', 'websocket'],
        forceNew: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket');
        this.reconnectAttempts = 0;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          toast.error('Failed to connect to server. Please try again.');
          this.disconnect();
        }
      });

      return new Promise((resolve, reject) => {
        this.socket?.on('connect', () => resolve(true));
        this.socket?.on('connect_error', (error) => reject(error));
      });
    } catch (error) {
      console.error('Socket connection error:', error);
      toast.error('Failed to connect to server');
      throw error;
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
    console.log('Emitting solution:', { playerNumber, code, timeElapsed, isCorrect });
    this.socket.emit('submitSolution', {
      playerNumber,
      code,
      timeElapsed,
      isCorrect
    });
  }

  subscribeToOpponentSolution(callback: (solution: PlayerSolution) => void) {
    if (!this.socket) return;
    this.socket.on('opponentSolution', (solution) => {
      console.log('Received opponent solution:', solution);
      callback(solution);
    });
  }

  emitChallenge(challenge: CodingChallenge) {
    if (this.socket) {
      this.socket.emit('challenge', challenge);
    }
  }

  emitPlayerJoin(data: PlayerJoinData) {
    if (!this.socket || !data.roomId) {
      console.error('Socket not connected or missing roomId');
      return;
    }
    
    console.log('Current socket state:', {
      connected: this.socket.connected,
      roomId: data.roomId
    });

    this.socket.emit('playerJoin', {
      roomId: data.roomId,
      playerNumber: data.playerNumber,
      playerName: data.playerName
    });
  }

  subscribeToPlayersUpdate(callback: (players: PlayersUpdateData) => void) {
    if (!this.socket) return;
    
    this.socket.on('playersUpdate', (players) => {
      console.log('Received players update:', players);
      const formattedPlayers: PlayersUpdateData = {
        '1': players['1'] || { name: '', connected: false },
        '2': players['2'] || { name: '', connected: false }
      };
      callback(formattedPlayers);
    });
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

  emitGameStart(roomId: string, startTime: number) {
    if (!this.socket) return;
    console.log('Emitting game start:', { roomId, startTime });
    this.socket.emit('gameStart', { roomId, startTime });
  }

  subscribeToGameStart(callback: (startTime: number) => void) {
    if (!this.socket) return;
    this.socket.on('gameStart', (data) => {
      console.log('Received game start:', data);
      if (data && typeof data.startTime === 'number') {
        callback(data.startTime);
      }
    });
  }

  emitPlayerReady(roomId: string, playerNumber: number) {
    if (!this.socket) return;
    this.socket.emit('playerReady', { roomId, playerNumber });
  }

  emitBattleComplete(roomId: string, data: { winner: any; solutions: any }) {
    if (!this.socket) return;
    this.socket.emit('battleComplete', { roomId, ...data });
  }

  subscribeToBattleComplete(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('battleComplete', callback);
  }

  emitPaymentComplete(roomId: string, playerNumber: number) {
    if (!this.socket) return;
    this.socket.emit('paymentComplete', { roomId, playerNumber });
  }

  subscribeToPaymentComplete(callback: (data: { playerNumber: number }) => void) {
    if (!this.socket) return;
    this.socket.on('paymentComplete', callback);
  }
}

export const socketService = new SocketService(); 
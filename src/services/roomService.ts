import { socketService } from './socket';

interface RoomPlayer {
  name: string;
  walletAddress: string;
  language: string;
}

export class RoomService {
  static async createRoom(roomId: string, player: RoomPlayer) {
    try {
      await socketService.connect(roomId);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      socketService.emitPlayerJoin({
        roomId,
        playerNumber: 1,
        playerName: player.name
      });

      return roomId;
    } catch (error) {
      console.error('Failed to create room:', error);
      socketService.disconnect();
      throw error;
    }
  }

  static async joinRoom(roomId: string, player: RoomPlayer) {
    try {
      await socketService.connect(roomId);
      
      // Ensure connection is established before emitting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      socketService.emitPlayerJoin({
        roomId,
        playerNumber: 2,
        playerName: player.name
      });

      return true;
    } catch (error) {
      console.error('Failed to join room:', error);
      socketService.disconnect();
      throw error;
    }
  }
} 
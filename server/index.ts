import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['polling', 'websocket'],
  pingTimeout: 60000,
  pingInterval: 25000
});

interface PlayerData {
  name: string;
  connected: boolean;
  code?: string;
  timeElapsed?: number;
  isCorrect?: boolean;
  socketId?: string;
  ready?: boolean;
  hasPaid?: boolean;
}

interface RoomData {
  [roomId: string]: {
    players: {
      [playerNumber: string]: PlayerData;
    };
    challenge?: any;
    battleComplete?: boolean;
    winner?: string;
    solutions?: any;
  };
}

const rooms = new Map();

io.on('connection', (socket) => {
  const roomId = socket.handshake.query.roomId as string;
  
  if (!roomId) {
    console.error("Room ID missing");
    socket.disconnect();
    return;
  }

  console.log(`Client connected to room ${roomId}`);

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  if (!rooms.has(roomId)) {
    rooms.set(roomId, {});
  }

  // Join the room
  socket.join(roomId);

  // Handle player joining
  socket.on('playerJoin', (data: { playerNumber: number; playerName: string }) => {
    const { playerNumber, playerName } = data;
    console.log(`Player ${playerName} (${playerNumber}) joining room ${roomId}`);
    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {});
    }
    
    const room = rooms.get(roomId);
    
    // Update player data
    room[playerNumber] = {
      name: playerName,
      connected: true,
      socketId: socket.id,
      ready: false
    };

    console.log('Room state after join:', room);

    // Broadcast updated players to the room
    io.to(roomId).emit('playersUpdate', room);

    // Check if both players are connected to start the game
    if (Object.keys(room).length === 2) {
      io.to(roomId).emit('startGame', room.challenge);
    }
  });

  // Handle challenge emission
  socket.on('challenge', (challenge) => {
    rooms.get(roomId).challenge = challenge;
    io.to(roomId).emit('challenge', challenge);
  });

  // Handle solution submission
  socket.on('submitSolution', (data) => {
    const { playerNumber, code, timeElapsed, isCorrect } = data;
    console.log('Received solution:', { roomId, playerNumber, timeElapsed, isCorrect });
    
    const room = rooms.get(roomId);
    if (room && room[playerNumber]) {
      room[playerNumber].code = code;
      room[playerNumber].timeElapsed = timeElapsed;
      room[playerNumber].isCorrect = isCorrect;
      
      // Broadcast to all players in the room
      io.to(roomId).emit('opponentSolution', {
        playerNumber,
        playerName: room[playerNumber].name,
        code,
        timeElapsed,
        isCorrect
      });
    }
  });

  socket.on('gameStart', ({ roomId, startTime }) => {
    console.log('Game starting:', { roomId, startTime });
    // Broadcast to all players in the room
    io.to(roomId).emit('gameStart', { startTime });
  });

  socket.on('disconnect', () => {
    const room = rooms.get(roomId);
    if (room) {
      // Find and update the disconnected player
      Object.entries(room).forEach(([playerNum, player]: [string, any]) => {
        if (player.socketId === socket.id) {
          room[playerNum].connected = false;
          // Broadcast the update
          io.to(roomId).emit('playersUpdate', room);
        }
      });
    }
  });

  socket.on('playerReady', ({ roomId, playerNumber }) => {
    const room = rooms.get(roomId);
    if (room && room[playerNumber]) {
      room[playerNumber].ready = true;
      io.to(roomId).emit('playersUpdate', room);
    }
  });

  socket.on('battleComplete', ({ roomId, winner, solutions }) => {
    console.log('Battle complete:', { roomId, winner });
    
    // Store result in room
    const room = rooms.get(roomId);
    if (room) {
      room.battleComplete = true;
      room.winner = winner;
      room.solutions = solutions;
    }
    
    // Broadcast to all players in the room
    io.to(roomId).emit('battleComplete', { 
      winner, 
      solutions,
      timestamp: Date.now() // Add timestamp to ensure clients update
    });
  });

  // Add payment handling
  socket.on('paymentComplete', ({ roomId, playerNumber }) => {
    console.log('Payment complete:', { roomId, playerNumber });
    
    const room = rooms.get(roomId);
    if (room && room[playerNumber]) {
      room[playerNumber].hasPaid = true;
      // Broadcast payment status to room
      io.to(roomId).emit('paymentComplete', { playerNumber });
    }
  });
});

// Handle port conflicts
const PORT = process.env.PORT || 3002;

httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

// Handle errors gracefully
httpServer.on('error', (error) => {
  console.error('Server error:', error);
});

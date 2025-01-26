import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Update to match your frontend port
    methods: ["GET", "POST"],
  },
});

interface PlayerData {
  name: string;
  connected: boolean;
  code?: string;
  timeElapsed?: number;
  isCorrect?: boolean;
}

interface RoomData {
  [roomId: string]: {
    players: {
      [playerNumber: string]: PlayerData;
    };
    challenge?: any;
  };
}

const rooms: RoomData = {};

io.on('connection', (socket) => {
  const roomId = socket.handshake.query.roomId as string;
  
  if (!roomId) {
    console.error("Room ID missing");
    socket.disconnect();
    return;
  }

  if (!rooms[roomId]) {
    rooms[roomId] = { players: {} };
  }

  // Join the room
  socket.join(roomId);

  // Handle player joining
  socket.on('playerJoin', (data: { playerNumber: number; playerName: string }) => {
    const { playerNumber, playerName } = data;
    
    rooms[roomId].players[playerNumber] = {
      name: playerName,
      connected: true
    };

    // Broadcast updated player list to ALL in room
    io.in(roomId).emit('playersUpdate', rooms[roomId].players);

    // Check if both players are connected to start the game
    if (Object.keys(rooms[roomId].players).length === 2) {
      io.to(roomId).emit('startGame', rooms[roomId].challenge);
    }
  });

  // Handle challenge emission
  socket.on('challenge', (challenge) => {
    rooms[roomId].challenge = challenge;
    socket.to(roomId).emit('challenge', challenge);
  });

  // Handle solution submission
  socket.on('submitSolution', (data) => {
    const { playerNumber, code, timeElapsed, isCorrect } = data;
    const playerName = rooms[roomId].players[playerNumber]?.name;
    
    if (rooms[roomId].players[playerNumber]) {
      rooms[roomId].players[playerNumber].code = code;
      rooms[roomId].players[playerNumber].timeElapsed = timeElapsed;
      rooms[roomId].players[playerNumber].isCorrect = isCorrect;
    }

    // Emit to other players with name
    socket.to(roomId).emit('opponentSolution', {
      playerNumber,
      playerName,
      code,
      timeElapsed,
      isCorrect
    });
  });

  socket.on('disconnect', () => {
    // Handle player disconnection
    Object.entries(rooms[roomId]?.players || {}).forEach(([playerNum, player]) => {
      if (player.connected) {
        rooms[roomId].players[playerNum].connected = false;
        io.to(roomId).emit('playersUpdate', rooms[roomId].players);
      }
    });
  });
});

// Handle port conflicts
const PORT = process.env.PORT || 3002;

httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

// Handle errors gracefully
httpServer.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Retrying with a new port...`);
    setTimeout(() => {
      httpServer.close();
      const newPort = +PORT + 1; // Increment the port
      httpServer.listen(newPort, () => {
        console.log(`WebSocket server restarted on port ${newPort}`);
      });
    }, 1000);
  } else {
    throw err;
  }
});

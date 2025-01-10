import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

export const configureSocketServer = (server: NetServer) => {
  const io = new SocketIOServer(server, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const rooms = new Map();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      rooms.set(socket.id, roomId);
      socket.to(roomId).emit('user-connected', socket.id);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('signal', ({ userId, signal }: { userId: string; signal: any }) => {
      io.to(userId).emit('signal', { userId: socket.id, signal });
      console.log(`Signal from ${socket.id} to ${userId}`);
    });

    socket.on('disconnect', () => {
      const roomId = rooms.get(socket.id);
      if (roomId) {
        socket.to(roomId).emit('user-disconnected', socket.id);
        rooms.delete(socket.id);
        console.log(`User ${socket.id} disconnected from room ${roomId}`);
      }
    });
  });

  return io;
};

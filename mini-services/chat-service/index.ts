import { Server } from 'socket.io';

const PORT = 3003;

const io = new Server(PORT, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

interface OnlineUser {
  userId: string;
  socketId: string;
}

const onlineUsers: Map<string, string> = new Map();

io.on('connection', (socket) => {
  console.log(`[chat-service] Client connected: ${socket.id}`);

  // Register user as online
  socket.on('register', (userId: string) => {
    onlineUsers.set(userId, socket.id);
    console.log(`[chat-service] User registered: ${userId} -> ${socket.id}`);
    // Broadcast online status
    io.emit('user-online', userId);
  });

  // Handle sending messages
  socket.on('send-message', (data: {
    senderId: string;
    receiverId: string;
    organizerId: string;
    message: string;
    tempId?: string;
  }) => {
    console.log(`[chat-service] Message from ${data.senderId} to ${data.receiverId}: ${data.message.slice(0, 50)}`);
    
    // Emit to receiver if online
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('new-message', {
        ...data,
        createdAt: new Date().toISOString(),
      });
    }

    // Acknowledge back to sender
    socket.emit('message-sent', {
      tempId: data.tempId,
      createdAt: new Date().toISOString(),
    });
  });

  // Handle typing indicator
  socket.on('typing', (data: { senderId: string; receiverId: string }) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user-typing', { senderId: data.senderId });
    }
  });

  // Handle stop typing
  socket.on('stop-typing', (data: { senderId: string; receiverId: string }) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user-stop-typing', { senderId: data.senderId });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    // Remove user from online list
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit('user-offline', userId);
        console.log(`[chat-service] User disconnected: ${userId}`);
        break;
      }
    }
    console.log(`[chat-service] Client disconnected: ${socket.id}`);
  });
});

console.log(`[chat-service] Socket.IO chat server running on port ${PORT}`);

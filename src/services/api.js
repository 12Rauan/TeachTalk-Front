import { io } from 'socket.io-client';

const API_URL = 'http://localhost:5000';
const socket = io(API_URL);

export const api = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    return response.json();
  },

  register: async (username, email, password) => {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    
    return response.json();
  },

  getChatRooms: async () => {
    const response = await fetch(`${API_URL}/chat_rooms`);
    if (!response.ok) {
      throw new Error('Failed to fetch chat rooms');
    }
    return response.json();
  },

  createChatRoom: async (room) => {
    const response = await fetch(`${API_URL}/chat_rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(room),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create chat room');
    }
    
    return response.json();
  },

  // Socket event handlers
  onConnect: (callback) => {
    socket.on('connect', callback);
  },

  onDisconnect: (callback) => {
    socket.on('disconnect', callback);
  },

  joinRoom: (roomId, username) => {
    socket.emit('join_room', { room: roomId, username });
  },

  leaveRoom: (roomId, username) => {
    socket.emit('leave_room', { room: roomId, username });
  },

  sendMessage: (roomId, username, message) => {
    const timestamp = new Date().toISOString();
    socket.emit('send_message', {
      room: roomId,
      username,
      message,
      timestamp,
    });
  },

  onMessage: (callback) => {
    socket.on('receive_message', callback);
  },

  onPreviousMessages: (callback) => {
    socket.on('load_previous_messages', callback);
  },

  cleanup: () => {
    socket.off('connect');
    socket.off('disconnect');
    socket.off('receive_message');
    socket.off('load_previous_messages');
  }
};
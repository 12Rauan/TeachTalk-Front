import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Send } from 'lucide-react';

import { api } from '../services/api';

const ChatRoom = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    // Join the room when the component mounts
    api.joinRoom(id, user.username);
  
    // Listen for incoming messages
    api.onMessage((message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  
    // Load previous messages when joining the room
    api.onPreviousMessages((prevMessages) => {
      setMessages(prevMessages);
    });
  
    // Scroll to bottom on new messages
    scrollToBottom();
  
    return () => {
      api.leaveRoom(id, user.username);
      api.cleanup();
    };
  }, [id, user.username]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;
  
    // Send the message using the api service
    api.sendMessage(id, user.username, newMessage);
    setNewMessage('');
  };
  
  const handleLeaveRoom = () => {
    api.leaveRoom(id, user.username);
    navigate('/chats');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

 

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="border-b bg-white p-4 flex justify-between">
        <h2 className="text-lg font-semibold">Chat Room #{id}</h2>
        <button
          className="text-red-600 hover:bg-red-50 px-3 py-1 rounded"
          onClick={handleLeaveRoom}
        >
          Leave Room
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((msg, index) => {
            const isOwnMessage = msg.username === user.username;
            return (
              <div
                key={index}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 shadow'
                  }`}
                >
                  {!isOwnMessage && (
                    <p className="mb-1 text-sm font-semibold">{msg.username}</p>
                  )}
                  <p className="break-words">{msg.message}</p>
                  <p
                    className={`mt-1 text-right text-xs ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {msg.timestamp} {/* Use the timestamp from the backend */}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="border-t bg-white p-4">
        <div className="flex space-x-4">
          <div className="relative flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="block w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-3 pr-12 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              rows="1"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="absolute bottom-2 right-2 rounded-full p-2 text-blue-600 hover:bg-blue-50 disabled:text-gray-400"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;

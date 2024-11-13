import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Send, Phone, Video, User, Clock, Check, CheckCheck } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { api } from '../services/api';

const ChatRoom = () => {
  const { id } = useParams();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const response = await fetch(`http://localhost:5000/chat_rooms/${id}`);
        const data = await response.json();
        setRoomInfo(data);
      } catch (error) {
        console.error('Error fetching room info:', error);
      }
    };

    fetchRoomInfo();
  }, [id]);

  useEffect(() => {
    console.log('Joining room:', id);
    api.joinRoom(id, user.username);
  
    const handleMessage = (message) => {
      console.log('Received message:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    };
  
    const handlePreviousMessages = (prevMessages) => {
      console.log('Loaded previous messages:', prevMessages);
      setMessages(prevMessages);
      scrollToBottom();
    };

    const handleUserTyping = (data) => {
      if (data.username !== user.username) {
        setTypingUsers(prev => {
          if (!prev.includes(data.username)) {
            return [...prev, data.username];
          }
          return prev;
        });

        setTimeout(() => {
          setTypingUsers(prev => prev.filter(user => user !== data.username));
        }, 3000);
      }
    };

    const handleParticipantJoined = (data) => {
      setParticipants(prev => [...prev, data.username]);
    };

    const handleParticipantLeft = (data) => {
      setParticipants(prev => prev.filter(username => username !== data.username));
    };
  
    api.onMessage(handleMessage);
    api.onPreviousMessages(handlePreviousMessages);
    
    if (socket) {
      socket.on('user_typing', handleUserTyping);
      socket.on('participant_joined', handleParticipantJoined);
      socket.on('participant_left', handleParticipantLeft);
    }
  
    return () => {
      console.log('Leaving room:', id);
      api.leaveRoom(id, user.username);
      
      if (api.off) {
        api.off('message', handleMessage);
        api.off('previousMessages', handlePreviousMessages);
      }

      if (socket) {
        socket.off('user_typing', handleUserTyping);
        socket.off('participant_joined', handleParticipantJoined);
        socket.off('participant_left', handleParticipantLeft);
      }
    };
  }, [id, user.username, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const timestamp = new Date().toLocaleTimeString();
    api.sendMessage(id, user.username, newMessage, timestamp);
    setNewMessage('');
    setIsTyping(false);
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

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      socket?.emit('typing', { roomId: id, username: user.username });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const initiateAudioCall = (recipientUsername) => {
    navigate('/call/audio', {
      state: {
        userToCall: recipientUsername,
        callerId: user.username
      }
    });
  };

  const initiateVideoCall = (recipientUsername) => {
    navigate('/call/video', {
      state: {
        userToCall: recipientUsername,
        callerId: user.username
      }
    });
  };

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="border-b bg-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold">Chat Room #{id}</h2>
          {roomInfo && (
            <span className="text-sm text-gray-500">
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => initiateAudioCall(roomInfo?.otherUser)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Start audio call"
          >
            <Phone size={20} />
          </button>
          <button
            onClick={() => initiateVideoCall(roomInfo?.otherUser)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Start video call"
          >
            <Video size={20} />
          </button>
          <button
            className="text-red-600 hover:bg-red-50 px-3 py-1 rounded"
            onClick={handleLeaveRoom}
          >
            Leave Room
          </button>
        </div>
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
                    <p className="mb-1 text-sm font-semibold flex items-center space-x-2">
                      <User size={14} />
                      <span>{msg.username}</span>
                    </p>
                  )}
                  <p className="break-words">{msg.message}</p>
                  <div className="mt-1 flex items-center justify-end space-x-2 text-xs">
                    <Clock size={12} />
                    <span className={isOwnMessage ? 'text-blue-100' : 'text-gray-500'}>
                      {msg.timestamp}
                    </span>
                    {isOwnMessage && (
                      <CheckCheck size={12} className="text-blue-100" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-gray-500">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      <div className="border-t bg-white p-4">
        <div className="flex space-x-4">
          <div className="relative flex-1">
            <textarea
              value={newMessage}
              onChange={handleTyping}
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
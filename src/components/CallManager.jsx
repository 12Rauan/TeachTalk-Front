import React, { useState, useEffect } from 'react';
import { Phone, Video, X, PhoneOff } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import VideoCall from './VideoCall';
import AudioCall from './AudioCall';

const CallManager = ({ username }) => {
  const { socket, isConnected } = useSocket();
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [callStatus, setCallStatus] = useState('idle');

  useEffect(() => {
    if (!socket || !username || !isConnected) return;

    // Register user with socket server
    socket.emit('register_user', { username });

    // Socket event handlers
    const handleIncomingCall = (data) => {
      console.log('Incoming call:', data);
      setIncomingCall(data);
    };

    const handleCallAccepted = (data) => {
      console.log('Call accepted:', data);
      setActiveCall({
        ...data,
        status: 'active'
      });
      setIncomingCall(null);
      setCallStatus('connected');
    };

    const handleCallRejected = () => {
      console.log('Call rejected');
      setActiveCall(null);
      setIncomingCall(null);
      setCallStatus('rejected');
    };

    const handleCallEnded = () => {
      console.log('Call ended');
      setActiveCall(null);
      setIncomingCall(null);
      setCallStatus('ended');
    };

    // Register event listeners
    socket.on('incoming_call', handleIncomingCall);
    socket.on('call_accepted', handleCallAccepted);
    socket.on('call_rejected', handleCallRejected);
    socket.on('call_ended', handleCallEnded);

    // Cleanup function
    return () => {
      socket.off('incoming_call', handleIncomingCall);
      socket.off('call_accepted', handleCallAccepted);
      socket.off('call_rejected', handleCallRejected);
      socket.off('call_ended', handleCallEnded);
    };
  }, [socket, username, isConnected]);

  const initiateCall = async (callee, type = 'video') => {
    if (!socket || !isConnected) {
      console.error('Socket not connected');
      return;
    }

    console.log('Initiating call to:', callee);
    socket.emit('initiate_call', {
      caller: username,
      callee,
      type
    }, (response) => {
      if (response.error) {
        console.error('Call initiation error:', response.error);
        return;
      }

      setActiveCall({
        room: response.room,
        type,
        status: 'calling',
        peer: callee
      });
      setCallStatus('calling');
    });
  };

  const acceptCall = () => {
    if (!socket || !incomingCall) return;
    
    console.log('Accepting call from:', incomingCall.caller);
    socket.emit('answer_call', {
      room: incomingCall.room,
      answer: true
    });
  };

  const rejectCall = () => {
    if (!socket || !incomingCall) return;
    
    console.log('Rejecting call from:', incomingCall.caller);
    socket.emit('answer_call', {
      room: incomingCall.room,
      answer: false
    });
  };

  const endCall = () => {
    if (!socket || !activeCall) return;
    
    console.log('Ending call');
    socket.emit('end_call', {
      room: activeCall.room
    });
  };

  if (!isConnected) {
    return null; // Or a loading/connection status indicator
  }

  return (
    <div className="relative">
      {/* Active Call UI */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-gray-900">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={endCall}
              className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <PhoneOff size={24} />
            </button>
          </div>
          
          {activeCall.type === 'video' ? (
            <VideoCall
              room={activeCall.room}
              peer={activeCall.peer}
              onEndCall={endCall}
            />
          ) : (
            <AudioCall
              room={activeCall.room}
              peer={activeCall.peer}
              onEndCall={endCall}
            />
          )}
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 px-4 py-2 rounded-full text-white">
            {callStatus === 'calling' ? 'Calling...' : `On call with ${activeCall.peer}`}
          </div>
        </div>
      )}

      {/* Incoming Call UI */}
      {incomingCall && !activeCall && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <h3 className="font-semibold">Incoming {incomingCall.type} call</h3>
              <p className="text-sm text-gray-500">from {incomingCall.caller}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={acceptCall}
                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              >
                {incomingCall.type === 'video' ? <Video size={20} /> : <Phone size={20} />}
              </button>
              <button
                onClick={rejectCall}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Status Messages */}
      {callStatus !== 'idle' && !activeCall && !incomingCall && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-full animate-fade-out">
          {callStatus === 'rejected' && 'Call rejected'}
          {callStatus === 'ended' && 'Call ended'}
        </div>
      )}
    </div>
  );
};

export default CallManager;
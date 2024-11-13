import React, { useState, useEffect } from 'react';
import { Phone, Video, X, PhoneOff } from 'lucide-react';
import VideoCall from './VideoCall';
import AudioCall from './AudioCall';

const CallManager = ({ socket, username }) => {
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [callStatus, setCallStatus] = useState('idle');
  
  useEffect(() => {
    if (!socket) return;

    // Register user with socket server
    socket.emit('register_user', { username });

    // Handle incoming calls
    socket.on('incoming_call', (data) => {
      setIncomingCall(data);
    });

    // Handle call accepted
    socket.on('call_accepted', (data) => {
      setActiveCall({
        ...data,
        status: 'active'
      });
      setIncomingCall(null);
      setCallStatus('connected');
    });

    // Handle call rejected
    socket.on('call_rejected', () => {
      setActiveCall(null);
      setIncomingCall(null);
      setCallStatus('rejected');
    });

    // Handle call ended
    socket.on('call_ended', () => {
      setActiveCall(null);
      setIncomingCall(null);
      setCallStatus('ended');
    });

    return () => {
      socket.off('incoming_call');
      socket.off('call_accepted');
      socket.off('call_rejected');
      socket.off('call_ended');
    };
  }, [socket, username]);

  const initiateCall = async (callee, type = 'video') => {
    const response = await socket.emit('initiate_call', {
      caller: username,
      callee,
      type
    });

    if (response.error) {
      console.error(response.error);
      return;
    }

    setActiveCall({
      room: response.room,
      type,
      status: 'calling',
      peer: callee
    });
    setCallStatus('calling');
  };

  const acceptCall = () => {
    if (!incomingCall) return;
    
    socket.emit('answer_call', {
      room: incomingCall.room,
      answer: true
    });
    
    // Add to call history
    addToCallHistory({
      type: incomingCall.type,
      participant: incomingCall.caller,
      direction: 'incoming',
      status: 'accepted',
      timestamp: new Date()
    });
  };

  const rejectCall = () => {
    if (!incomingCall) return;
    
    socket.emit('answer_call', {
      room: incomingCall.room,
      answer: false
    });
    
    // Add to call history
    addToCallHistory({
      type: incomingCall.type,
      participant: incomingCall.caller,
      direction: 'incoming',
      status: 'rejected',
      timestamp: new Date()
    });
  };

  const endCall = () => {
    if (!activeCall) return;
    
    socket.emit('end_call', {
      room: activeCall.room
    });
    
    // Add to call history
    addToCallHistory({
      type: activeCall.type,
      participant: activeCall.peer,
      direction: 'outgoing',
      status: 'ended',
      timestamp: new Date()
    });
  };

  const addToCallHistory = (callRecord) => {
    setCallHistory(prev => [callRecord, ...prev].slice(0, 50)); // Keep last 50 calls
  };

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
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm animate-slide-up">
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

      {/* Call History (Optional) */}
      {callHistory.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Recent Calls</h3>
          <div className="space-y-2">
            {callHistory.map((call, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{call.participant}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {call.direction === 'incoming' ? 'Incoming' : 'Outgoing'} {call.type} call
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {new Date(call.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`text-sm ${
                    call.status === 'accepted' ? 'text-green-500' :
                    call.status === 'rejected' ? 'text-red-500' :
                    'text-gray-500'
                  }`}>
                    {call.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CallManager;
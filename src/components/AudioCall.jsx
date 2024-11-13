import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { useCall } from '../contexts/CallContext';

const AudioCall = () => {
  const { state } = useLocation();
  const { userToCall, callerId } = state || {};
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { endCall } = useCall();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  
  const localAudioRef = useRef();
  const remoteAudioRef = useRef();
  const peerConnectionRef = useRef();

  useEffect(() => {
    let cleanup = false;

    const initCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        });
        
        if (cleanup) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        setLocalStream(stream);
        if (localAudioRef.current) {
          localAudioRef.current.srcObject = stream;
        }

        // Initialize WebRTC connection
        setupPeerConnection(stream);
      } catch (err) {
        console.error('Failed to get media devices:', err);
        handleEndCall();
      }
    };

    initCall();

    return () => {
      cleanup = true;
      cleanupCall();
    };
  }, []);

  const setupPeerConnection = (stream) => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    // Add local stream
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    // Handle incoming stream
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };

    pc.oniceconnectionstatechange = () => {
      setConnectionStatus(pc.iceConnectionState);
      if (pc.iceConnectionState === 'disconnected') {
        handleEndCall();
      }
    };

    // Socket event handlers for signaling
    socket.on('call_accepted', handleCallAccepted);
    socket.on('call_rejected', handleCallRejected);
    socket.on('call_ended', handleCallEnded);
    socket.on('webrtc_signal', handleWebRTCSignal);

    // Emit initial call event
    socket.emit('initiate_call', {
      caller: callerId,
      callee: userToCall,
      type: 'audio'
    });
  };

  const handleCallAccepted = async (data) => {
    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socket.emit('webrtc_signal', {
        type: 'offer',
        offer,
        to: userToCall
      });
    } catch (err) {
      console.error('Error creating offer:', err);
      handleEndCall();
    }
  };

  const handleCallRejected = () => {
    handleEndCall();
  };

  const handleCallEnded = () => {
    handleEndCall();
  };

  const handleWebRTCSignal = async (data) => {
    try {
      if (data.type === 'offer') {
        await peerConnectionRef.current.setRemoteDescription(data.offer);
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit('webrtc_signal', {
          type: 'answer',
          answer,
          to: callerId
        });
      } else if (data.type === 'answer') {
        await peerConnectionRef.current.setRemoteDescription(data.answer);
      } else if (data.type === 'candidate') {
        await peerConnectionRef.current.addIceCandidate(data.candidate);
      }
    } catch (err) {
      console.error('Error handling WebRTC signal:', err);
    }
  };

  const toggleMicrophone = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
    }
  };

  const cleanupCall = () => {
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Remove socket listeners
    if (socket) {
      socket.off('call_accepted');
      socket.off('call_rejected');
      socket.off('call_ended');
      socket.off('webrtc_signal');
    }
  };

  const handleEndCall = () => {
    cleanupCall();
    socket.emit('end_call', {
      room: `call_${callerId}_${userToCall}`
    });
    endCall(); // This will navigate back to /chats
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center">
      {/* Hidden audio elements */}
      <audio ref={localAudioRef} autoPlay muted />
      <audio ref={remoteAudioRef} autoPlay />

      {/* Call status */}
      <div className="text-white text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          {connectionStatus === 'connected' 
            ? `In call with ${userToCall}`
            : connectionStatus === 'connecting'
            ? 'Connecting...'
            : 'Initializing call...'}
        </h2>
        <CallTimer isConnected={connectionStatus === 'connected'} />
      </div>

      {/* Controls */}
      <div className="flex space-x-6">
        <button
          onClick={toggleMicrophone}
          className={`p-4 rounded-full ${
            isAudioEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
          } transition-colors`}
        >
          {isAudioEnabled ? <Mic size={24} className="text-white" /> : <MicOff size={24} className="text-white" />}
        </button>

        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
        >
          <PhoneOff size={24} className="text-white" />
        </button>
      </div>
    </div>
  );
};

const CallTimer = ({ isConnected }) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval;
    if (isConnected) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-white text-lg font-mono">
      {formatDuration(duration)}
    </div>
  );
};

export default AudioCall;
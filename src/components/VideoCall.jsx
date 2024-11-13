import React, { useEffect, useRef, useState } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff } from 'lucide-react';

const VideoCall = ({ userToCall, callerId, onEndCall }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('initializing');
  const [error, setError] = useState(null);
  
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnection = useRef(null);
  
  useEffect(() => {
    initializeMedia();
    setupWebRTC();
    
    return () => {
      cleanupCall();
    };
  }, []);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Could not access camera or microphone');
      console.error('Media Error:', err);
    }
  };

  const setupWebRTC = async () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(configuration);
    peerConnection.current = pc;

    // Handle incoming tracks
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Add local tracks to the connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      setConnectionStatus(pc.connectionState);
    };

    // Handle ICE candidate events
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Send the candidate to the other peer via your signaling server
        socket.emit('webrtc_signal', {
          type: 'ice-candidate',
          candidate: event.candidate,
          to: userToCall
        });
      }
    };
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    }
  };

  const cleanupCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    if (onEndCall) {
      onEndCall();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-2 gap-4 p-4">
        {/* Local Video */}
        <div className="relative rounded-lg overflow-hidden bg-gray-800">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
            You
          </div>
        </div>
        
        {/* Remote Video */}
        <div className="relative rounded-lg overflow-hidden bg-gray-800">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
            {userToCall}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4">
        <div className="flex justify-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full ${
              isAudioEnabled ? 'bg-gray-600' : 'bg-red-600'
            }`}
          >
            {isAudioEnabled ? <Mic className="text-white" /> : <MicOff className="text-white" />}
          </button>
          
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full ${
              isVideoEnabled ? 'bg-gray-600' : 'bg-red-600'
            }`}
          >
            {isVideoEnabled ? <Video className="text-white" /> : <VideoOff className="text-white" />}
          </button>
          
          <button
            onClick={cleanupCall}
            className="p-4 rounded-full bg-red-600"
          >
            <PhoneOff className="text-white" />
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded">
          {error}
        </div>
      )}
      
      {connectionStatus !== 'connected' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded">
          {connectionStatus === 'connecting' ? 'Connecting...' : 'Waiting for peer...'}
        </div>
      )}
    </div>
  );
};

export default VideoCall;
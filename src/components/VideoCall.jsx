import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, ScreenShare, MonitorStop } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { useCall } from '../contexts/CallContext';

const VideoCall = () => {
  const { state } = useLocation();
  const { userToCall, callerId } = state || {};
  const { socket } = useSocket();
  const { endCall } = useCall();
  
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [error, setError] = useState(null);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef();
  const screenShareStreamRef = useRef();

  useEffect(() => {
    let cleanup = false;

    const initCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }
        });
        
        if (cleanup) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        setupPeerConnection(stream);
      } catch (err) {
        console.error('Failed to get media devices:', err);
        setError('Could not access camera or microphone');
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
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
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
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.oniceconnectionstatechange = () => {
      setConnectionStatus(pc.iceConnectionState);
      if (pc.iceConnectionState === 'disconnected') {
        handleEndCall();
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc_signal', {
          type: 'candidate',
          candidate: event.candidate,
          to: userToCall
        });
      }
    };

    // Socket event handlers
    socket.on('call_accepted', handleCallAccepted);
    socket.on('call_rejected', handleCallRejected);
    socket.on('call_ended', handleCallEnded);
    socket.on('webrtc_signal', handleWebRTCSignal);

    // Emit initial call event
    socket.emit('initiate_call', {
      caller: callerId,
      callee: userToCall,
      type: 'video'
    });
  };

  const handleCallAccepted = async () => {
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
    setError('Call was rejected');
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
      setError('Connection error occurred');
    }
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

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        screenShareStreamRef.current.getTracks().forEach(track => track.stop());
        // Restore video track
        const videoTrack = localStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        screenShareStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
        setIsScreenSharing(true);

        // Handle when user stops screen sharing using browser controls
        screenTrack.onended = () => {
          toggleScreenShare();
        };
      }
    } catch (err) {
      console.error('Error during screen sharing:', err);
      setError('Failed to share screen');
    }
  };

  const cleanupCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
    if (screenShareStreamRef.current) {
      screenShareStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
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
    endCall();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
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
            You {isScreenSharing && '(Screen Sharing)'}
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

      {/* Call Status */}
      {connectionStatus !== 'connected' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded">
          {connectionStatus === 'connecting' ? 'Connecting...' : 'Initializing call...'}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="bg-gray-800 p-4">
        <div className="flex justify-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full ${
              isAudioEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'
            } transition-colors`}
            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isAudioEnabled ? <Mic className="text-white" /> : <MicOff className="text-white" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full ${
              isVideoEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'
            } transition-colors`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? <Video className="text-white" /> : <VideoOff className="text-white" />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full ${
              isScreenSharing ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
            } transition-colors`}
            title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
          >
            {isScreenSharing ? (
              <MonitorStop className="text-white" />
            ) : (
              <ScreenShare className="text-white" />
            )}
          </button>

          <button
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
            title="End call"
          >
            <PhoneOff className="text-white" />
          </button>
        </div>

        {/* Call Timer */}
        <div className="text-center mt-2">
          <CallTimer isConnected={connectionStatus === 'connected'} />
        </div>
      </div>
    </div>
  );
};

// Call Timer Component
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

export default VideoCall;
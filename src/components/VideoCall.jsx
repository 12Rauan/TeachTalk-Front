import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';

const socket = io.connect('https://pretty-eggs-leave.loca.lt');

const VideoCall = ({ userToCall, callerId }) => {
  const [stream, setStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        myVideo.current.srcObject = currentStream;
      });

    // Listen for incoming call
    socket.on('callUser', ({ from, signal }) => {
      const peer = new SimplePeer({ initiator: false, trickle: false, stream });
      peer.on('signal', (data) => socket.emit('answerCall', { signal: data, to: from }));
      peer.on('stream', (currentStream) => {
        userVideo.current.srcObject = currentStream;
      });
      peer.signal(signal);
      connectionRef.current = peer;
    });

    // Listen for call ended event
    socket.on('call_ended', () => {
      endCall();
    });

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (connectionRef.current) {
        connectionRef.current.destroy();
      }
    };
  }, [stream]);

  const callUser = () => {
    const peer = new SimplePeer({ initiator: true, trickle: false, stream });
    peer.on('signal', (data) => socket.emit('callUser', { userToCall, signalData: data, from: callerId }));
    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });
    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });
    connectionRef.current = peer;
  };

  const endCall = () => {
    setCallEnded(true);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    socket.emit('end_call', { room: `call_${callerId}_${userToCall}` });
  };

  return (
    <div>
      <video ref={myVideo} autoPlay muted />
      <video ref={userVideo} autoPlay />
      {!callAccepted && !callEnded && <button onClick={callUser}>Call</button>}
      {callAccepted && !callEnded && <button onClick={endCall}>End Call</button>}
    </div>
  );
};

export default VideoCall;

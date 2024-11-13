import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CallContext = createContext(null);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

export const CallProvider = ({ children }) => {
  const [activeCall, setActiveCall] = useState(null);
  const navigate = useNavigate();

  const startCall = (type, userToCall, callerId) => {
    setActiveCall({
      type,
      userToCall,
      callerId,
      startTime: new Date()
    });
    navigate(`/call/${type}`, {
      state: { userToCall, callerId }
    });
  };

  const endCall = () => {
    setActiveCall(null);
    navigate('/chats');
  };

  return (
    <CallContext.Provider value={{ activeCall, startCall, endCall }}>
      {children}
    </CallContext.Provider>
  );
};
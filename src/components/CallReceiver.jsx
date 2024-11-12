import React, { useState, useEffect } from 'react';
import { useSocket } from './socket'; // Assuming you have a custom hook for the socket
import IncomingCallModal from './IncomingCallModal';

const CallReceiver = () => {
    const [incomingCall, setIncomingCall] = useState(null);
    const socket = useSocket();

    useEffect(() => {
        socket.on('incoming_call', ({ caller, type, room }) => {
            setIncomingCall({ caller, room });
        });

        return () => {
            socket.off('incoming_call');
        };
    }, [socket]);

    const acceptCall = () => {
        socket.emit('answer_call', { room: incomingCall.room });
        setIncomingCall(null); // Hide the modal after accepting
    };

    const rejectCall = () => {
        socket.emit('reject_call', { room: incomingCall.room });
        setIncomingCall(null); // Hide the modal after rejecting
    };

    return (
        <>
            {incomingCall && (
                <IncomingCallModal
                    caller={incomingCall.caller}
                    onAccept={acceptCall}
                    onReject={rejectCall}
                />
            )}
        </>
    );
};

export default CallReceiver;

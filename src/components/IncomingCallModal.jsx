import React from 'react';

const IncomingCallModal = ({ caller, onAccept, onReject }) => (
    <div className="incoming-call-modal">
        <p>{caller} is calling you...</p>
        <button onClick={onAccept}>Accept</button>
        <button onClick={onReject}>Reject</button>
    </div>
);

export default IncomingCallModal;

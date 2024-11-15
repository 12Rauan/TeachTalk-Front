// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import { CallProvider } from './contexts/CallContext';
import Login from './components/Login';
import Register from './components/Register';
import ChatList from './components/ChatList';
import ChatRoom from './components/ChatRoom';
import UserProfile from './components/UserProfile';
import AudioCall from './components/AudioCall';
import VideoCall from './components/VideoCall';
import TaskManager from './components/TaskManager';
import ProtectedRoute from './components/ProtectedRoute';
import CallManager from './components/CallManager';
import Subscription from './components/Subscription';

const App = () => {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            setCurrentUser(JSON.parse(user));
        }
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            const user = localStorage.getItem('user');
            if (user) {
                setCurrentUser(JSON.parse(user));
            } else {
                setCurrentUser(null);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <Router>
            <SocketProvider>
                <CallProvider>
                    <div className="h-screen">
                        {currentUser && (
                            <CallManager username={currentUser.username} />
                        )}
                        
                        <Routes>
                            <Route path="/login" element={
                                currentUser ? <Navigate to="/chats" /> : <Login />
                            } />
                            <Route path="/register" element={
                                currentUser ? <Navigate to="/chats" /> : <Register />
                            } />
                            <Route path="/chats" element={
                                <ProtectedRoute>
                                    <ChatList />
                                </ProtectedRoute>
                            } />
                            <Route path="/chat/:id" element={
                                <ProtectedRoute>
                                    <ChatRoom />
                                </ProtectedRoute>
                            } />
                            <Route path="/profile" element={
                                <ProtectedRoute>
                                    <UserProfile />
                                </ProtectedRoute>
                            } />
                            <Route path="/call/audio" element={
                                <ProtectedRoute>
                                    <AudioCall />
                                </ProtectedRoute>
                            } />
                            <Route path="/call/video" element={
                                <ProtectedRoute>
                                    <VideoCall />
                                </ProtectedRoute>
                            } />
                            <Route path="/tasks" element={
                                <ProtectedRoute>
                                    <TaskManager />
                                </ProtectedRoute>
                            } />
                            <Route path="/subscription" element={
                                <ProtectedRoute>
                                    <Subscription />
                                </ProtectedRoute>
                            } />
                            <Route path="/card-registration" element={
                                <ProtectedRoute>
                                    <CardRegistration />
                                </ProtectedRoute>
                            } />
                            <Route path="/" element={
                                currentUser ? <Navigate to="/chats" /> : <Navigate to="/register" />
                            } />
                        </Routes>
                    </div>
                </CallProvider>
            </SocketProvider>
        </Router>
    );
};

export default App;

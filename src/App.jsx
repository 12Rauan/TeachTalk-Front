import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
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

const App = () => {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        // Load user from localStorage when the app starts
        const user = localStorage.getItem('user');
        if (user) {
            setCurrentUser(JSON.parse(user));
        }
    }, []);

    // Listen for changes in localStorage
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
        <SocketProvider>
            <Router>
                <div className="h-screen">
                    {/* CallManager will be rendered if user is logged in */}
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
                        <Route path="/" element={
                            currentUser ? <Navigate to="/chats" /> : <Navigate to="/register" />
                        } />
                    </Routes>
                </div>
            </Router>
        </SocketProvider>
    );
};

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ChatList from './components/ChatList';
import ChatRoom from './components/ChatRoom';
import UserProfile from './components/UserProfile';
import AudioCall from './components/AudioCall';
import VideoCall from './components/VideoCall';
import TaskManager from './components/TaskManager'; // Import TaskManager component
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
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
                        <TaskManager /> {/* Add TaskManager route */}
                    </ProtectedRoute>
                } />
                <Route path="/" element={<Navigate to="/register" />} />
            </Routes>
        </Router>
    );
};

export default App;

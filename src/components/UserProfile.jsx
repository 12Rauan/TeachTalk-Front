import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, Bell, Trash, Phone, Video, XCircle } from 'lucide-react';
import Switch from './Switch';
import Avatar from './Avatar';
import axios from 'axios';  // Import axios for making API requests

const UserProfile = () => {
    const [username, setUsername] = useState('TestUser');
    const [email, setEmail] = useState('user@example.com');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showOnlineStatus, setShowOnlineStatus] = useState(true);
    const [receiveNotifications, setReceiveNotifications] = useState(true);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isInCall, setIsInCall] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); // Selected user to call
    const [userList, setUserList] = useState([]); // List of existing users from the server
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setUsername(user.username);
            setEmail(user.email || '');
            setShowOnlineStatus(user.showOnlineStatus || true);
            setReceiveNotifications(user.receiveNotifications || true);
            setBlockedUsers(user.blockedUsers || []);
        }

        // Fetch the user list from the backend
        fetchUserList();
    }, []);

    const fetchUserList = async () => {
        try {
            const response = await axios.get('http://localhost:5000/users'); // Adjust URL if needed
            setUserList(response.data);
        } catch (error) {
            console.error('Error fetching user list:', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setSaved(false);
        try {
            const user = JSON.parse(localStorage.getItem('user')) || {};
            user.username = username;
            user.email = email;
            user.showOnlineStatus = showOnlineStatus;
            user.receiveNotifications = receiveNotifications;
            user.blockedUsers = blockedUsers;
            localStorage.setItem('user', JSON.stringify(user));
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
        setLoading(false);
    };

    const handleAudioCall = (user) => {
        setSelectedUser(user);
        setIsInCall(true);
        navigate('/call/audio', { state: { userToCall: user.username, callerId: email } });
    };

    const handleVideoCall = (user) => {
        setSelectedUser(user);
        setIsInCall(true);
        navigate('/call/video', { state: { userToCall: user.username, callerId: email } });
    };

    const handleEndCall = () => {
        setIsInCall(false);
        setSelectedUser(null);
        navigate('/'); // Redirect to the main screen or any other relevant page
    };

    return (
        <div className="flex justify-center min-h-screen">
            <div className="mx-auto w-full max-w-4xl p-8 space-y-8">
                <div className="text-center">
                    <div className="group relative mx-auto mb-4 h-32 w-32">
                        <Avatar username={username} size="lg" />
                        <button className="absolute bottom-0 right-0 rounded-full bg-white p-2 shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            <Camera size={20} className="text-gray-600" />
                        </button>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
                </div>

                {/* Display User List to Select for Calling */}
                <div className="space-y-4 rounded-lg bg-gray-50 p-4">
                    <h3 className="font-medium text-gray-900">Start a Call with an Existing User</h3>
                    {userList.map((user, index) => (
                        <div key={index} className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
                            <div className="flex items-center space-x-3">
                                <Avatar username={user.username} size="sm" />
                                <span>{user.username}</span>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleAudioCall(user)}
                                    className="flex items-center space-x-3 rounded-lg bg-white p-2 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    disabled={isInCall}
                                >
                                    <Phone size={16} className="text-gray-400" />
                                </button>
                                <button
                                    onClick={() => handleVideoCall(user)}
                                    className="flex items-center space-x-3 rounded-lg bg-white p-2 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    disabled={isInCall}
                                >
                                    <Video size={16} className="text-gray-400" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {isInCall && (
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={handleEndCall}
                                className="flex items-center space-x-3 rounded-lg bg-red-600 p-3 text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                <XCircle size={20} className="text-white" />
                                <span>End Call</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Profile settings, notifications, and privacy controls */}
                <div className="space-y-6 rounded-lg border bg-white p-6 shadow-sm">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        />
                    </div>

                    <div className="space-y-4 rounded-lg bg-gray-50 p-4">
                        <h3 className="font-medium text-gray-900">Notifications and Privacy</h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Bell size={20} className="text-gray-400" />
                                <span>Receive Notifications</span>
                            </div>
                            <Switch checked={receiveNotifications} onChange={setReceiveNotifications} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <User size={20} className="text-gray-400" />
                                <span>Show Online Status</span>
                            </div>
                            <Switch checked={showOnlineStatus} onChange={setShowOnlineStatus} />
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-4">
                        {saved && (
                            <span className="text-sm text-green-600">
                                Profile updated successfully!
                            </span>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;

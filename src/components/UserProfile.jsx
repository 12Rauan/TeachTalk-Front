import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, Bell, Phone, Video } from 'lucide-react';
import Switch from './Switch';
import Avatar from './Avatar';

const UserProfile = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [showOnlineStatus, setShowOnlineStatus] = useState(true);
    const [receiveNotifications, setReceiveNotifications] = useState(true);
    const [userList, setUserList] = useState([]);
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        // Fetch user list from your API
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:5000/users');
                const data = await response.json();
                setUserList(data.filter(user => user.username !== currentUser.username));
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        if (currentUser) {
            setUsername(currentUser.username);
            setEmail(currentUser.email);
            fetchUsers();
        }
    }, []);

    const initiateAudioCall = (recipientUsername) => {
        navigate('/call/audio', {
            state: {
                userToCall: recipientUsername,
                callerId: currentUser.username
            }
        });
    };

    const initiateVideoCall = (recipientUsername) => {
        navigate('/call/video', {
            state: {
                userToCall: recipientUsername,
                callerId: currentUser.username
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Profile Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="text-center mb-6">
                    <div className="relative inline-block">
                        <Avatar
                            src={`https://ui-avatars.com/api/?name=${username}&background=random`}
                            alt={username}
                            size={128}
                        />
                        <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg">
                            <Camera className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                    <h2 className="text-2xl font-bold mt-4">{username}</h2>
                    <p className="text-gray-600">{email}</p>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Bell className="w-5 h-5 text-gray-400" />
                            <span>Receive Notifications</span>
                        </div>
                        <Switch checked={receiveNotifications} onChange={setReceiveNotifications} />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <User className="w-5 h-5 text-gray-400" />
                            <span>Show Online Status</span>
                        </div>
                        <Switch checked={showOnlineStatus} onChange={setShowOnlineStatus} />
                    </div>
                </div>
            </div>

            {/* User List with Call Options */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">Contact List</h3>
                <div className="space-y-4">
                    {userList.map((user) => (
                        <div key={user.username} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <Avatar
                                    src={`https://ui-avatars.com/api/?name=${user.username}&background=random`}
                                    alt={user.username}
                                    size={40}
                                />
                                <span className="font-medium">{user.username}</span>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => initiateAudioCall(user.username)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                >
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => initiateVideoCall(user.username)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                >
                                    <Video className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
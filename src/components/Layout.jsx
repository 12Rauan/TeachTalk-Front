import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Settings, LogOut, CheckSquare } from 'lucide-react'; // Import the CheckSquare icon for Tasks

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const sidebarRef = useRef(null); // Create a ref for the sidebar

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Effect to close the sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [sidebarRef]);

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Mobile Toggle Button */}
            <button 
                className="md:hidden p-4"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                Menu
            </button>

            {/* Sidebar */}
            <div ref={sidebarRef} className={`fixed inset-0 bg-white transition-transform transform md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex h-full flex-col">
                    <div className="p-4">
                        <h1 className="text-xl font-bold">Teachtalk</h1>
                    </div>
                    <nav className="flex-1">
                        <button
                            onClick={() => {
                                navigate('/chats');
                                setIsSidebarOpen(false); // Close the sidebar on navigation
                            }}
                            className="flex w-full items-center space-x-2 p-4 hover:bg-gray-100"
                        >
                            <MessageSquare size={20} />
                            <span>Chats</span>
                        </button>
                        <button
                            onClick={() => {
                                navigate('/tasks'); // Navigate to Tasks
                                setIsSidebarOpen(false); // Close the sidebar on navigation
                            }}
                            className="flex w-full items-center space-x-2 p-4 hover:bg-gray-100"
                        >
                            <CheckSquare size={20} /> {/* Icon for Tasks */}
                            <span>Tasks</span> {/* Label for Tasks */}
                        </button>
                        <button
                            onClick={() => {
                                navigate('/profile');
                                setIsSidebarOpen(false); // Close the sidebar on navigation
                            }}
                            className="flex w-full items-center space-x-2 p-4 hover:bg-gray-100"
                        >
                            <Settings size={20} />
                            <span>Profile</span>
                        </button>
                        
                    </nav>
                    <button
                        onClick={() => {
                            handleLogout();
                            setIsSidebarOpen(false); // Close the sidebar on logout
                        }}
                        className="flex items-center space-x-2 p-4 text-red-600 hover:bg-gray-100"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-64' : ''}`}>
                <div className="h-full overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Settings, LogOut, CheckSquare, DollarSign } from 'lucide-react'; // Import icons

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const sidebarRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Close sidebar when clicking outside
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
            <div 
                ref={sidebarRef} 
                className={`fixed inset-0 bg-white transition-transform transform md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex h-full flex-col">
                    <div className="p-4">
                        <h1 className="text-xl font-bold">Teachtalk</h1>
                    </div>
                    <nav className="flex-1">
                        <SidebarButton 
                            label="Chats" 
                            icon={<MessageSquare size={20} />} 
                            onClick={() => navigate('/chats')} 
                            closeSidebar={() => setIsSidebarOpen(false)}
                        />
                        <SidebarButton 
                            label="Tasks" 
                            icon={<CheckSquare size={20} />} 
                            onClick={() => navigate('/tasks')} 
                            closeSidebar={() => setIsSidebarOpen(false)}
                        />
                        <SidebarButton 
                            label="Profile" 
                            icon={<Settings size={20} />} 
                            onClick={() => navigate('/profile')} 
                            closeSidebar={() => setIsSidebarOpen(false)}
                        />
                        <SidebarButton 
                            label="Subscription" 
                            icon={<DollarSign size={20} />} 
                            onClick={() => navigate('/subscription')} 
                            closeSidebar={() => setIsSidebarOpen(false)}
                        />
                    </nav>
                    <button
                        onClick={() => {
                            handleLogout();
                            setIsSidebarOpen(false);
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

// Sidebar Button Component
const SidebarButton = ({ label, icon, onClick, closeSidebar }) => (
    <button
        onClick={() => {
            onClick();
            closeSidebar();
        }}
        className="flex w-full items-center space-x-2 p-4 hover:bg-gray-100"
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default Layout;

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  const user = localStorage.getItem('user');
  return user ? <Layout>{children}</Layout> : null;
};

export default ProtectedRoute;
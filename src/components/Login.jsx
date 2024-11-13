import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('https://v0dqcspt-5000.euw.devtunnels.ms//login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Sending email and password to the backend
      });

      const data = await response.json();
      
      if (response.ok) {
        // Login was successful
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/chats'); // Redirect to the chat list
      } else {
        // Login failed, set error message
        setErrorMessage(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('An error occurred while logging in. Please try again later.');
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-2xl">
        <h2 className="text-center text-3xl font-bold text-gray-900">Teachtalk Messenger</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border p-3"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border p-3"
            required
          />
          {errorMessage && (
            <div className="text-red-600 text-sm">{errorMessage}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-3 text-white hover:bg-blue-700"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="text-center text-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

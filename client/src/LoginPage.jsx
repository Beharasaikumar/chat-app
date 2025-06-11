import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LoginPage = ({ setCurrentUser }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
const [loading, setLoading] = useState(false);


const handleLogin = async (e) => {
  e.preventDefault();
  if (!username.trim()) return;
  
  setLoading(true);
  setError('');

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      throw new Error('Failed to login');
    }

    const user = await response.json();
    if (!user?.id) {
      throw new Error('Invalid user object received from server');
    }

    console.log('Logged in user:', user);
    setCurrentUser(user);
  } catch (err) {
    setError(err.message);
    console.error('Login error:', err);
  } finally {
    setLoading(false);
  }
};

  const Card = ({ children, className }) => (
    <div className={`bg-white shadow-md rounded-lg ${className}`}>{children}</div>
  );

  const CardHeader = ({ children, className }) => (
    <div className={`p-4 ${className}`}>{children}</div>
  );

  const CardTitle = ({ children, className }) => (
    <div className={`text-lg font-bold ${className}`}>{children}</div>
  );

  const CardContent = ({ children, className }) => (
    <div className={`p-4 ${className}`}>{children}</div>
  );

  const Button = ({ children, type = 'button', className }) => (
    <button
      type={type}
      className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center ${className}`}
    >
      {children}
    </button>
  );

  const Input = ({ id, value, onChange, placeholder, className }) => (
    <input
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );

  const UserIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Login to Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                value={username}
               onChange={(e) => {
  console.log('Typing:', e.target.value);
  setUsername(e.target.value);
}}
                placeholder="Enter your username"
              />
            </div>
           <Button type="submit" className="w-full" disabled={loading}>
  <UserIcon />
  <span className="ml-2">{loading ? 'Logging in...' : 'Login'}</span>
</Button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;

import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const ChatPage = ({ currentUser, setCurrentUser }) => {
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

  const CardFooter = ({ children, className }) => (
    <div className={`p-4 ${className}`}>{children}</div>
  );

  const Button = ({ children, type = 'button', className, onClick }) => (
    <button
      type={type}
      onClick={onClick}
      className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center ${className}`}
    >
      {children}
    </button>
  );

  const Input = ({ value, onChange, placeholder, className }) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );

  const Avatar = ({ children, className }) => (
    <div className={`relative w-10 h-10 rounded-full overflow-hidden ${className}`}>{children}</div>
  );

  const AvatarFallback = ({ children, className }) => (
    <div className={`bg-gray-300 flex items-center justify-center w-full h-full text-white ${className}`}>
      {children}
    </div>
  );

  const SendIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [otherUserId, setOtherUserId] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;

    socketRef.current = io(SOCKET_URL);

    socketRef.current.emit('join', currentUser.id.toString());

  socketRef.current.on('receiveMessage', (message) => {
  const normalized = {
    id: message.id,
    content: message.content,
    created_at: message.created_at || message.createdAt,
    sender_id: message.sender_id || message.senderId,
    receiver_id: message.receiver_id || message.receiverId,
    sender_name: message.sender_name || message.senderName || 'Unknown',
  };

  console.log('✅ Normalized msg:', normalized);
  setMessages((prev) => [...prev, normalized]);
});



    socketRef.current.on('connect_error', (err) => {
      setError('Failed to connect to the server. Please try again later.');
      console.error('Socket connection error:', err);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !otherUserId) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/messages/${currentUser.id}/${otherUserId}`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        setError('Error fetching messages. Please try again.');
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [currentUser, otherUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) {
      setError('Please enter a message.');
      return;
    }
    if (!currentUser || !otherUserId || !socketRef.current) {
      setError('Cannot send message. Please ensure you are logged in and a recipient is selected.');
      return;
    }

    const messageData = {
      senderId: currentUser.id, // ✅ FIXED here
      receiverId: otherUserId,
      content: inputMessage,
    };

    socketRef.current.emit('sendMessage', messageData);
    setInputMessage('');
    setError(null);
  };

  const handleOtherUserIdChange = (e) => {
    const id = parseInt(e.target.value, 10);
    setOtherUserId(Number.isNaN(id) ? null : id);
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col h-screen bg-gray-100 items-center justify-center">
        <p className="text-red-500">Please log in to access the chat.</p>
        <Button onClick={() => setCurrentUser(null)}>Log Out</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Card className="flex flex-col h-full max-w-3xl mx-auto my-4 w-full">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Avatar>
              <AvatarFallback>{currentUser.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">
                Chat with User {otherUserId || 'Select a user'}
              </p>
              <p className="text-sm text-gray-500">Logged in as {currentUser.username}</p>
              <Input
                value={otherUserId?.toString() || ''}
                onChange={handleOtherUserIdChange}
                placeholder="Enter recipient user ID"
                className="mt-2 w-32"
              />
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading && <p className="text-center text-gray-500">Loading messages...</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {messages.length === 0 && !isLoading && !error && (
            <p className="text-center text-gray-500">No messages yet.</p>
          )}
         {messages.map((message, index) => (
  <div key={message.id || index} className={`flex ${message.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-xs p-3 rounded-lg ${message.sender_id === currentUser.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
      <p className="text-sm">{message.content}</p>
      <p className="text-xs mt-1 text-gray-400">
        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  </div>
))}

          <div ref={messagesEndRef} />
        </CardContent>

        <CardFooter className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex w-full gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit">
              <SendIcon />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ChatPage;

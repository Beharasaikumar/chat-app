import React, { useState } from "react";
import ChatPage from "./ChatPage";
import LoginPage from "./LoginPage";
import { io } from 'socket.io-client';


const App = () => {
  const [currentUser, setCurrentUser] = useState(null);

  return currentUser ? (
    <ChatPage currentUser={currentUser} setCurrentUser={setCurrentUser} />
  ) : (
    <LoginPage setCurrentUser={setCurrentUser} />
  );
};

export default App;

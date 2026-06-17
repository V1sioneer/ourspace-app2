import React, { useState } from 'react';
import io from 'socket.io-client';
import Auth from './components/Auth';
import MainChat from './components/MainChat';

// Коннектимся к нашему Node.js бэкенду
const socket = io.connect('https://nzugf-31-40-123-26.run.pinggy-free.link');

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (username) => {
    setUser(username);
    socket.emit('join_user', username); // Сигнализируем серверу о новом юзере
  };

  return (
    <>
      {!user ? (
        <Auth onLogin={handleLogin} />
      ) : (
        <MainChat currentUser={user} socket={socket} />
      )}
    </>
  );
}
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors()); // Разрешаем фронтенду подключаться к бэкенду

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Разрешаем любые порты (и 5173, и 5174)
    methods: ["GET", "POST"]
  }
});

// Хранилище для активных юзеров (никнейм -> id сокета)
let onlineUsers = {};

io.on('connection', (socket) => {
  console.log(`Юзер подключился: ${socket.id}`);

  // Когда юзер логинится на фронте
  socket.on('join_user', (username) => {
    socket.username = username;
    onlineUsers[username] = socket.id;
    
    // Рассылаем всем обновленный список пользователей в сети
    io.emit('update_users', Object.keys(onlineUsers));
    console.log(`${username} зашёл в сеть`);
  });

  // Отправка сообщения
  socket.on('send_message', (data) => {
    // Ищем сокет того, кому отправляем сообщение
    const recipientSocketId = onlineUsers[data.room];
    if (recipientSocketId) {
      // Отправляем конкретно ему в приват
      socket.to(recipientSocketId).emit('receive_message', {
        sender: data.sender,
        text: data.text,
        room: data.sender // Для получателя комнатой будет тот, кто отправил
      });
    }
  });

  // Когда кто-то закрывает вкладку или выходит
  socket.on('disconnect', () => {
    if (socket.username) {
      delete onlineUsers[socket.username];
      io.emit('update_users', Object.keys(onlineUsers));
      console.log(`${socket.username} вышел из сети`);
    }
    console.log(`Юзер отключился: ${socket.id}`);
  });
});

// Запускаем на порту 3001
server.listen(3001, () => {
  console.log('БЭКЕНД СЕРВЕР ЗАПУЩЕН НА ПОРТУ 3001!');
});
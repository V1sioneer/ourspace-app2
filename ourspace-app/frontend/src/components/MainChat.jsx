import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiMessageSquare, FiUsers, FiPhone, FiMenu } from 'react-icons/fi';

export default function MainChat({ currentUser, socket }) {
  const [activeTab, setActiveTab] = useState('chats');
  // На мобилках изначально скрываем шторку, на ПК — показываем
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  // Слушаем события от сервера
  useEffect(() => {
    socket.on('update_users', (usersList) => {
      // Фильтруем список, чтобы не показывать самого себя в списке чатов
      const otherUsers = usersList.filter(u => u !== currentUser);
      setOnlineUsers(otherUsers);
    });

    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('update_users');
      socket.off('receive_message');
    };
  }, [socket, currentUser]);

  // Автоскролл к новому сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChat) return;

    const messageData = {
      sender: currentUser,
      text: messageText,
      room: selectedChat // Используем имя юзера как ID комнаты для тестов
    };

    // Отправляем на сервер
    socket.emit('send_message', messageData);
    
    // Добавляем себе в историю
    setMessages((prev) => [...prev, messageData]);
    setMessageText('');
  };

  return (
    <div className="flex h-screen bg-[#0f111a] text-[#e2e8f0] font-sans overflow-hidden relative">
      
      {/* Затемнение заднего фона для мобилок, когда шторка открыта */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* БОКОВАЯ ПАНЕЛЬ */}
      <motion.div 
        animate={{ width: isSidebarOpen ? '320px' : '0px', opacity: isSidebarOpen ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-[#151824] border-r border-[#222738] flex flex-col h-full overflow-hidden z-30 md:relative absolute inset-y-0 left-0"
      >
        <div className="p-4 flex items-center justify-between border-b border-[#222738]">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            OurSpace
          </h1>
          <div className="flex gap-2">
            <motion.button 
              whileHover={{ scale: 1.1, color: '#818cf8' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('chats')}
              className={`p-2 rounded-xl ${activeTab === 'chats' ? 'bg-[#222738] text-indigo-400' : 'text-gray-400'}`}
            >
              <FiMessageSquare size={20} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1, color: '#818cf8' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('groups')}
              className={`p-2 rounded-xl ${activeTab === 'groups' ? 'bg-[#222738] text-indigo-400' : 'text-gray-400'}`}
            >
              <FiUsers size={20} />
            </motion.button>
          </div>
        </div>

        {/* Список онлайн друзей */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {onlineUsers.length === 0 ? (
            <p className="text-xs text-gray-500 text-center mt-4">Никого нет в сети :(</p>
          ) : (
            onlineUsers.map((username, index) => (
              <motion.div
                key={index}
                whileHover={{ x: 6, backgroundColor: '#1e2335' }}
                onClick={() => {
                  setSelectedChat(username);
                  // Закрываем шторку на мобилках после выбора чата
                  if (window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                  }
                }}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${selectedChat === username ? 'bg-[#222738]' : ''}`}
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-md">
                    {username[0].toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#151824] rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{username}</h3>
                  <p className="text-xs text-green-400 truncate mt-0.5">онлайн</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* ОСНОВНОЕ ОКНО ЧАТА */}
      <div className="flex-1 flex flex-col h-full relative bg-[#0b0c14] z-0">
        
        {/* Хедер чата */}
        <div className="h-16 border-b border-[#222738] bg-[#151824] flex items-center justify-between px-4 z-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-400 hover:text-white">
              <FiMenu size={22} />
            </button>
            {selectedChat ? (
              <div>
                <h2 className="font-bold text-sm">{selectedChat}</h2>
                <p className="text-xs text-green-400">в сети</p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Выберите, кому написать</p>
            )}
          </div>

          {selectedChat && (
            <div className="flex gap-2">
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: '#22c55e' }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-xl bg-[#1e2335] text-white transition-colors"
              >
                <FiPhone size={18} />
              </motion.button>
            </div>
          )}
        </div>

        {/* Окно вывода сообщений */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {selectedChat ? (
            <div className="flex flex-col justify-end min-h-full space-y-2">
              {messages
                .filter(msg => msg.room === selectedChat || (msg.sender === selectedChat && msg.room === currentUser))
                .map((msg, index) => {
                  const isMe = msg.sender === currentUser;
                  return (
                    <div key={index} className={`flex items-end gap-2 max-w-[70%] ${isMe ? 'ml-auto' : ''}`}>
                      <div className={`p-3 rounded-2xl text-sm shadow-md ${
                        isMe 
                          ? 'rounded-br-none bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                          : 'rounded-bl-none bg-[#151824] border border-[#222738]'
                      }`}>
                        {!isMe && <p className="text-[10px] text-indigo-400 font-bold mb-0.5">{msg.sender}</p>}
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
              Выберите активного пользователя слева, чтобы начать флексить в чате!
            </div>
          )}
        </div>

        {/* Поле ввода сообщений */}
        {selectedChat && (
          <form onSubmit={handleSendMessage} className="p-4 bg-[#0f111a] border-t border-[#222738]">
            <div className="flex items-center gap-2 bg-[#151824] border border-[#222738] rounded-xl px-4 py-2 focus-within:border-indigo-500 transition-colors">
              <input 
                type="text" 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Напишите сообщение..." 
                className="bg-transparent flex-1 outline-none text-sm text-gray-200 placeholder-gray-500"
              />
              <motion.button 
                whileHover={{ scale: 1.1, x: 2 }}
                whileTap={{ scale: 0.9 }}
                type="submit"
                className="text-indigo-400 hover:text-indigo-300"
              >
                <FiSend size={18} />
              </motion.button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Auth({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#0f111a] p-4">
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        className="w-full max-w-md bg-[#151824] border border-[#222738] p-8 rounded-2xl shadow-2xl"
      >
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Войти в OurSpace
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Никнейм</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Твой ник..." 
              className="w-full bg-[#0b0c14] border border-[#222738] rounded-xl px-4 py-3 outline-none text-sm text-gray-200 focus:border-indigo-500 transition-colors"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Пароль</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-[#0b0c14] border border-[#222738] rounded-xl px-4 py-3 outline-none text-sm text-gray-200 focus:border-indigo-500 transition-colors"
              required
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-3 mt-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-colors"
          >
            Погнали
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
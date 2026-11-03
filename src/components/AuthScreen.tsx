import React, { useState } from 'react';

interface AuthScreenProps {
  onLogin: (email: string, pass: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(userEmail, password);
  };

  return (
    <div className="bg-[#0f0d13] min-h-screen text-white font-sans flex flex-col items-center justify-center p-6 selection:bg-orange-500">
      <div className="w-full max-w-sm bg-[#16131c] p-6 rounded-3xl border border-gray-800 shadow-2xl text-center">
        <h1 className="text-2xl font-black tracking-wider text-orange-500 mb-1">STORYVOID</h1>
        <p className="text-xs text-gray-400 mb-6">SERIALIZED AUDIO STREAMING</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="text-[11px] text-gray-400 block mb-1">Email Address</label>
            <input 
              type="email" 
              value={userEmail} 
              onChange={e => setUserEmail(e.target.value)}
              placeholder="Enter your email" 
              className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-xs text-white focus:border-orange-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="text-[11px] text-gray-400 block mb-1">Password / Admin Key</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password (Required for Admin)" 
              className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-xs text-white focus:border-orange-500 outline-none"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg mt-2 cursor-pointer"
          >
            Enter StoryVoid
          </button>
        </form>
      </div>
    </div>
  );
};

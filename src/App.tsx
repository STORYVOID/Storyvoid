import React, { useState } from 'react';

export function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'library' | 'profile'>('home');
  const [coins, setCoins] = useState<number>(10);

  const watchAdForCoins = () => {
    // Rewarded Ad Simulation (20 Free Coins)
    setCoins(prev => prev + 20);
    alert('🎉 Ad watched successfully! 20 coins added to your wallet.');
  };

  return (
    <div className="bg-[#0f0d13] min-h-screen text-white font-sans pb-24 selection:bg-orange-500 selection:text-white">
      {/* Top Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#121017]">
        <div>
          <h1 className="text-xl font-extrabold tracking-wider text-orange-500">STORYVOID</h1>
          <p className="text-[10px] text-gray-400">SERIALIZED AUDIO</p>
        </div>
        <div className="flex items-center bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
          <span className="text-yellow-400 mr-1.5">🟡</span>
          <span className="text-xs font-semibold">{coins} Coins</span>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'home' && (
        <div className="p-4">
          {/* Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden mb-6 bg-gradient-to-r from-purple-900 to-gray-900 p-5 border border-gray-800 shadow-lg">
            <span className="bg-orange-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Now Streaming
            </span>
            <h2 className="text-lg font-extrabold mt-3 mb-1">THE LAST BROADCAST</h2>
            <p className="text-xs text-gray-300 mb-4">Episode 1: Dead Air - Tune in if you dare.</p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-md">
              ▶ Play Episode 1
            </button>
          </div>

          {/* Ad Monetization Section for Free Coins */}
          <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 mb-6">
            <h3 className="text-xs font-bold mb-1 text-yellow-400 uppercase tracking-wide">🟡 Earn Free Coins</h3>
            <p className="text-[11px] text-gray-300 mb-3">Watch a short rewarded ad to get 20 free coins and unlock thriller episodes.</p>
            <button 
              onClick={watchAdForCoins}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded-xl text-xs transition-all"
            >
              Watch Rewarded Ad (+20 Coins)
            </button>
          </div>

          {/* Genres / Stories */}
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide mb-3">Trending Audio Series</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#16131c] rounded-xl p-2.5 border border-gray-800">
              <div className="h-32 rounded-lg bg-gray-800 mb-2 overflow-hidden flex items-center justify-center text-gray-500 text-xs">
                Cover Art
              </div>
              <h4 className="text-xs font-bold truncate">Reborn: Infinite Dungeon</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Thriller · 5 eps</p>
            </div>
            <div className="bg-[#16131c] rounded-xl p-2.5 border border-gray-800">
              <div className="h-32 rounded-lg bg-gray-800 mb-2 overflow-hidden flex items-center justify-center text-gray-500 text-xs">
                Cover Art
              </div>
              <h4 className="text-xs font-bold truncate">Dark Void</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Dark Fantasy · 3 eps</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="p-4 text-center">
          <h2 className="text-lg font-bold text-orange-500 mb-3">Search Stories</h2>
          <input 
            type="text" 
            placeholder="Search audio thrillers..." 
            className="w-full bg-[#16131c] border border-gray-800 rounded-xl p-3 text-xs text-white"
          />
        </div>
      )}

      {activeTab === 'library' && (
        <div className="p-4">
          <h2 className="text-lg font-bold text-orange-500 mb-1">Your Library</h2>
          <p className="text-xs text-gray-400">No saved stories yet.</p>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="p-4">
          <h2 className="text-lg font-bold text-orange-500 mb-3">Admin & Profile</h2>
          <div className="bg-[#16131c] p-4 rounded-xl border border-gray-800 mb-3">
            <p className="text-xs text-gray-400">Logged in as Admin</p>
            <p className="text-sm font-bold text-orange-400">divyadev200722@gmail.com</p>
          </div>
          <div className="bg-[#16131c] p-4 rounded-xl border border-gray-800">
            <p className="text-xs text-gray-400">Wallet Balance</p>
            <p className="text-base font-bold text-yellow-400">🟡 {coins} Coins</p>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#121017] border-t border-gray-800 flex justify-around py-3 px-2 z-50">
        <button 
          onClick={() => setActiveTab('home')} 
          className={`flex flex-col items-center text-xs ${activeTab === 'home' ? 'text-orange-500 font-bold' : 'text-gray-400'}`}
        >
          <span>🏠</span>
          <span className="text-[10px] mt-1">HOME</span>
        </button>
        <button 
          onClick={() => setActiveTab('search')} 
          className={`flex flex-col items-center text-xs ${activeTab === 'search' ? 'text-orange-500 font-bold' : 'text-gray-400'}`}
        >
          <span>🔍</span>
          <span className="text-[10px] mt-1">SEARCH</span>
        </button>
        <button 
          onClick={() => setActiveTab('library')} 
          className={`flex flex-col items-center text-xs ${activeTab === 'library' ? 'text-orange-500 font-bold' : 'text-gray-400'}`}
        >
          <span>📚</span>
          <span className="text-[10px] mt-1">LIBRARY</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`flex flex-col items-center text-xs ${activeTab === 'profile' ? 'text-orange-500 font-bold' : 'text-gray-400'}`}
        >
          <span>👤</span>
          <span className="text-[10px] mt-1">PROFILE</span>
        </button>
      </div>
    </div>
  );
}
export default App;

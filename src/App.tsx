import React, { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { Story } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'library' | 'profile' | 'admin'>('home');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  // Tera Admin Email check karne ke liye (Profile/Admin ke liye)
  const isAdmin = true; // Tu direct admin access rakh sakta hai apne app ke liye

  return (
    <div className="bg-[#0f0d13] min-h-screen text-white font-sans selection:bg-orange-500 selection:text-white">
      {/* Dynamic Screen Rendering */}
      {activeTab === 'home' && (
        <HomeScreen onSelectStory={(story) => setSelectedStory(story)} />
      )}

      {activeTab === 'search' && (
        <div className="p-4 text-center pb-24">
          <h2 className="text-xl font-bold text-orange-500 mb-2">Search Stories</h2>
          <input 
            type="text" 
            placeholder="Search stories, episodes, genres..." 
            className="w-full bg-[#16131c] border border-gray-800 rounded-xl p-3 text-xs text-white mt-3"
          />
          <p className="text-xs text-gray-500 mt-6">Type to find your next audio thriller.</p>
        </div>
      )}

      {activeTab === 'library' && (
        <div className="p-4 pb-24">
          <h2 className="text-xl font-bold text-orange-500 mb-1">Your Library</h2>
          <p className="text-xs text-gray-400 mb-4">Saved worlds and unfinished journeys.</p>
          <div className="bg-[#16131c] p-4 rounded-xl border border-gray-800 text-center">
            <p className="text-xs text-gray-400">No followed stories yet. Explore home to add some!</p>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="p-4 pb-24">
          <h2 className="text-xl font-bold text-orange-500 mb-4">Profile & Credits</h2>
          <div className="bg-[#16131c] p-4 rounded-xl border border-gray-800 mb-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400">StoryVoid Credits</p>
              <p className="text-lg font-bold text-yellow-400">🟡 10 Credits</p>
            </div>
            <button 
              onClick={() => setActiveTab('admin')} 
              className="bg-orange-500 text-white text-xs px-3 py-2 rounded-lg font-bold"
            >
              Admin Panel ⚙️
            </button>
          </div>
        </div>
      )}

      {activeTab === 'admin' && <AdminDashboard />}

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
          className={`flex flex-col items-center text-xs ${activeTab === 'profile' || activeTab === 'admin' ? 'text-orange-500 font-bold' : 'text-gray-400'}`}
        >
          <span>👤</span>
          <span className="text-[10px] mt-1">PROFILE</span>
        </button>
      </div>
    </div>
  );
}
export default App;

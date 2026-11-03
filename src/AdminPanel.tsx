import React, { useState } from 'react';
import { AddEpisodeTab } from './components/admin/AddEpisodeTab';
import { NewStoryTab } from './components/admin/NewStoryTab';
import { ManageTab } from './components/admin/ManageTab';
import { UsersTab } from './components/admin/UsersTab';

interface AdminPanelProps {
  stories: any[];
  fetchStories: () => void;
  setSuccessMessage: (msg: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ stories, fetchStories, setSuccessMessage }) => {
  const [activeTab, setActiveTab] = useState<'episode' | 'new' | 'manage' | 'featured' | 'users'>('users');
  
  const [selectedFeaturedTitle, setSelectedFeaturedTitle] = useState(() => {
    return localStorage.getItem('storyvoid_featured_title') || '';
  });

  const uniqueSeriesList = Array.from(new Set(stories.map(s => s.title)));

  const handleSaveFeatured = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('storyvoid_featured_title', selectedFeaturedTitle);
    setSuccessMessage('⭐ Featured Banner successfully updated on Home screen!');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-16">
      <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 text-center shadow-lg">
        <h2 className="text-sm font-black text-orange-500 tracking-wider">🛠️ STORYVOID ADMIN COMMAND CENTER</h2>
        <p className="text-[10px] text-gray-400 mt-0.5">Manage your audio series, users & banners</p>
      </div>

      <div className="grid grid-cols-5 gap-1 bg-[#16131c] p-1.5 rounded-xl border border-gray-800 text-[10px]">
        <button 
          onClick={() => setActiveTab('episode')}
          className={`py-2 font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'episode' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          🎧 Episode
        </button>
        <button 
          onClick={() => setActiveTab('new')}
          className={`py-2 font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'new' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          ➕ Story
        </button>
        <button 
          onClick={() => setActiveTab('featured')}
          className={`py-2 font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'featured' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          ⭐ Banner
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`py-2 font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'users' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          👥 Users
        </button>
        <button 
          onClick={() => setActiveTab('manage')}
          className={`py-2 font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'manage' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          ⚙️ Manage
        </button>
      </div>

      {activeTab === 'episode' && (
        <AddEpisodeTab stories={stories} fetchStories={fetchStories} setSuccessMessage={setSuccessMessage} />
      )}

      {activeTab === 'new' && (
        <NewStoryTab fetchStories={fetchStories} setSuccessMessage={setSuccessMessage} />
      )}

      {activeTab === 'featured' && (
        <form onSubmit={handleSaveFeatured} className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 space-y-4 shadow-lg">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide">⭐ Set Home Featured / Trending Banner</h3>
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Select Featured Story</label>
            <select 
              value={selectedFeaturedTitle}
              onChange={e => setSelectedFeaturedTitle(e.target.value)}
              className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
            >
              <option value="">-- None (Hide Banner) --</option>
              {uniqueSeriesList.map((title: any, idx) => (
                <option key={idx} value={title}>{title}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs shadow-lg cursor-pointer">
            ✨ Save Featured Banner
          </button>
        </form>
      )}

      {activeTab === 'users' && (
        <UsersTab />
      )}

      {activeTab === 'manage' && (
        <ManageTab stories={stories} />
      )}
    </div>
  );
};

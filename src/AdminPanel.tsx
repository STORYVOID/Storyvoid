import React, { useState } from 'react';
import { AddEpisodeTab } from './components/admin/AddEpisodeTab';
import { NewStoryTab } from './components/admin/NewStoryTab';
import { ManageTab } from './components/admin/ManageTab';

interface AdminPanelProps {
  stories: any[];
  fetchStories: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ stories, fetchStories }) => {
  const [activeTab, setActiveTab] = useState<'new' | 'episode' | 'manage'>('episode');
  const [successMessage, setSuccessMessage] = useState('');

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-16">
      <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 text-center shadow-lg">
        <h2 className="text-sm font-black text-orange-500 tracking-wider">🛠️ STORYVOID ADMIN COMMAND CENTER</h2>
        <p className="text-[10px] text-gray-400 mt-0.5">Manage your audio series and episodes</p>
      </div>

      {successMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 p-3 rounded-xl text-xs text-center font-bold animate-fadeIn">
          {successMessage}
        </div>
      )}

      <div className="flex space-x-2 bg-[#16131c] p-1.5 rounded-xl border border-gray-800">
        <button 
          onClick={() => setActiveTab('episode')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'episode' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          🎧 Add Episode
        </button>
        <button 
          onClick={() => setActiveTab('new')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'new' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          ➕ New Story
        </button>
        <button 
          onClick={() => setActiveTab('manage')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'manage' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
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

      {activeTab === 'manage' && (
        <ManageTab stories={stories} />
      )}
    </div>
  );
};

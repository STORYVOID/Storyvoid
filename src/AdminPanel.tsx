import React, { useState } from 'react';
import { supabase } from './supabaseClient';

interface AdminPanelProps {
  stories: any[];
  fetchStories: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ stories, fetchStories }) => {
  const [activeSubTab, setActiveSubTab] = useState<'new' | 'episode' | 'manage'>('episode');
  
  // New Episode Form States
  const [selectedSeriesTitle, setSelectedSeriesTitle] = useState('');
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [coinPrice, setCoinPrice] = useState('10');
  const [audioUrl, setAudioUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // New Story Form States
  const [newTitle, setNewTitle] = useState('');
  const [newGenre, setNewGenre] = useState('Thriller');
  const [newDesc, setNewDesc] = useState('');
  const [newPosterUrl, setNewPosterUrl] = useState('');

  const uniqueSeriesList = Array.from(new Set(stories.map(s => s.title)));

  const handlePublishClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeriesTitle || !episodeTitle || !audioUrl) {
      alert('Bhai, sabhi fields bharna zaroori hai!');
      return;
    }
    // Confirmation popup dikhane ke liye
    setShowConfirmModal(true);
  };

  const confirmAndPublishEpisode = async () => {
    try {
      setUploading(true);
      setShowConfirmModal(false);

      const { error } = await supabase.from('stories').insert([
        {
          title: selectedSeriesTitle,
          episode_title: episodeTitle,
          coin_price: Number(coinPrice),
          audio_url: audioUrl,
          genre: stories.find(s => s.title === selectedSeriesTitle)?.genre || 'Thriller',
          description: stories.find(s => s.title === selectedSeriesTitle)?.description || '',
          poster_url: stories.find(s => s.title === selectedSeriesTitle)?.poster_url || ''
        }
      ]);

      if (error) throw error;

      alert('🎉 Episode successfully publish ho gaya hai!');
      setEpisodeTitle('');
      setAudioUrl('');
      fetchStories();
    } catch (err) {
      console.error('Error publishing episode:', err);
      alert('❌ Episode publish karne me error aayi hai.');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAudioUrlCheck()) { // simple check
      // ...
    }
    // New story logic here if needed
  };

  const explicitAudioCheck = () => {
    return true;
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-16">
      <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 text-center">
        <h2 className="text-sm font-black text-orange-500 tracking-wider">🛠️ STORYVOID ADMIN COMMAND CENTER</h2>
      </div>

      <div className="flex space-x-2 bg-[#16131c] p-1.5 rounded-xl border border-gray-800">
        <button 
          onClick={() => setActiveSubTab('episode')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer ${activeSubTab === 'episode' ? 'bg-orange-500 text-white' : 'text-gray-400'}`}
        >
          Add Episode
        </button>
        <button 
          onClick={() => setActiveSubTab('new')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer ${activeSubTab === 'new' ? 'bg-orange-500 text-white' : 'text-gray-400'}`}
        >
          New Story
        </button>
      </div>

      {activeSubTab === 'episode' && (
        <form onSubmit={handlePublishClick} className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="text-xs font-bold text-gray-300 uppercase">Publish Episode to Series</h3>

          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Select Story Series</label>
            <select 
              value={selectedSeriesTitle}
              onChange={e => setSelectedSeriesTitle(e.target.value)}
              className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
              required
            >
              <option value="">-- Choose Series --</option>
              {uniqueSeriesList.map((title: any, idx) => (
                <option key={idx} value={title}>{title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Episode Title</label>
            <input 
              type="text" 
              value={episodeTitle} 
              onChange={e => setEpisodeTitle(e.target.value)}
              placeholder="Jaise: Episode 3: Maut Ka Safar" 
              className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Coin Price (0 = Free)</label>
            <input 
              type="number" 
              value={coinPrice} 
              onChange={e => setCoinPrice(e.target.value)}
              className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Audio URL (Supabase / MP3 Link)</label>
            <input 
              type="text" 
              value={audioUrl} 
              onChange={e => setAudioUrl(e.target.value)}
              placeholder="https://..." 
              className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={uploading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg cursor-pointer"
          >
            {uploading ? 'Publishing...' : '🚀 Publish Episode'}
          </button>
        </form>
      )}

      {/* Admin Publish Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1721] border border-orange-500/50 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Confirm Publish</h3>
              <p className="text-xs text-gray-300 mt-1">
                Kya aap yeh episode <span className="text-orange-400 font-bold">{selectedSeriesTitle}</span> me publish karna chahte hain?
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAndPublishEpisode}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2.5 rounded-xl shadow-lg cursor-pointer"
              >
                Yes, Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
            

import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

interface AdminPanelProps {
  stories: any[];
  fetchStories: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ stories, fetchStories }) => {
  const [activeTab, setActiveTab] = useState<'new' | 'episode' | 'manage'>('episode');
  
  // New Episode States
  const [selectedStoryTitle, setSelectedStoryTitle] = useState('');
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [coinPrice, setCoinPrice] = useState('10');
  const [audioUrl, setAudioUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // New Story States
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Fantasy');
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [creatingStory, setCreatingStory] = useState(false);

  const uniqueSeriesList = Array.from(new Set(stories.map(s => s.title)));

  const handleAddEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoryTitle || !episodeTitle || !audioUrl) {
      alert('Bhai, sabhi fields bharna zaroori hai!');
      return;
    }

    try {
      setUploading(true);
      const selectedStoryRef = stories.find(s => s.title === selectedStoryTitle);

      const { error } = await supabase.from('stories').insert([
        {
          title: selectedStoryTitle,
          episode_title: episodeTitle,
          coin_price: Number(coinPrice),
          audio_url: audioUrl,
          genre: selectedStoryRef?.genre || 'Thriller',
          description: selectedStoryRef?.description || '',
          poster_url: selectedStoryRef?.poster_url || ''
        }
      ]);

      if (error) throw error;

      setSuccessMessage('🎉 Episode successfully published!');
      setEpisodeTitle('');
      setAudioUrl('');
      fetchStories();

      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error adding episode:', err);
      alert('❌ Error adding episode.');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateNewStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !posterUrl) {
      alert('Title aur Poster URL dena zaroori hai!');
      return;
    }

    try {
      setCreatingStory(true);
      const { error } = await supabase.from('stories').insert([
        {
          title: title,
          episode_title: 'Episode 1: Pilot',
          coin_price: 0,
          audio_url: audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          genre: genre,
          description: description,
          poster_url: posterUrl
        }
      ]);

      if (error) throw error;

      setSuccessMessage('🎉 New Story created successfully!');
      setTitle('');
      setDescription('');
      setPosterUrl('');
      setAudioUrl('');
      fetchStories();

      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error creating story:', err);
      alert('❌ Error creating story.');
    } finally {
      setCreatingStory(false);
    }
  };

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
        <form onSubmit={handleAddEpisode} className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 space-y-4 shadow-lg">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide">Publish Episode to Series</h3>

          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Select Story Series</label>
            <select 
              value={selectedStoryTitle}
              onChange={e => setSelectedStoryTitle(e.target.value)}
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
              placeholder="e.g. Episode 2: The Return" 
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

      {activeTab === 'new' && (
        <form onSubmit={handleCreateNewStory} className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 space-y-4 shadow-lg">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide">Create New Story Series</h3>

          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Series Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Dark Void" 
              className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Genre</label>
            <select 
              value={genre}
              onChange={e => setGenre(e.target.value)}
              className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
            >
              <option value="Thriller">Thriller</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Horror">Horror</option>
              <option value="Romance">Romance</option>
              <option value="Mystery">Mystery</option>
              <option value="Sci-Fi">Sci-Fi</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief summary of the story..." 
              className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500 h-20 resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Poster Image URL</label>
            <input 
              type="text" 
              value={posterUrl} 
              onChange={e => setPosterUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..." 
              className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={creatingStory}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg cursor-pointer"
          >
            {creatingStory ? 'Creating...' : '✨ Create Series'}
          </button>
        </form>
      )}

      {activeTab === 'manage' && (
        <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 space-y-3 shadow-lg">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide">Manage Series ({uniqueSeriesList.length})</h3>
          <p className="text-[11px] text-gray-400">Total episodes in database: {stories.length}</p>
          <div className="space-y-2 pt-2">
            {uniqueSeriesList.map((seriesTitle: any, idx) => (
              <div key={idx} className="bg-[#0f0d13] p-3 rounded-xl border border-gray-800 flex justify-between items-center">
                <span className="text-xs font-bold text-white">{seriesTitle}</span>
                <span className="text-[10px] bg-orange-900/60 text-orange-300 px-2 py-0.5 rounded-full font-semibold">
                  {stories.filter(s => s.title === seriesTitle).length} Episodes
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
          

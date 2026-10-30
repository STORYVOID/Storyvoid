import React, { useState } from 'react';
import { supabase } from './supabaseClient';

interface AdminPanelProps {
  stories: any[];
  fetchStories: () => void;
}

export function AdminPanel({ stories, fetchStories }: AdminPanelProps) {
  // Admin Navigation Sub-Tabs ('add-story' | 'manage-stories' | 'add-episode')
  const [adminTab, setAdminTab] = useState<'add-story' | 'manage-stories' | 'add-episode'>('add-story');

  // Form 1: New Story Series State
  const [storyTitle, setStoryTitle] = useState('');
  const [genre, setGenre] = useState('Thriller');
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [savingStory, setSavingStory] = useState(false);

  // Form 2: Add Episode State
  const [selectedSeriesForEp, setSelectedSeriesForEp] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState<number>(1);
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [coinPrice, setCoinPrice] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState('');
  const [publishingEp, setPublishingEp] = useState(false);

  // Unique series list nikalne ke liye
  const uniqueSeriesMap = new Map();
  stories.forEach(item => {
    if (item.title && !uniqueSeriesMap.has(item.title)) {
      uniqueSeriesMap.set(item.title, {
        title: item.title,
        genre: item.genre,
        description: item.description,
        poster_url: item.poster_url || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400',
      });
    }
  });
  const uniqueSeriesList = Array.from(uniqueSeriesMap.values());

  // 1. Create New Story Series
  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyTitle || !posterUrl) {
      alert('Please enter Story Title and Poster Image URL!');
      return;
    }

    setSavingStory(true);
    try {
      const { error } = await supabase.from('stories').insert([
        { 
          title: storyTitle, 
          genre, 
          description, 
          poster_url: posterUrl,
          episode_title: 'Trailer / Intro',
          coin_price: 0,
          audio_url: ''
        },
      ]);

      if (error) throw error;

      alert('🎉 New Story Series created successfully with Poster!');
      setStoryTitle('');
      setDescription('');
      setPosterUrl('');
      fetchStories();
    } catch (err: any) {
      alert('Error creating story: ' + err.message);
    } finally {
      setSavingStory(false);
    }
  };

  // 2. Publish Episode
  const handlePublishEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeriesForEp || !episodeTitle) {
      alert('Please select a story series and enter episode title!');
      return;
    }

    const parentStory = stories.find(s => s.title === selectedSeriesForEp);

    setPublishingEp(true);
    try {
      const { error } = await supabase.from('stories').insert([
        { 
          title: selectedSeriesForEp, 
          genre: parentStory?.genre || 'Thriller', 
          description: parentStory?.description || '', 
          poster_url: parentStory?.poster_url || '',
          episode_title: `Episode ${episodeNumber}: ${episodeTitle}`, 
          episode_number: episodeNumber,
          audio_url: audioUrl,
          coin_price: coinPrice 
        },
      ]);

      if (error) throw error;

      alert('🚀 Episode published successfully!');
      setEpisodeTitle('');
      setAudioUrl('');
      setCoinPrice(0);
      setEpisodeNumber(prev => prev + 1);
      fetchStories();
    } catch (err: any) {
      alert('Error publishing episode: ' + err.message);
    } finally {
      setPublishingEp(false);
    }
  };

  // 3. Delete Entire Story Series or Episode
  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const { error } = await supabase.from('stories').delete().eq('id', id);
      if (error) throw error;
      alert('🗑️ Deleted successfully!');
      fetchStories();
    } catch (err: any) {
      alert('Error deleting: ' + err.message);
    }
  };

  return (
    <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 shadow-xl max-w-md mx-auto my-4 space-y-4">
      <h2 className="text-base font-extrabold text-orange-500 uppercase tracking-wider text-center">
        🛠️ StoryVoid Admin Command Center
      </h2>

      {/* Admin Sub-Navigation Tabs */}
      <div className="flex bg-[#0f0d13] p-1 rounded-xl border border-gray-800 text-[11px] font-bold justify-around">
        <button 
          onClick={() => setAdminTab('add-story')}
          className={`py-2 px-3 rounded-lg transition-all cursor-pointer ${adminTab === 'add-story' ? 'bg-orange-500 text-white' : 'text-gray-400'}`}
        >
          ➕ New Story
        </button>
        <button 
          onClick={() => setAdminTab('add-episode')}
          className={`py-2 px-3 rounded-lg transition-all cursor-pointer ${adminTab === 'add-episode' ? 'bg-orange-500 text-white' : 'text-gray-400'}`}
        >
          🎧 Add Episode
        </button>
        <button 
          onClick={() => setAdminTab('manage-stories')}
          className={`py-2 px-3 rounded-lg transition-all cursor-pointer ${adminTab === 'manage-stories' ? 'bg-orange-500 text-white' : 'text-gray-400'}`}
        >
          ⚙️ Manage
        </button>
      </div>

      {/* TAB 1: CREATE NEW STORY SERIES WITH POSTER */}
      {adminTab === 'add-story' && (
        <form onSubmit={handleCreateStory} className="space-y-3 bg-[#0f0d13] p-4 rounded-xl border border-gray-800">
          <h3 className="text-xs font-bold text-orange-400 uppercase">Create New Story Series</h3>
          
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Story Series Name</label>
            <input 
              type="text" 
              value={storyTitle} 
              onChange={e => setStoryTitle(e.target.value)}
              placeholder="e.g. Dark Void / Ulti Duniya" 
              className="w-full bg-[#16131c] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Genre</label>
            <select 
              value={genre} 
              onChange={e => setGenre(e.target.value)}
              className="w-full bg-[#16131c] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500"
            >
              <option value="Thriller">Thriller</option>
              <option value="Dark Fantasy">Dark Fantasy</option>
              <option value="Romance">Romance</option>
              <option value="Horror">Horror</option>
              <option value="Comedy">Comedy</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Poster Image URL (Direct Image Link)</label>
            <input 
              type="text" 
              value={posterUrl} 
              onChange={e => setPosterUrl(e.target.value)}
              placeholder="Paste image URL (https://...)" 
              className="w-full bg-[#16131c] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Story Description / Summary</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter summary of the story..." 
              className="w-full bg-[#16131c] border border-gray-800 rounded-xl p-2.5 text-xs text-white h-20 outline-none focus:border-orange-500"
            />
          </div>

          <button 
            type="submit" 
            disabled={savingStory}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer"
          >
            {savingStory ? 'Creating Story...' : '💾 Save New Story Series'}
          </button>
        </form>
      )}

      {/* TAB 2: ADD EPISODES TO SELECTED STORY */}
      {adminTab === 'add-episode' && (
        <form onSubmit={handlePublishEpisode} className="space-y-3 bg-[#0f0d13] p-4 rounded-xl border border-gray-800">
          <h3 className="text-xs font-bold text-orange-400 uppercase">Publish Episode to Series</h3>

          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Select Story Series</label>
            <select 
              value={selectedSeriesForEp} 
              onChange={e => setSelectedSeriesForEp(e.target.value)}
              className="w-full bg-[#16131c] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500"
              required
            >
              <option value="">-- Choose Series --</option>
              {uniqueSeriesList.map((s, i) => (
                <option key={i} value={s.title}>{s.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Episode Number</label>
              <input 
                type="number" 
                value={episodeNumber} 
                onChange={e => setEpisodeNumber(Number(e.target.value))}
                className="w-full bg-[#16131c] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none"
                min="1"
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Coin Price (0 = Free)</label>
              <input 
                type="number" 
                value={coinPrice} 
                onChange={e => setCoinPrice(Number(e.target.value))}
                className="w-full bg-[#16131c] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Episode Subtitle / Title</label>
            <input 
              type="text" 
              value={episodeTitle} 
              onChange={e => setEpisodeTitle(e.target.value)}
              placeholder="e.g. Dead Air / The Signal" 
              className="w-full bg-[#16131c] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Audio / Stream URL (.mp3)</label>
            <input 
              type="text" 
              value={audioUrl} 
              onChange={e => setAudioUrl(e.target.value)}
              placeholder="Paste direct audio stream URL" 
              className="w-full bg-[#16131c] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500"
            />
          </div>

          <button 
            type="submit" 
            disabled={publishingEp}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer"
          >
            {publishingEp ? 'Publishing...' : '🚀 Publish Episode'}
          </button>
        </form>
      )}

      {/* TAB 3: MANAGE / DELETE STORIES & EPISODES */}
      {adminTab === 'manage-stories' && (
        <div className="space-y-2 bg-[#0f0d13] p-4 rounded-xl border border-gray-800 max-h-64 overflow-y-auto">
          <h3 className="text-xs font-bold text-orange-400 uppercase mb-2">Existing Database Entries</h3>
          {stories.length === 0 ? (
            <p className="text-[11px] text-gray-500">No entries found.</p>
          ) : (
            stories.map((item) => (
              <div key={item.id} className="bg-[#16131c] p-2.5 rounded-xl border border-gray-800 flex justify-between items-center text-xs">
                <div className="truncate pr-2">
                  <p className="font-bold text-white truncate">{item.title}</p>
                  <p className="text-[10px] text-orange-400 truncate">{item.episode_title || 'Series Header'}</p>
                </div>
                <button 
                  onClick={() => handleDeleteItem(item.id, item.episode_title || item.title)}
                  className="bg-red-900/50 hover:bg-red-900 text-red-300 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-red-800 cursor-pointer shrink-0"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
          

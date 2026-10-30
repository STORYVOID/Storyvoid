import React, { useState } from 'react';
import { supabase } from './supabaseClient';

interface AdminPanelProps {
  stories: any[];
  fetchStories: () => void;
}

export function AdminPanel({ stories, fetchStories }: AdminPanelProps) {
  const [selectedSeries, setSelectedSeries] = useState('');
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [coinPrice, setCoinPrice] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState('');
  const [publishing, setPublishing] = useState(false);

  // Unique series list extract karne ke liye
  const uniqueSeriesMap = new Map();
  stories.forEach(item => {
    if (!uniqueSeriesMap.has(item.title)) {
      uniqueSeriesMap.set(item.title, {
        title: item.title,
        genre: item.genre,
        description: item.description,
        poster_url: item.poster_url || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400',
      });
    }
  });
  const uniqueSeriesList = Array.from(uniqueSeriesMap.values());

  const handlePublishEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeries || !episodeTitle) {
      alert('Please select a story series and enter episode title!');
      return;
    }

    const parentStory = stories.find(s => s.title === selectedSeries);

    setPublishing(true);
    try {
      const { error } = await supabase.from('stories').insert([
        { 
          title: selectedSeries, 
          genre: parentStory?.genre || 'Thriller', 
          description: parentStory?.description || '', 
          poster_url: parentStory?.poster_url || '',
          episode_title: episodeTitle, 
          audio_url: audioUrl,
          coin_price: coinPrice 
        },
      ]);

      if (error) throw error;

      alert('🚀 Episode published successfully!');
      setEpisodeTitle('');
      setAudioUrl('');
      setCoinPrice(0);
      fetchStories();
    } catch (err: any) {
      alert('Error publishing: ' + err.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="bg-[#16131c] p-5 rounded-2xl border border-gray-800 shadow-xl max-w-md mx-auto my-4">
      <h2 className="text-base font-extrabold text-orange-500 mb-4 uppercase tracking-wider">
        🛠️ Admin Episode Publisher
      </h2>

      <form onSubmit={handlePublishEpisode} className="space-y-3">
        <div>
          <label className="text-[11px] text-gray-400 block mb-1">Select Story Series</label>
          <select 
            value={selectedSeries} 
            onChange={e => setSelectedSeries(e.target.value)}
            className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500"
            required
          >
            <option value="">-- Choose Series --</option>
            {uniqueSeriesList.map((s, i) => (
              <option key={i} value={s.title}>{s.title}</option>
            ))}
            <option value="The Last Broadcast">The Last Broadcast</option>
            <option value="Ulti Duniya">Ulti Duniya</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] text-gray-400 block mb-1">Episode Title (e.g. Episode 2: The Signal)</label>
          <input 
            type="text" 
            value={episodeTitle} 
            onChange={e => setEpisodeTitle(e.target.value)}
            placeholder="Enter episode title" 
            className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500"
            required
          />
        </div>

        <div>
          <label className="text-[11px] text-gray-400 block mb-1">Coin Price (0 for Free)</label>
          <input 
            type="number" 
            value={coinPrice} 
            onChange={e => setCoinPrice(Number(e.target.value))}
            placeholder="e.g. 15" 
            className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500"
            min="0"
          />
        </div>

        <div>
          <label className="text-[11px] text-gray-400 block mb-1">Audio / Stream URL</label>
          <input 
            type="text" 
            value={audioUrl} 
            onChange={e => setAudioUrl(e.target.value)}
            placeholder="Paste mp3 or audio link" 
            className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500"
          />
        </div>

        <button 
          type="submit" 
          disabled={publishing}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all mt-2 shadow-md cursor-pointer"
        >
          {publishing ? 'Publishing...' : 'Publish Episode Now'}
        </button>
      </form>
    </div>
  );
}

export default AdminPanel;
      

import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

interface AddEpisodeTabProps {
  stories: any[];
  fetchStories: () => void;
  setSuccessMessage: (msg: string) => void;
}

export const AddEpisodeTab: React.FC<AddEpisodeTabProps> = ({ stories, fetchStories, setSuccessMessage }) => {
  const [selectedStoryTitle, setSelectedStoryTitle] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState('1');
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [coinPrice, setCoinPrice] = useState('10');
  const [audioUrl, setAudioUrl] = useState('');
  const [uploading, setUploading] = useState(false);

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

      // Agar user ne title me pehle se "Episode X" likha hai toh duplicate na ho, seedha clean format save ho
      const cleanTitle = episodeTitle.replace(/^episode\s*\d+[:\s]*/i, '').trim();
      const formattedEpisodeTitle = `Episode ${episodeNumber}: ${cleanTitle}`;

      const { error } = await supabase.from('stories').insert([
        {
          title: selectedStoryTitle,
          episode_title: formattedEpisodeTitle,
          coin_price: Number(coinPrice),
          audio_url: audioUrl,
          genre: selectedStoryRef?.genre || 'Thriller',
          description: selectedStoryRef?.description || '',
          poster_url: selectedStoryRef?.poster_url || ''
        }
      ]);

      if (error) throw error;

      setSuccessMessage('🎉 Episode successfully published!');
      setEpisodeNumber(String(Number(episodeNumber) + 1));
      setEpisodeTitle('');
      setAudioUrl('');
      fetchStories();

      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      console.error('Error adding episode:', err);
      alert(`❌ Error adding episode: ${err.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
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
        <label className="text-[10px] text-gray-400 block mb-1">Episode Number (e.g. 1, 2, 3)</label>
        <input 
          type="number" 
          value={episodeNumber} 
          onChange={e => setEpisodeNumber(e.target.value)}
          placeholder="1" 
          className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
          required
        />
      </div>

      <div>
        <label className="text-[10px] text-gray-400 block mb-1">Episode Title / Name (e.g. Pilot, Runnn)</label>
        <input 
          type="text" 
          value={episodeTitle} 
          onChange={e => setEpisodeTitle(e.target.value)}
          placeholder="e.g. Pilot" 
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
  );
};
    

import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

interface ManageTabProps {
  stories: any[];
  fetchStories: () => void;
}

export const ManageTab: React.FC<ManageTabProps> = ({ stories, fetchStories }) => {
  const [selectedSeriesTitle, setSelectedSeriesTitle] = useState<string | null>(null);
  const [editingPoster, setEditingPoster] = useState('');
  const [editingDescription, setEditingDescription] = useState('');

  const uniqueSeriesMap = new Map();
  stories.forEach(item => {
    if (item.title && !uniqueSeriesMap.has(item.title)) {
      uniqueSeriesMap.set(item.title, {
        title: item.title,
        genre: item.genre || 'Thriller',
        description: item.description,
        poster_url: item.poster_url || '',
      });
    }
  });
  const uniqueSeriesList = Array.from(uniqueSeriesMap.values());

  const seriesEpisodes = stories.filter(s => s.title === selectedSeriesTitle);
  const currentSeriesMeta = uniqueSeriesMap.get(selectedSeriesTitle);

  // Episode Delete karne ke liye
  const handleDeleteEpisode = async (episodeId: string) => {
    if (!window.confirm('Kya aap sach me is episode ko delete karna chahte hain?')) return;

    try {
      const { error } = await supabase.from('stories').delete().eq('id', episodeId);
      if (error) throw error;
      alert('🗑️ Episode successfully deleted!');
      fetchStories();
    } catch (err) {
      console.error('Error deleting episode:', err);
      alert('❌ Error deleting episode.');
    }
  };

  // Poori Series delete karne ke liye
  const handleDeleteFullSeries = async (title: string) => {
    if (!window.confirm(`⚠️ WARNING: Kya aap "${title}" aur iske saare episodes ko hamesha ke liye delete karna chahte hain?`)) return;

    try {
      const { error } = await supabase.from('stories').delete().eq('title', title);
      if (error) throw error;
      alert('🗑️ Series successfully deleted!');
      setSelectedSeriesTitle(null);
      fetchStories();
    } catch (err) {
      console.error('Error deleting series:', err);
      alert('❌ Error deleting series.');
    }
  };

  // Series details (Poster / Description) update karne ke liye
  const handleUpdateSeriesMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeriesTitle) return;

    try {
      const { error } = await supabase
        .from('stories')
        .update({
          poster_url: editingPoster || currentSeriesMeta?.poster_url,
          description: editingDescription || currentSeriesMeta?.description,
        })
        .eq('title', selectedSeriesTitle);

      if (error) throw error;
      alert('✨ Series details successfully updated!');
      fetchStories();
    } catch (err) {
      console.error('Error updating series:', err);
      alert('❌ Error updating series details.');
    }
  };

  return (
    <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 space-y-4 shadow-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide">⚙️ Manage Stories & Episodes</h3>
        <button onClick={fetchStories} className="text-[10px] text-orange-400 underline cursor-pointer">Refresh</button>
      </div>

      {selectedSeriesTitle ? (
        <div className="space-y-4">
          <button 
            onClick={() => setSelectedSeriesTitle(null)}
            className="text-xs text-orange-400 font-bold bg-[#0f0d13] px-3 py-1.5 rounded-lg border border-gray-800 w-fit cursor-pointer"
          >
            ← Back to Series List
          </button>

          <div className="bg-[#0f0d13] p-4 rounded-xl border border-gray-800 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-orange-400 uppercase">Editing: {selectedSeriesTitle}</h4>
              <button 
                onClick={() => handleDeleteFullSeries(selectedSeriesTitle)}
                className="bg-red-950/80 hover:bg-red-900 text-red-400 border border-red-800 px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
              >
                🗑️ Delete Full Series
              </button>
            </div>

            {/* Update Poster & Description Form */}
            <form onSubmit={handleUpdateSeriesMeta} className="space-y-2 pt-2 border-t border-gray-800">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Update Cover / Poster URL</label>
                <input 
                  type="text" 
                  defaultValue={currentSeriesMeta?.poster_url}
                  onChange={e => setEditingPoster(e.target.value)}
                  placeholder="https://..." 
                  className="w-full bg-[#16131c] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Update Description</label>
                <textarea 
                  defaultValue={currentSeriesMeta?.description}
                  onChange={e => setEditingDescription(e.target.value)}
                  className="w-full bg-[#16131c] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500 h-16 resize-none"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-xl text-xs cursor-pointer shadow-md"
              >
                💾 Save Series Changes
              </button>
            </form>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-[11px] font-bold text-gray-400">Episodes in this Series ({seriesEpisodes.length})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {seriesEpisodes.map((ep, idx) => (
                <div key={ep.id || idx} className="bg-[#0f0d13] p-3 rounded-xl border border-gray-800 flex justify-between items-center">
                  <div className="pr-2 truncate">
                    <p className="text-xs font-bold text-white truncate">{ep.episode_title}</p>
                    <p className="text-[9px] text-gray-500">Price: {ep.coin_price} Coins</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteEpisode(ep.id)}
                    className="bg-red-950 text-red-400 hover:bg-red-900 border border-red-800 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer whitespace-nowrap"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[11px] text-gray-400">Select any series to manage episodes, delete items, or update cover art.</p>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {uniqueSeriesList.map((series: any, idx: number) => {
              const count = stories.filter(s => s.title === series.title).length;
              return (
                <div 
                  key={idx} 
                  onClick={() => {
                    setSelectedSeriesTitle(series.title);
                    setEditingPoster(series.poster_url);
                    setEditingDescription(series.description);
                  }}
                  className="bg-[#0f0d13] p-3 rounded-xl border border-gray-800 flex justify-between items-center cursor-pointer hover:border-orange-500 transition-all"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <img src={series.poster_url} alt="Cover" className="w-10 h-12 object-cover rounded-lg border border-gray-700" />
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-white truncate">{series.title}</h4>
                      <p className="text-[10px] text-gray-400">{count} Episodes Available</p>
                    </div>
                  </div>
                  <span className="text-xs text-orange-400 font-bold">Manage →</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
        

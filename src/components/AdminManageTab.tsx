import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface AdminManageTabProps {
  stories: any[];
  fetchStories: () => void;
  setSuccessMessage: (msg: string) => void;
}

export const AdminManageTab: React.FC<AdminManageTabProps> = ({ stories, fetchStories, setSuccessMessage }) => {
  const [selectedSeriesTitle, setSelectedSeriesTitle] = useState<string | null>(null);
  const [editingStory, setEditingStory] = useState<any | null>(null);
  
  // Edit form state
  const [newTitle, setNewTitle] = useState('');
  const [newGenre, setNewGenre] = useState('Fantasy');
  const [newDescription, setNewDescription] = useState('');
  const [newPosterUrl, setNewPosterUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const genresList = ['Fantasy', 'Romance', 'Crime', 'Thriller', 'Horror', 'Mystery', 'Action', 'Drama', 'Sci-Fi', 'Comedy'];

  // Group stories by Series Title
  const uniqueSeriesMap = new Map();
  stories.forEach(item => {
    if (item.title && !uniqueSeriesMap.has(item.title)) {
      uniqueSeriesMap.set(item.title, {
        title: item.title,
        genre: item.genre || 'Fantasy',
        description: item.description,
        poster_url: item.poster_url || '',
        episodes: []
      });
    }
    if (item.title) {
      uniqueSeriesMap.get(item.title).episodes.push(item);
    }
  });
  const seriesList = Array.from(uniqueSeriesMap.values());

  const handleOpenEdit = (series: any) => {
    setEditingStory(series);
    setNewTitle(series.title);
    setNewGenre(series.genre);
    setNewDescription(series.description || '');
    setNewPosterUrl(series.poster_url || '');
  };

  const handleUpdateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory) return;

    try {
      setLoading(true);
      // Supabase me us series ke saare episodes ka title, genre, description, poster update kar do
      const { error } = await supabase
        .from('stories')
        .update({
          title: newTitle,
          genre: newGenre,
          description: newDescription,
          poster_url: newPosterUrl
        })
        .eq('title', editingStory.title);

      if (error) throw error;

      setSuccessMessage('Series updated successfully!');
      setEditingStory(null);
      setSelectedSeriesTitle(null);
      fetchStories();
    } catch (err: any) {
      alert('Error updating story: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEpisode = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this episode?')) return;
    try {
      const { error } = await supabase.from('stories').delete().eq('id', id);
      if (error) throw error;
      setSuccessMessage('Episode deleted successfully!');
      fetchStories();
    } catch (err: any) {
      alert('Error deleting episode: ' + err.message);
    }
  };

  return (
    <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 space-y-4 shadow-lg">
      <div className="flex justify-between items-center border-b border-gray-800 pb-3">
        <div>
          <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wide">⚙️ Manage Stories & Episodes</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Edit story details or manage episodes</p>
        </div>
        <button 
          onClick={fetchStories}
          className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/40 px-3 py-1.5 rounded-xl font-bold cursor-pointer hover:bg-orange-500 hover:text-white transition-all"
        >
          🔄 Refresh
        </button>
      </div>

      {editingStory ? (
        <form onSubmit={handleUpdateStory} className="space-y-3 bg-[#121017] p-3.5 rounded-xl border border-gray-800">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-orange-400">✏️ Edit Story: {editingStory.title}</h4>
            <button type="button" onClick={() => setEditingStory(null)} className="text-gray-400 hover:text-white text-xs font-bold">✕ Cancel</button>
          </div>

          <div>
            <label className="text-[10px] text-gray-400">Series Title</label>
            <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-[#16131c] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1" required />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-400">Genre</label>
              <select value={newGenre} onChange={e => setNewGenre(e.target.value)} className="w-full bg-[#16131c] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1">
                {genresList.map((g, idx) => <option key={idx} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400">Poster Image URL</label>
              <input type="text" value={newPosterUrl} onChange={e => setNewPosterUrl(e.target.value)} className="w-full bg-[#16131c] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1" />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-400">Description</label>
            <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} className="w-full bg-[#16131c] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1 h-20" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg cursor-pointer transition-all">
            {loading ? 'Saving...' : '💾 Save Changes'}
          </button>
        </form>
      ) : selectedSeriesTitle ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-[#121017] p-3 rounded-xl border border-gray-800">
            <div>
              <button onClick={() => setSelectedSeriesTitle(null)} className="text-[10px] text-orange-400 font-bold underline mb-1 block cursor-pointer">← Back to All Stories</button>
              <h4 className="text-xs font-black text-white">{selectedSeriesTitle} - Episodes</h4>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-none">
            {uniqueSeriesMap.get(selectedSeriesTitle)?.episodes.map((ep: any, idx: number) => (
              <div key={idx} className="bg-[#121017] p-3 rounded-xl border border-gray-800 flex items-center justify-between gap-2 text-xs">
                <div className="truncate pr-2">
                  <p className="font-bold text-white truncate">{ep.episode_title}</p>
                  <p className="text-[9px] text-orange-400 mt-0.5">Coins: {ep.coin_price || 0}</p>
                </div>
                <button 
                  onClick={() => handleDeleteEpisode(ep.id)}
                  className="bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800/50 px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 cursor-pointer transition-all"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto scrollbar-none">
          {seriesList.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No series published yet.</p>
          ) : (
            seriesList.map((series, idx) => (
              <div key={idx} className="bg-[#121017] p-3 rounded-xl border border-gray-800 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-3 truncate cursor-pointer" onClick={() => setSelectedSeriesTitle(series.title)}>
                  <img src={series.poster_url || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400'} alt="Poster" className="w-10 h-10 object-cover rounded-lg shrink-0 border border-gray-700" />
                  <div className="truncate">
                    <h4 className="font-bold text-white truncate">{series.title}</h4>
                    <p className="text-[10px] text-orange-400 truncate">{series.genre} • <span className="text-gray-400">{series.episodes.length} Episodes</span></p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 shrink-0">
                  <button 
                    onClick={() => handleOpenEdit(series)}
                    className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => setSelectedSeriesTitle(series.title)}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all"
                  >
                    Episodes
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
              

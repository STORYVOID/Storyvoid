import React from 'react';
import { supabase } from '../supabaseClient';

interface AdminManageTabProps {
  stories: any[];
  fetchStories: () => void;
  setSuccessMessage: (msg: string) => void;
}

export const AdminManageTab: React.FC<AdminManageTabProps> = ({ stories, fetchStories, setSuccessMessage }) => {
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
          <p className="text-[10px] text-gray-400 mt-0.5">View and delete published episodes</p>
        </div>
        <button 
          onClick={fetchStories}
          className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/40 px-3 py-1.5 rounded-xl font-bold cursor-pointer hover:bg-orange-500 hover:text-white transition-all"
        >
          🔄 Refresh
        </button>
      </div>

      {stories.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-6">No episodes published yet.</p>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto scrollbar-none">
          {stories.map((item, idx) => (
            <div key={idx} className="bg-[#121017] p-3 rounded-xl border border-gray-800 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-3 truncate">
                <img src={item.poster_url} alt="Poster" className="w-10 h-10 object-cover rounded-lg shrink-0 border border-gray-700" />
                <div className="truncate">
                  <h4 className="font-bold text-white truncate">{item.title}</h4>
                  <p className="text-[10px] text-orange-400 truncate">{item.episode_title} • <span className="text-gray-400">{item.genre}</span></p>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteEpisode(item.id)}
                className="bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800/50 px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 cursor-pointer transition-all"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
        

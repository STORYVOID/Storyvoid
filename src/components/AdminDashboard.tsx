import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export function AdminDashboard() {
  const [title, setTitle] = useState('');
  const [genre, setTheme] = useState('Thriller');
  const [description, setDescription] = useState('');
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !episodeTitle) {
      alert('Please fill in all required fields!');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('stories').insert([
        {
          title,
          genre,
          description,
          episode_title: episodeTitle,
          audio_url: audioUrl,
        },
      ]);

      if (error) throw error;

      alert('🚀 Episode published successfully to StoryVoid!');
      setTitle('');
      setDescription('');
      setEpisodeTitle('');
      setAudioUrl('');
    } catch (err: any) {
      alert('Error publishing: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="bg-[#16131c] p-5 rounded-2xl border border-gray-800 shadow-xl">
        <h2 className="text-base font-extrabold text-orange-500 mb-4 uppercase tracking-wider">
          🛠️ Admin Panel: Publish Story
        </h2>

        <form onSubmit={handlePublish} className="space-y-3">
          <div>
            <label className="text-[11px] text-gray-400 block mb-1">Story Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. The Last Broadcast" 
              className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-2.5 text-xs text-white"
              required
            />
          </div>

          <div>
            <label className="text-[11px] text-gray-400 block mb-1">Genre</label>
            <select 
              value={genre} 
              onChange={e => setTheme(e.target.value)}
              className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-2.5 text-xs text-white"
            >
              <option value="Thriller">Thriller</option>
              <option value="Dark Fantasy">Dark Fantasy</option>
              <option value="Romance">Romance</option>
              <option value="Horror">Horror</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-gray-400 block mb-1">Episode Title</label>
            <input 
              type="text" 
              value={episodeTitle} 
              onChange={e => setEpisodeTitle(e.target.value)}
              placeholder="e.g. Episode 1: Dead Air" 
              className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-2.5 text-xs text-white"
              required
            />
          </div>

          <div>
            <label className="text-[11px] text-gray-400 block mb-1">Audio / Stream URL</label>
            <input 
              type="text" 
              value={audioUrl} 
              onChange={e => setAudioUrl(e.target.value)}
              placeholder="Paste mp3 or audio link" 
              className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-[11px] text-gray-400 block mb-1">Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="Short summary of the story..." 
              className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-2.5 text-xs text-white h-20"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all mt-2 shadow-md"
          >
            {loading ? 'Publishing...' : 'Publish Episode Now'}
          </button>
        </form>
      </div>
    </div>
  );
}
export default AdminDashboard;

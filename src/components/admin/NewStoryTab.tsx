import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

interface NewStoryTabProps {
  fetchStories: () => void;
  setSuccessMessage: (msg: string) => void;
}

export const NewStoryTab: React.FC<NewStoryTabProps> = ({ fetchStories, setSuccessMessage }) => {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Fantasy');
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const genresList = ['Fantasy', 'Romance', 'Crime', 'Thriller', 'Horror', 'Mystery', 'Action', 'Drama', 'Sci-Fi', 'Comedy'];

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !posterUrl) {
      alert('Bhai, Story Title aur Poster URL dalna zaroori hai!');
      return;
    }

    try {
      setLoading(true);
      // Nayi series ka pehla dummy ya introductory row insert karne ke liye
      const { error } = await supabase.from('stories').insert([
        {
          title: title.trim(),
          episode_title: 'Episode 1: Pilot',
          coin_price: 0,
          audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          genre: genre,
          description: description.trim(),
          poster_url: posterUrl.trim()
        }
      ]);

      if (error) throw error;

      setSuccessMessage('✨ New Series & Personal Poster successfully created!');
      setTitle('');
      setDescription('');
      setPosterUrl('');
      fetchStories();

      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      console.error('Error creating story:', err);
      alert(`❌ Error: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreateStory} className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 space-y-4 shadow-lg">
      <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide">➕ Create New Story Series</h3>

      <div>
        <label className="text-[10px] text-gray-400 block mb-1">Series Title</label>
        <input 
          type="text" 
          value={title} 
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Naruto Chronicles" 
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
          {genresList.map((g, idx) => (
            <option key={idx} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[10px] text-gray-400 block mb-1">Personal Poster / Cover Image URL</label>
        <input 
          type="text" 
          value={posterUrl} 
          onChange={e => setPosterUrl(e.target.value)}
          placeholder="https://... (Apna custom poster link dalein)" 
          className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
          required
        />
      </div>

      <div>
        <label className="text-[10px] text-gray-400 block mb-1">Series Description</label>
        <textarea 
          value={description} 
          onChange={e => setDescription(e.target.value)}
          placeholder="Write a brief description about the series..." 
          className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500 h-20 resize-none"
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg cursor-pointer"
      >
        {loading ? 'Creating...' : '✨ Create Series with Poster'}
      </button>
    </form>
  );
};
            

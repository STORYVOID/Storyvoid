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
  const [audioUrl, setAudioUrl] = useState('');
  const [creatingStory, setCreatingStory] = useState(false);

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
  );
};

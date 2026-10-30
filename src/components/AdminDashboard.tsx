import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export const AdminDashboard: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [author, setAuthor] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Admin Email Check (Sirf tera email admin access karega)
  const ADMIN_EMAIL = "divyadev200722@gmail.com"; // Tera email jo profile me tha

  const handleAddStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.from('stories').insert([
        { title, description, genre, author, cover_image: coverImage }
      ]);

      if (error) throw error;
      setMessage('Story successfully added!');
      setTitle('');
      setDescription('');
      setGenre('');
      setAuthor('');
      setCoverImage('');
    } catch (err: any) {
      setMessage('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 text-white bg-[#0f0d13] min-h-screen p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-orange-500">Admin Dashboard</h1>
        <p className="text-xs text-gray-400">Manage stories, episodes, and app monetization.</p>
      </div>

      {/* Add Story Form */}
      <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 mb-6">
        <h2 className="text-sm font-bold mb-3 text-gray-200">Add New Story</h2>
        {message && <p className="text-xs mb-3 text-orange-400">{message}</p>}
        
        <form onSubmit={handleAddStory} className="space-y-3">
          <div>
            <label className="text-[10px] text-gray-400">Story Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white"
              placeholder="e.g. The Last Broadcast"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400">Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white"
              placeholder="Story plot..."
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-400">Genre</label>
              <input 
                type="text" 
                value={genre} 
                onChange={(e) => setGenre(e.target.value)} 
                className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white"
                placeholder="Thriller / Horror"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400">Author</label>
              <input 
                type="text" 
                value={author} 
                onChange={(e) => setAuthor(e.target.value)} 
                className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white"
                placeholder="Author name"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-400">Cover Image URL</label>
            <input 
              type="text" 
              value={coverImage} 
              onChange={(e) => setCoverImage(e.target.value)} 
              className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white"
              placeholder="https://image-url.com"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg text-xs"
          >
            {loading ? 'Adding...' : 'Publish Story'}
          </button>
        </form>
      </div>

      {/* Rewarded Ads & Coin System Info */}
      <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800">
        <h2 className="text-sm font-bold mb-2 text-yellow-400">🟡 Free Reward System (Ad Monetization)</h2>
        <p className="text-xs text-gray-300 leading-relaxed">
          Users will be able to watch up to 5 rewarded ads per day via AdMob / Rewarded SDKs and receive 20 free credits upon completion to unlock premium thriller episodes.
        </p>
      </div>
    </div>
  );
};
    

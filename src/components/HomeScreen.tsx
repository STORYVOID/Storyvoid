import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Story } from '../types';

interface HomeScreenProps {
  onSelectStory: (story: Story) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectStory }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  const genres = ['All', 'Horror', 'Mystery', 'Thriller', 'Crime', 'Romance'];

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase.from('stories').select('*');
      if (error) throw error;
      if (data) setStories(data);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStories = selectedGenre === 'All' 
    ? stories 
    : stories.filter(s => s.genre?.toLowerCase() === selectedGenre.toLowerCase());

  return (
    <div className="pb-24 text-white bg-[#0f0d13] min-h-screen p-4">
      {/* App Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-wider text-orange-500">STORYVOID</h1>
          <p className="text-xs text-gray-400">SERIALIZED AUDIO</p>
        </div>
        <div className="flex items-center bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
          <span className="text-yellow-400 mr-1.5">🟡</span>
          <span className="text-sm font-semibold">10</span>
        </div>
      </div>

      {/* Hero Banner (Now Streaming) */}
      <div className="relative rounded-2xl overflow-hidden mb-6 bg-gradient-to-r from-purple-900 to-gray-900 p-5 border border-gray-800 shadow-lg">
        <span className="bg-orange-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          Now Streaming
        </span>
        <h2 className="text-xl font-extrabold mt-3 mb-1">REBORN: THE INFINITE DUNGEON</h2>
        <p className="text-xs text-gray-300 mb-4 line-clamp-2">Level up, fight abyssal threats, and explore the unknown depths.</p>
        <button className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-full flex items-center space-x-2 shadow-md">
          <span>▶ Play Episode 1</span>
        </button>
      </div>

      {/* Browse Genres */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide">Browse Genres</h3>
        </div>
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedGenre === genre 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-[#1a1721] text-gray-300 border border-gray-800 hover:border-gray-700'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Published Stories */}
      <div>
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide mb-3">Published Stories</h3>
        {loading ? (
          <p className="text-xs text-gray-500">Loading stories...</p>
        ) : filteredStories.length === 0 ? (
          <p className="text-xs text-gray-500">No stories found. Add some from Supabase or Admin!</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredStories.map((story) => (
              <div 
                key={story.id} 
                onClick={() => onSelectStory(story)}
                className="bg-[#16131c] rounded-xl p-2.5 border border-gray-800 cursor-pointer hover:border-orange-500/50 transition-all"
              >
                <div className="h-36 rounded-lg bg-gray-800 mb-2 overflow-hidden">
                  <img 
                    src={story.cover_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe"} 
                    alt={story.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-xs font-bold truncate">{story.title}</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">{story.genre || 'Story'} · 0 eps</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
          

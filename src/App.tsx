import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'library' | 'profile'>('home');
  const [coins, setCoins] = useState<number>(10);
  const [stories, setStories] = useState<any[]>([]);
  const [loadingStories, setLoadingStories] = useState<boolean>(true);

  // Admin form state
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Thriller');
  const [description, setDescription] = useState('');
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoadingStories(true);
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setStories(data);
    } catch (err) {
      console.error('Error fetching stories:', err);
    } finally {
      setLoadingStories(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !episodeTitle) {
      alert('Please fill in Story Title and Episode Title!');
      return;
    }

    setPublishing(true);
    try {
      const { error } = await supabase.from('stories').insert([
        { title, genre, description, episode_title: episodeTitle, audio_url: audioUrl },
      ]);

      if (error) throw error;

      alert('🚀 Episode published successfully!');
      setTitle('');
      setDescription('');
      setEpisodeTitle('');
      setAudioUrl('');
      fetchStories();
      setActiveTab('home');
    } catch (err: any) {
      alert('Error publishing: ' + err.message);
    } finally {
      setPublishing(false);
    }
  };

  const watchAdForCoins = () => {
    setCoins(prev => prev + 20);
    alert('🎉 Ad watched successfully! 20 coins added.');
  };

  return (
    <div className="bg-[#0f0d13] min-h-screen text-white font-sans pb-24 selection:bg-orange-500 selection:text-white">
      {/* Top Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#121017]">
        <div>
          <h1 className="text-xl font-extrabold tracking-wider text-orange-500">STORYVOID</h1>
          <p className="text-[10px] text-gray-400">SERIALIZED AUDIO</p>
        </div>
        <div className="flex items-center bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
          <span className="text-yellow-400 mr-1.5">🟡</span>
          <span className="text-xs font-semibold">{coins} Coins</span>
        </div>
      </div>

      {/* HOME TAB */}
      {activeTab === 'home' && (
        <div className="p-4">
          <div className="relative rounded-2xl overflow-hidden mb-6 bg-gradient-to-r from-purple-900 to-gray-900 p-5 border border-gray-800 shadow-lg">
            <span className="bg-orange-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Now Streaming
            </span>
            <h2 className="text-lg font-extrabold mt-3 mb-1">THE LAST BROADCAST</h2>
            <p className="text-xs text-gray-300 mb-4">Episode 1: Dead Air - Tune in if you dare.</p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-md">
              ▶ Play Episode 1
            </button>
          </div>

          <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 mb-6">
            <h3 className="text-xs font-bold mb-1 text-yellow-400 uppercase tracking-wide">🟡 Earn Free Coins</h3>
            <p className="text-[11px] text-gray-300 mb-3">Watch a short rewarded ad to get 20 free coins.</p>
            <button 
              onClick={watchAdForCoins}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded-xl text-xs transition-all"
            >
              Watch Rewarded Ad (+20 Coins)
            </button>
          </div>

          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide">Published Audio Series</h3>
            <button onClick={fetchStories} className="text-[10px] text-orange-400 underline">Refresh</button>
          </div>

          {loadingStories ? (
            <p className="text-xs text-gray-400 text-center py-6">Loading stories...</p>
          ) : stories.length === 0 ? (
            <div className="bg-[#16131c] p-4 rounded-xl border border-gray-800 text-center">
              <p className="text-xs text-gray-400 mb-2">No stories published yet.</p>
              <button onClick={() => setActiveTab('profile')} className="text-xs text-orange-500 font-bold underline">
                Go to Admin Panel to Publish
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {stories.map((story) => (
                <div key={story.id} className="bg-[#16131c] rounded-xl p-2.5 border border-gray-800">
                  <div className="h-32 rounded-lg bg-gray-800 mb-2 overflow-hidden flex items-center justify-center text-gray-500 text-xs">
                    {story.genre || 'Audio'}
                  </div>
                  <h4 className="text-xs font-bold truncate">{story.title}</h4>
                  <p className="text-[10px] text-orange-400 truncate mt-0.5">{story.episode_title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SEARCH TAB */}
      {activeTab === 'search' && (
        <div className="p-4 text-center">
          <h2 className="text-lg font-bold text-orange-500 mb-3">Search Stories</h2>
          <input 
            type="text" 
            placeholder="Search audio thrillers..." 
            className="w-full bg-[#16131c] border border-gray-800 rounded-xl p-3 text-xs text-white"
          />
        </div>
      )}

      {/* LIBRARY TAB */}
      {activeTab === 'library' && (
        <div className="p-4">
          <h2 className="text-lg font-bold text-orange-500 mb-1">Your Library</h2>
          <p className="text-xs text-gray-400">No saved stories yet.</p>
        </div>
      )}

      {/* PROFILE & ADMIN TAB */}
      {activeTab === 'profile' && (
        <div className="p-4 space-y-4 max-w-md mx-auto pb-12">
          <div className="bg-[#16131c] p-4 rounded-xl border border-gray-800">
            <p className="text-xs text-gray-400">Logged in as Admin</p>
            <p className="text-sm font-bold text-orange-400">divyadev200722@gmail.com</p>
          </div>

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
                  onChange={e => setGenre(e.target.value)}
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
                  placeholder="Short summary..." 
                  className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-2.5 text-xs text-white h-20"
                />
              </div>

              <button 
                type="submit" 
                disabled={publishing}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all mt-2 shadow-md"
              >
                {publishing ? 'Publishing...' : 'Publish Episode Now'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#121017] border-t border-gray-800 flex justify-around py-3 px-2 z-50">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center text-xs ${activeTab === 'home' ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
          <span>🏠</span>
          <span className="text-[10px] mt-1">HOME</span>
        </button>
        <button onClick={() => setActiveTab('search')} className={`flex flex-col items-center text-xs ${activeTab === 'search' ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
          <span>🔍</span>
          <span className="text-[10px] mt-1">SEARCH</span>
        </button>
        <button onClick={() => setActiveTab('library')} className={`flex flex-col items-center text-xs ${activeTab === 'library' ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
          <span>📚</span>
          <span className="text-[10px] mt-1">LIBRARY</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center text-xs ${activeTab === 'profile' ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
          <span>👤</span>
          <span className="text-[10px] mt-1">PROFILE</span>
        </button>
      </div>
    </div>
  );
}

export default App;

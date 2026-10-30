import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'library' | 'profile'>('home');
  const [coins, setCoins] = useState<number>(30); // Starting coins for users
  const [stories, setStories] = useState<any[]>([]);
  const [loadingStories, setLoadingStories] = useState<boolean>(true);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin Publish Form State
  const [title, setTitle] = useState(''); // Story Series Name (e.g. The Last Broadcast)
  const [genre, setGenre] = useState('Thriller');
  const [episodeTitle, setEpisodeTitle] = useState(''); // Episode Name (e.g. Episode 2: The Signal)
  const [coinPrice, setCoinPrice] = useState<number>(0); // Coins required to unlock
  const [audioUrl, setAudioUrl] = useState('');
  const [description, setDescription] = useState('');
  const [publishing, setPublishing] = useState(false);

  const ADMIN_EMAIL = 'storyvoid.admin@gmail.com';
  const ADMIN_PASSWORD = 'VoidAdmin#2026'; // Secret Admin Password

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) {
      alert('Please enter your email!');
      return;
    }

    const cleanEmail = userEmail.trim().toLowerCase();

    // Check if trying to login as admin
    if (cleanEmail === ADMIN_EMAIL) {
      if (password !== ADMIN_PASSWORD) {
        alert('❌ Incorrect Admin Password! Access Denied.');
        return;
      }
      setIsAdmin(true);
      alert('🔓 Welcome Admin! Admin panel unlocked.');
    } else {
      setIsAdmin(false);
      alert('👤 Logged in successfully as Listener.');
    }

    setIsLoggedIn(true);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !episodeTitle) {
      alert('Please fill in Story Series Title and Episode Title!');
      return;
    }

    setPublishing(true);
    try {
      const { error } = await supabase.from('stories').insert([
        { 
          title, 
          genre, 
          description, 
          episode_title: episodeTitle, 
          audio_url: audioUrl,
          coin_price: coinPrice 
        },
      ]);

      if (error) throw error;

      alert('🚀 Episode published successfully with ' + coinPrice + ' coins requirement!');
      setTitle('');
      setEpisodeTitle('');
      setAudioUrl('');
      setDescription('');
      setCoinPrice(0);
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
    alert('🎉 Ad watched successfully! +20 coins added.');
  };

  const unlockEpisode = (price: number) => {
    if (coins < price) {
      alert('❌ Not enough coins! Watch a rewarded ad to earn more coins.');
      return;
    }
    setCoins(prev => prev - price);
    alert('🎉 Episode unlocked successfully! Enjoy listening.');
  };

  // 1. MANDATORY LOGIN SCREEN (If not logged in, app won't open)
  if (!isLoggedIn) {
    return (
      <div className="bg-[#0f0d13] min-h-screen text-white font-sans flex flex-col items-center justify-center p-6 selection:bg-orange-500 selection:text-white">
        <div className="w-full max-w-sm bg-[#16131c] p-6 rounded-3xl border border-gray-800 shadow-2xl text-center">
          <h1 className="text-2xl font-black tracking-wider text-orange-500 mb-1">STORYVOID</h1>
          <p className="text-xs text-gray-400 mb-6">SERIALIZED AUDIO STREAMING</p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Email Address</label>
              <input 
                type="email" 
                value={userEmail} 
                onChange={e => setUserEmail(e.target.value)}
                placeholder="Enter your email" 
                className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-xs text-white focus:border-orange-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Password / Admin Key</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password (Required for Admin)" 
                className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-xs text-white focus:border-orange-500 outline-none"
              />
              <p className="text-[10px] text-gray-500 mt-1">*Normal users can leave password empty or use any password.</p>
            </div>

            <button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg mt-2"
            >
              Enter StoryVoid
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. MAIN APP INTERFACE (Unlocked after login)
  return (
    <div className="bg-[#0f0d13] min-h-screen text-white font-sans pb-24 selection:bg-orange-500 selection:text-white">
      {/* Top Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#121017]">
        <div>
          <h1 className="text-xl font-extrabold tracking-wider text-orange-500">STORYVOID</h1>
          <p className="text-[10px] text-gray-400">SERIALIZED AUDIO</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
            <span className="text-yellow-400 mr-1.5">🟡</span>
            <span className="text-xs font-semibold">{coins} Coins</span>
          </div>
        </div>
      </div>

      {/* HOME TAB */}
      {activeTab === 'home' && (
        <div className="p-4">
          <div className="relative rounded-2xl overflow-hidden mb-6 bg-gradient-to-r from-purple-900 to-gray-900 p-5 border border-gray-800 shadow-lg">
            <span className="bg-orange-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Featured Series
            </span>
            <h2 className="text-lg font-extrabold mt-3 mb-1">THE LAST BROADCAST</h2>
            <p className="text-xs text-gray-300 mb-4">Episode 1: Dead Air - Tune in if you dare.</p>
            <button 
              onClick={() => unlockEpisode(0)}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-md"
            >
              ▶ Listen Free Episode
            </button>
          </div>

          <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wide">🟡 Earn Free Coins</h3>
              <p className="text-[11px] text-gray-300">Watch a short ad to get +20 coins.</p>
            </div>
            <button 
              onClick={watchAdForCoins}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md"
            >
              Watch Ad
            </button>
          </div>

          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide">All Published Episodes</h3>
            <button onClick={fetchStories} className="text-[10px] text-orange-400 underline">Refresh</button>
          </div>

          {loadingStories ? (
            <p className="text-xs text-gray-400 text-center py-6">Loading stories...</p>
          ) : stories.length === 0 ? (
            <div className="bg-[#16131c] p-4 rounded-xl border border-gray-800 text-center">
              <p className="text-xs text-gray-400 mb-2">No episodes published yet.</p>
              {isAdmin && (
                <button onClick={() => setActiveTab('profile')} className="text-xs text-orange-500 font-bold underline">
                  Go to Admin Panel to Publish
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {stories.map((story) => (
                <div key={story.id} className="bg-[#16131c] rounded-xl p-3 border border-gray-800 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] bg-orange-900/60 text-orange-300 px-2 py-0.5 rounded-full font-bold">
                        {story.genre || 'Thriller'}
                      </span>
                      <span className="text-[10px] text-yellow-400 font-bold">
                        {story.coin_price > 0 ? `🔒 ${story.coin_price} Coins` : '✨ Free'}
                      </span>
                    </div>
                    <h4 className="text-xs font-extrabold truncate text-white mt-1">{story.title}</h4>
                    <p className="text-[10px] text-orange-400 font-semibold truncate">{story.episode_title}</p>
                    {story.description && (
                      <p className="text-[10px] text-gray-400 line-clamp-2 mt-1">{story.description}</p>
                    )}
                  </div>
                  <button 
                    onClick={() => unlockEpisode(story.coin_price || 0)}
                    className="mt-3 w-full bg-gray-800 hover:bg-orange-500 hover:text-white text-gray-200 text-[10px] font-bold py-2 rounded-lg transition-all border border-gray-700"
                  >
                    {story.coin_price > 0 ? `Unlock (${story.coin_price}C)` : '▶ Play Now'}
                  </button>
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
            className="w-full bg-[#16131c] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
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

      {/* PROFILE & SECURE ADMIN TAB */}
      {activeTab === 'profile' && (
        <div className="p-4 space-y-4 max-w-md mx-auto pb-12">
          <div className="bg-[#16131c] p-4 rounded-xl border border-gray-800 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400">Logged in as ({isAdmin ? 'Admin' : 'User'})</p>
              <p className="text-xs font-bold text-orange-400">{userEmail}</p>
            </div>
            <button 
              onClick={() => { setIsLoggedIn(false); setIsAdmin(false); setUserEmail(''); setPassword(''); }} 
              className="text-[10px] bg-red-900/40 text-red-300 hover:bg-red-900 px-3 py-1.5 rounded-lg border border-red-800 transition-all font-bold"
            >
              Logout
            </button>
          </div>

          {/* ADMIN PANEL: Only visible if Admin password & email matched */}
          {isAdmin ? (
            <div className="bg-[#16131c] p-5 rounded-2xl border border-gray-800 shadow-xl">
              <h2 className="text-base font-extrabold text-orange-500 mb-4 uppercase tracking-wider">
                🛠️ Professional Admin: Publish Episode
              </h2>

              <form onSubmit={handlePublish} className="space-y-3">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Story Series Title (e.g. The Last Broadcast)</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Enter main story name" 
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
                    <option value="Comedy">Comedy (Ulti Duniya)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Episode Title (e.g. Episode 2: Dead Air)</label>
                  <input 
                    type="text" 
                    value={episodeTitle} 
                    onChange={e => setEpisodeTitle(e.target.value)}
                    placeholder="Enter episode title" 
                    className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-2.5 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Coin Price to Unlock (0 for Free)</label>
                  <input 
                    type="number" 
                    value={coinPrice} 
                    onChange={e => setCoinPrice(Number(e.target.value))}
                    placeholder="e.g. 15 coins" 
                    className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-2.5 text-xs text-white"
                    min="0"
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
                  <label className="text-[11px] text-gray-400 block mb-1">Episode Description</label>
                  <textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Short description of this episode..." 
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
          ) : (
            <div className="bg-[#16131c] p-5 rounded-2xl border border-gray-800 text-center">
              <p className="text-xs text-gray-300 font-semibold mb-1">✨ Welcome to StoryVoid!</p>
              <p className="text-[11px] text-gray-400">You are logged in as a listener. Collect coins by watching ads and unlock premium thriller episodes.</p>
            </div>
          )}
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
              

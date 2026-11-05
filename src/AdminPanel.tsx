import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

interface AdminPanelProps {
  stories: any[];
  fetchStories: () => void;
  setSuccessMessage: (msg: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ stories, fetchStories, setSuccessMessage }) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'episode' | 'story' | 'banner' | 'promo' | 'users'>('episode');

  // Episode form state
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Fantasy');
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [coinPrice, setCoinPrice] = useState('0');
  const [loading, setLoading] = useState(false);

  // Users analytics state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Banner state
  const [featuredTitle, setFeaturedTitle] = useState(localStorage.getItem('storyvoid_featured_title') || '');
  const [customBannerImg, setCustomBannerImg] = useState(localStorage.getItem('storyvoid_custom_banner_image') || '');

  // Promo / Social Banner state
  const [promoTitle, setPromoTitle] = useState(localStorage.getItem('storyvoid_promo_title') || '');
  const [promoMediaUrl, setPromoMediaUrl] = useState(localStorage.getItem('storyvoid_promo_media') || '');
  const [promoLink, setPromoLink] = useState(localStorage.getItem('storyvoid_promo_link') || '');

  const genresList = ['Fantasy', 'Romance', 'Crime', 'Thriller', 'Horror', 'Mystery', 'Action', 'Drama', 'Sci-Fi', 'Comedy'];

  useEffect(() => {
    if (activeAdminTab === 'users') {
      fetchUsers();
    }
  }, [activeAdminTab]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .order('last_login', { ascending: false });

      if (error) throw error;
      if (data) setUsersList(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !episodeTitle || !audioUrl) {
      alert('Please fill all required fields!');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from('stories').insert([
        {
          title,
          genre,
          description,
          poster_url: posterUrl || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400',
          episode_title: episodeTitle,
          audio_url: audioUrl,
          coin_price: parseInt(coinPrice) || 0,
        },
      ]);

      if (error) throw error;

      setSuccessMessage('Episode added successfully!');
      setTitle('');
      setEpisodeTitle('');
      setAudioUrl('');
      setCoinPrice('0');
      fetchStories();
    } catch (err: any) {
      alert('Error adding episode: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('storyvoid_featured_title', featuredTitle);
    localStorage.setItem('storyvoid_custom_banner_image', customBannerImg);
    setSuccessMessage('Featured banner updated successfully!');
  };

  const handleSavePromoBanner = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('storyvoid_promo_title', promoTitle);
    localStorage.setItem('storyvoid_promo_media', promoMediaUrl);
    localStorage.setItem('storyvoid_promo_link', promoLink);
    setSuccessMessage('Promotional banner updated successfully!');
  };

  const uniqueSeriesNames = Array.from(new Set(stories.map(s => s.title)));

  const totalUsers = usersList.length;
  const activeUsers = usersList.filter(u => {
    if (!u.last_login) return false;
    const lastLoginDate = new Date(u.last_login).getTime();
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return lastLoginDate >= sevenDaysAgo;
  }).length;

  return (
    <div className="space-y-4 max-w-xl mx-auto px-3 pb-12">
      <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 text-center shadow-lg">
        <h2 className="text-sm font-black text-orange-500 uppercase tracking-wider">🛠️ STORYVOID ADMIN COMMAND CENTER</h2>
        <p className="text-[10px] text-gray-400 mt-0.5">Manage your audio series, featured banners & promotional ads</p>
      </div>

      <div className="flex overflow-x-auto space-x-2 pb-1 scrollbar-none">
        <button 
          onClick={() => setActiveAdminTab('episode')} 
          className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${activeAdminTab === 'episode' ? 'bg-orange-500 text-white shadow-md' : 'bg-[#16131c] text-gray-400 border border-gray-800'}`}
        >
          + Episode
        </button>
        <button 
          onClick={() => setActiveAdminTab('story')} 
          className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${activeAdminTab === 'story' ? 'bg-orange-500 text-white shadow-md' : 'bg-[#16131c] text-gray-400 border border-gray-800'}`}
        >
          + New Story
        </button>
        <button 
          onClick={() => setActiveAdminTab('banner')} 
          className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${activeAdminTab === 'banner' ? 'bg-orange-500 text-white shadow-md' : 'bg-[#16131c] text-gray-400 border border-gray-800'}`}
        >
          ⭐ Featured Banner
        </button>
        <button 
          onClick={() => setActiveAdminTab('promo')} 
          className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${activeAdminTab === 'promo' ? 'bg-orange-500 text-white shadow-md' : 'bg-[#16131c] text-gray-400 border border-gray-800'}`}
        >
          📢 Promo Ads
        </button>
        <button 
          onClick={() => setActiveAdminTab('users')} 
          className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${activeAdminTab === 'users' ? 'bg-orange-500 text-white shadow-md' : 'bg-[#16131c] text-gray-400 border border-gray-800'}`}
        >
          👥 Users
        </button>
      </div>

      {activeAdminTab === 'episode' && (
        <form onSubmit={handleAddEpisode} className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 space-y-3 shadow-lg">
          <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wide">Add Episode to Existing Series</h3>
          
          <div>
            <label className="text-[10px] text-gray-400">Select Series</label>
            <select value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#121017] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1">
              <option value="">-- Choose Series --</option>
              {uniqueSeriesNames.map((name, idx) => <option key={idx} value={name}>{name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-gray-400">Episode Title</label>
            <input type="text" placeholder="e.g. Episode 2: Awakening" value={episodeTitle} onChange={e => setEpisodeTitle(e.target.value)} className="w-full bg-[#121017] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1" />
          </div>

          <div>
            <label className="text-[10px] text-gray-400">Audio Stream / MP3 URL</label>
            <input type="text" placeholder="https://..." value={audioUrl} onChange={e => setAudioUrl(e.target.value)} className="w-full bg-[#121017] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1" />
          </div>

          <div>
            <label className="text-[10px] text-gray-400">Coin Price (0 for Free)</label>
            <input type="number" placeholder="0" value={coinPrice} onChange={e => setCoinPrice(e.target.value)} className="w-full bg-[#121017] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg cursor-pointer transition-all">
            {loading ? 'Adding...' : '✨ Publish Episode'}
          </button>
        </form>
      )}

      {activeAdminTab === 'story' && (
        <form onSubmit={handleAddEpisode} className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 space-y-3 shadow-lg">
          <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wide">Create Brand New Series</h3>

          <div>
            <label className="text-[10px] text-gray-400">Series Title</label>
            <input type="text" placeholder="e.g. Rebirth in Another World" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#121017] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-400">Genre</label>
              <select value={genre} onChange={e => setGenre(e.target.value)} className="w-full bg-[#121017] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1">
                {genresList.map((g, idx) => (
                  <option key={idx} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400">Poster Image URL</label>
              <input type="text" placeholder="https://..." value={posterUrl} onChange={e => setPosterUrl(e.target.value)} className="w-full bg-[#121017] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1" />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-400">Series Description</label>
            <textarea placeholder="Write summary..." value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-[#121017] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1 h-20" />
          </div>

          <div>
            <label className="text-[10px] text-gray-400">First Episode Title</label>
            <input type="text" placeholder="Episode 1: Pilot" value={episodeTitle} onChange={e => setEpisodeTitle(e.target.value)} className="w-full bg-[#121017] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1" />
          </div>

          <div>
            <label className="text-[10px] text-gray-400">Audio Stream / MP3 URL</label>
            <input type="text" placeholder="https://..." value={audioUrl} onChange={e => setAudioUrl(e.target.value)} className="w-full bg-[#121017] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg cursor-pointer transition-all">
            {loading ? 'Creating...' : '🚀 Launch New Series'}
          </button>
        </form>
      )}

      {activeAdminTab === 'banner' && (
        <form onSubmit={handleSaveBanner} className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 space-y-3 shadow-lg">
          <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wide">⭐ Set Home Featured / Trending Banner</h3>

          <div>
            <label className="text-[10px] text-gray-400">Select Featured Story</label>
            <select value={featuredTitle} onChange={e => setFeaturedTitle(e.target.value)} className="w-full bg-[#121017] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1">
              <option value="">-- Choose Series --</option>
              {uniqueSeriesNames.map((name, idx) => <option key={idx} value={name}>{name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-gray-400">Custom Banner Image URL (Optional)</label>
            <input type="text" placeholder="https://..." value={customBannerImg} onChange={e => setCustomBannerImg(e.target.value)} className="w-full bg-[#121017] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1" />
            <p className="text-[9px] text-gray-500 mt-1">Agar yeh khali chhodoge toh story ka apna poster banner par dikhega.</p>
          </div>

          <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg cursor-pointer transition-all">
            ✨ Save Featured Banner
          </button>
        </form>
      )}

      {activeAdminTab === 'promo' && (
        <form onSubmit={handleSavePromoBanner} className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 space-y-3 shadow-lg">
          <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wide">📢 Promotional / Social Ad Banner</h3>

          <div>
            <label className="text-[10px] text-gray-400">Banner / Ad Title</label>
            <input type="text" placeholder="e.g. Follow us on Instagram" value={promoTitle} onChange={e => setPromoTitle(e.target.value)} className="w-full bg-[#121017] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1" />
          </div>

          <div>
            <label className="text-[10px] text-gray-400">Banner Image / Video Link URL</label>
            <input type="text" placeholder="https://... (Image or Video Link)" value={promoMediaUrl} onChange={e => setPromoMediaUrl(e.target.value)} className="w-full bg-[#121017] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1" />
          </div>

          <div>
            <label className="text-[10px] text-gray-400">External Redirect Link (Instagram / YouTube)</label>
            <input type="text" placeholder="https://instagram.com/..." value={promoLink} onChange={e => setPromoLink(e.target.value)} className="w-full bg-[#121017] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1" />
          </div>

          <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg cursor-pointer transition-all">
            🚀 Save Promotional Banner
          </button>
        </form>
      )}

      {activeAdminTab === 'users' && (
        <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 space-y-4 shadow-lg">
          <div className="flex justify-between items-center border-b border-gray-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wide">👥 Registered Users Analytics</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Real-time user statistics from database</p>
            </div>
            <button 
              onClick={fetchUsers}
              className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/40 px-3 py-1.5 rounded-xl font-bold cursor-pointer hover:bg-orange-500 hover:text-white transition-all"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Counters Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#121017] p-3 rounded-xl border border-gray-800 text-center">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Total Users</span>
              <h4 className="text-lg font-black text-white mt-0.5">{totalUsers}</h4>
            </div>
            <div className="bg-[#121017] p-3 rounded-xl border border-gray-800 text-center">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider">Active (7 Days)</span>
              <h4 className="text-lg font-black text-emerald-400 mt-0.5">{activeUsers}</h4>
            </div>
          </div>

          {loadingUsers ? (
            <p className="text-xs text-gray-400 text-center py-6">Loading users from database...</p>
          ) : usersList.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No users found.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-none">
              {usersList.map((u, idx) => (
                <div key={idx} className="bg-[#121017] p-3 rounded-xl border border-gray-800 flex justify-between items-center text-xs">
                  <div className="truncate pr-2">
                    <p className="font-bold text-white truncate">{u.email}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Last Login: {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="flex items-center space-x-1 bg-yellow-500/10 border border-yellow-500/30 px-2.5 py-1 rounded-lg shrink-0">
                    <span className="text-yellow-400 text-[10px]">🟡</span>
                    <span className="font-bold text-yellow-400 text-[11px]">{u.coins} Coins</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
    

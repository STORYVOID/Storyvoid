import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { AdminPanel } from './AdminPanel';
import { AuthScreen } from './components/AuthScreen';
import { AudioPlayer } from './components/AudioPlayer';
import { EpisodeList } from './components/EpisodeList';
import { ProfileView } from './components/ProfileView';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'library' | 'profile' | 'admin'>('home');
  const [coins, setCoins] = useState<number>(30);
  const [stories, setStories] = useState<any[]>([]);
  const [loadingStories, setLoadingStories] = useState<boolean>(true);
  const [selectedStoryTitle, setSelectedStoryTitle] = useState<string | null>(null);
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>('All');

  // Audio Player & Unlocked Episodes State
  const [currentPlayingEpisode, setCurrentPlayingEpisode] = useState<any>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [unlockedEpisodes, setUnlockedEpisodes] = useState<Record<string, boolean>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Authentication State with localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('storyvoid_logged_in') === 'true';
  });
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('storyvoid_email') || '';
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('storyvoid_is_admin') === 'true';
  });

  const ADMIN_EMAIL = 'storyvoid.admin@gmail.com';
  const ADMIN_PASSWORD = 'VoidAdmin#2026';

  const genresList = ['All', 'Fantasy', 'Romance', 'Thriller', 'Horror', 'Mystery', 'Action', 'Drama', 'Sci-Fi', 'Comedy', 'Crime'];

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

  const handleLogin = (email: string, pass: string) => {
    if (!email) {
      alert('Please enter your email!');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === ADMIN_EMAIL) {
      if (pass !== ADMIN_PASSWORD) {
        alert('❌ Incorrect Admin Password!');
        return;
      }
      setIsAdmin(true);
      localStorage.setItem('storyvoid_is_admin', 'true');
      alert('🔓 Welcome Admin!');
    } else {
      setIsAdmin(false);
      localStorage.removeItem('storyvoid_is_admin');
      alert('👤 Logged in as Listener.');
    }
    setUserEmail(cleanEmail);
    setIsLoggedIn(true);
    localStorage.setItem('storyvoid_logged_in', 'true');
    localStorage.setItem('storyvoid_email', cleanEmail);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserEmail('');
    setActiveTab('home');
    setCurrentPlayingEpisode(null);
    localStorage.removeItem('storyvoid_logged_in');
    localStorage.removeItem('storyvoid_email');
    localStorage.removeItem('storyvoid_is_admin');
  };

  const watchAdForCoins = () => {
    setCoins(prev => prev + 20);
    alert('🎉 Ad watched! +20 coins added.');
  };

  const handleEpisodeAction = (ep: any, allSeriesEpisodes: any[], index: number) => {
    setCurrentPlaylist(allSeriesEpisodes);
    setCurrentIndex(index);

    const price = Number(ep.coin_price) || 0;
    const isUnlocked = price === 0 || unlockedEpisodes[ep.id] || false;

    if (!isUnlocked) {
      if (coins < price) {
        alert(`❌ Not enough coins! This episode requires ${price} coins. Watch an ad to earn more.`);
        return;
      }
      setCoins(prev => prev - price);
      setUnlockedEpisodes(prev => ({ ...prev, [ep.id]: true }));
      alert(`🎉 Episode unlocked successfully for ${price} coins!`);
    }

    playAudio(ep);
  };

  const playAudio = (ep: any) => {
    setCurrentPlayingEpisode(ep);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = ep.audio_url || '';
      audioRef.current.play().catch(e => console.log('Audio play error:', e));
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    if (currentIndex < currentPlaylist.length - 1) {
      const nextIdx = currentIndex + 1;
      const nextEp = currentPlaylist[nextIdx];
      handleEpisodeAction(nextEp, currentPlaylist, nextIdx);
    } else {
      alert('✨ This is the last episode of the series!');
    }
  };

  const playPrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      const prevEp = currentPlaylist[prevIdx];
      handleEpisodeAction(prevEp, currentPlaylist, prevIdx);
    } else {
      alert('✨ This is the first episode!');
    }
  };

  const uniqueSeriesMap = new Map();
  stories.forEach(item => {
    if (item.title && !uniqueSeriesMap.has(item.title)) {
      uniqueSeriesMap.set(item.title, {
        title: item.title,
        genre: item.genre || 'Thriller',
        description: item.description,
        poster_url: item.poster_url || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400',
        episodesCount: 1
      });
    } else if (item.title) {
      const existing = uniqueSeriesMap.get(item.title);
      existing.episodesCount += 1;
    }
  });
  const uniqueSeriesList = Array.from(uniqueSeriesMap.values());

  const filteredSeriesList = selectedGenreFilter === 'All' 
    ? uniqueSeriesList 
    : uniqueSeriesList.filter((s: any) => s.genre?.toLowerCase() === selectedGenreFilter.toLowerCase());

  if (!isLoggedIn) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="bg-[#0f0d13] min-h-screen text-white font-sans pb-40 selection:bg-orange-500">
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

      <audio ref={audioRef} onEnded={playNext} />

      {activeTab === 'home' && (
        <div className="p-4 space-y-4">
          {selectedStoryTitle ? (
            <EpisodeList 
              selectedStoryTitle={selectedStoryTitle}
              stories={stories}
              unlockedEpisodes={unlockedEpisodes}
              onBack={() => setSelectedStoryTitle(null)}
              onEpisodeAction={handleEpisodeAction}
            />
          ) : (
            <div>
              <div className="flex overflow-x-auto space-x-2 pb-2 mb-4 scrollbar-none">
                {genresList.map((genre, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedGenreFilter(genre)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${selectedGenreFilter === genre ? 'bg-orange-500 text-white shadow-md' : 'bg-[#16131c] text-gray-400 border border-gray-800 hover:text-white'}`}
                  >
                    {genre}
                  </button>
                ))}
              </div>

              <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 mb-6 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wide">🟡 Earn Free Coins</h3>
                  <p className="text-[11px] text-gray-300">Watch a short ad to get +20 coins.</p>
                </div>
                <button 
                  onClick={watchAdForCoins}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md cursor-pointer"
                >
                  Watch Ad
                </button>
              </div>

              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide">
                  {selectedGenreFilter === 'All' ? 'All Audio Series' : `${selectedGenreFilter} Series`}
                </h3>
                <button onClick={fetchStories} className="text-[10px] text-orange-400 underline cursor-pointer">Refresh</button>
              </div>

              {loadingStories ? (
                <p className="text-xs text-gray-400 text-center py-6">Loading series...</p>
              ) : filteredSeriesList.length === 0 ? (
                <div className="bg-[#16131c] p-4 rounded-xl border border-gray-800 text-center">
                  <p className="text-xs text-gray-400 mb-2">No series found in this genre.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filteredSeriesList.map((series: any, idx: number) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedStoryTitle(series.title)}
                      className="bg-[#16131c] rounded-xl p-2.5 border border-gray-800 cursor-pointer hover:border-orange-500 transition-all"
                    >
                      <img 
                        src={series.poster_url} 
                        alt="Poster" 
                        className="h-36 w-full object-cover rounded-lg mb-2 border border-gray-700" 
                      />
                      <span className="text-[9px] bg-orange-900/60 text-orange-300 px-2 py-0.5 rounded-full font-bold">
                        {series.genre}
                      </span>
                      <h4 className="text-xs font-bold truncate mt-1 text-white">{series.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{series.episodesCount} Episodes</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

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

      {activeTab === 'library' && (
        <div className="p-4">
          <h2 className="text-lg font-bold text-orange-500 mb-1">Your Library</h2>
          <p className="text-xs text-gray-400">No saved stories yet.</p>
        </div>
      )}

      {activeTab === 'profile' && (
        <ProfileView userEmail={userEmail} isAdmin={isAdmin} onLogout={handleLogout} />
      )}

      {activeTab === 'admin' && isAdmin && (
        <div className="p-4 pb-12">
          <AdminPanel stories={stories} fetchStories={fetchStories} />
        </div>
      )}

      <AudioPlayer 
        currentPlayingEpisode={currentPlayingEpisode}
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
        playNext={playNext}
        playPrev={playPrev}
      />

      <div className="fixed bottom-0 left-0 right-0 bg-[#121017] border-t border-gray-800 flex justify-around py-3 px-2 z-50">
        <button onClick={() => { setActiveTab('home'); setSelectedStoryTitle(null); }} className={`flex flex-col items-center text-xs cursor-pointer ${activeTab === 'home' ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
          <span>🏠</span>
          <span className="text-[10px] mt-1">HOME</span>
        </button>
        <button onClick={() => setActiveTab('search')} className={`flex flex-col items-center text-xs cursor-pointer ${activeTab === 'search' ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
          <span>🔍</span>
          <span className="text-[10px] mt-1">SEARCH</span>
        </button>
        <button onClick={() => setActiveTab('library')} className={`flex flex-col items-center text-xs cursor-pointer ${activeTab === 'library' ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
          <span>📚</span>
          <span className="text-[10px] mt-1">LIBRARY</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center text-xs cursor-pointer ${activeTab === 'profile' ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
          <span>👤</span>
          <span className="text-[10px] mt-1">PROFILE</span>
        </button>
        {isAdmin && (
          <button onClick={() => setActiveTab('admin')} className={`flex flex-col items-center text-xs cursor-pointer ${activeTab === 'admin' ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
            <span>🛠️</span>
            <span className="text-[10px] mt-1">ADMIN</span>
          </button>
        )}
      </div>
    </div>
  );
}
  

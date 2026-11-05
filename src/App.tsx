import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { AdminPanel } from './AdminPanel';
import { AuthScreen } from './components/AuthScreen';
import { AudioPlayer } from './components/AudioPlayer';
import { EpisodeList } from './components/EpisodeList';
import { ProfileView } from './components/ProfileView';
import { SearchView } from './components/SearchView';
import { LibraryView } from './components/LibraryView';
import { NotificationModal } from './components/NotificationModal';
import { SplashScreen } from './components/SplashScreen';
import { CoinStoreModal } from './components/CoinStoreModal';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'library' | 'profile' | 'admin'>('home');
  const [coins, setCoins] = useState<number>(30);
  const [isCoinStoreOpen, setIsCoinStoreOpen] = useState<boolean>(false);
  const [stories, setStories] = useState<any[]>([]);
  const [loadingStories, setLoadingStories] = useState<boolean>(true);
  const [selectedStoryTitle, setSelectedStoryTitle] = useState<string | null>(null);
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>('All');

  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; title: string; message: string; isSuccess: boolean }>({
    isOpen: false,
    title: '',
    message: '',
    isSuccess: true,
  });

  const showAppAlert = (title: string, message: string, isSuccess = true) => {
    setModalConfig({ isOpen: true, title, message, isSuccess });
  };

  const [currentPlayingEpisode, setCurrentPlayingEpisode] = useState<any>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('storyvoid_logged_in') === 'true';
  });
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('storyvoid_email') || '';
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('storyvoid_is_admin') === 'true';
  });

  const [unlockedEpisodes, setUnlockedEpisodes] = useState<Record<string, boolean>>(() => {
    try {
      const email = localStorage.getItem('storyvoid_email') || '';
      const saved = localStorage.getItem(`storyvoid_unlocked_${email}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const ADMIN_EMAIL = 'storyvoid.admin@gmail.com';
  const ADMIN_PASSWORD = 'VoidAdmin#2026';

  const genresList = ['All', 'Fantasy', 'Romance', 'Crime', 'Thriller', 'Horror', 'Mystery', 'Action', 'Drama', 'Sci-Fi', 'Comedy'];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    fetchStories();
    if (userEmail) {
      fetchUserCoins(userEmail);
      const saved = localStorage.getItem(`storyvoid_unlocked_${userEmail}`);
      setUnlockedEpisodes(saved ? JSON.parse(saved) : {});
    }
    return () => clearTimeout(timer);
  }, [userEmail]);

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

  const fetchUserCoins = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('coins')
        .eq('email', email)
        .maybeSingle();
      
      if (data && data.coins !== undefined) {
        setCoins(data.coins);
      }
    } catch (err) {
      console.error('Error fetching coins from DB:', err);
    }
  };

  const updateUserCoinsInDB = async (newCoins: number, email: string) => {
    try {
      const { error } = await supabase
        .from('app_users')
        .update({ coins: newCoins })
        .eq('email', email);

      if (error) {
        console.error('Error updating coins in DB:', error.message);
      }
    } catch (err) {
      console.error('Error updating coins in DB:', err);
    }
  };

  const handleLogin = async (email: string, pass: string) => {
    if (!email) {
      showAppAlert('Error', 'Please enter your email!', false);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    
    try {
      const { data: existingUser } = await supabase
        .from('app_users')
        .select('coins')
        .eq('email', cleanEmail)
        .maybeSingle();

      const initialCoins = existingUser?.coins ?? 30;

      await supabase.from('app_users').upsert(
        [{ email: cleanEmail, coins: initialCoins, last_login: new Date().toISOString() }],
        { onConflict: 'email' }
      );
      setCoins(initialCoins);
    } catch (err) {
      console.error('Error saving user to DB:', err);
    }

    const savedUnlocked = localStorage.getItem(`storyvoid_unlocked_${cleanEmail}`);
    setUnlockedEpisodes(savedUnlocked ? JSON.parse(savedUnlocked) : {});

    if (cleanEmail === ADMIN_EMAIL) {
      if (pass !== ADMIN_PASSWORD) {
        showAppAlert('Access Denied', 'Incorrect Admin Password!', false);
        return;
      }
      setIsAdmin(true);
      localStorage.setItem('storyvoid_is_admin', 'true');
      showAppAlert('Welcome Admin', '🔓 Logged in as Administrator successfully.');
    } else {
      setIsAdmin(false);
      localStorage.removeItem('storyvoid_is_admin');
      showAppAlert('Welcome Listener', '👤 Logged in successfully.');
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
    setUnlockedEpisodes({});
    setCurrentPlayingEpisode(null);
    localStorage.removeItem('storyvoid_logged_in');
    localStorage.removeItem('storyvoid_email');
    localStorage.removeItem('storyvoid_is_admin');
  };

  const watchAdForCoins = async () => {
    const updatedCoins = coins + 20;
    setCoins(updatedCoins);
    if (userEmail) {
      await updateUserCoinsInDB(updatedCoins, userEmail);
    }
    showAppAlert('Coins Added', '🎉 Ad watched successfully! +20 coins added to your wallet.');
  };

  const handleBuyCoins = async (coinsToAdd: number, amount: number) => {
    const updatedCoins = coins + coinsToAdd;
    setCoins(updatedCoins);
    if (userEmail) {
      await updateUserCoinsInDB(updatedCoins, userEmail);
    }
    showAppAlert('Coins Added', `🎉 Successfully purchased ${coinsToAdd} coins for ₹${amount}!`);
  };

  const handleUnlockEpisode = async (ep: any, price: number) => {
    if (coins < price) {
      showAppAlert('Insufficient Coins', `❌ You need ${price} coins to unlock this episode. Watch an ad or buy coins from store!`, false);
      return false;
    }
    const updatedCoins = coins - price;
    setCoins(updatedCoins);
    
    // Database me turant coins update karo taaki refresh karne par wapas na aayein
    if (userEmail) {
      await updateUserCoinsInDB(updatedCoins, userEmail);
    }
    
    const newUnlocked = { ...unlockedEpisodes, [ep.id]: true };
    setUnlockedEpisodes(newUnlocked);
    if (userEmail) {
      localStorage.setItem(`storyvoid_unlocked_${userEmail}`, JSON.stringify(newUnlocked));
    }
    return true;
  };

  const handleEpisodeAction = (ep: any, allSeriesEpisodes: any[], index: number) => {
    setCurrentPlaylist(allSeriesEpisodes);
    setCurrentIndex(index);
    playAudio(ep);
    saveListeningHistory(ep);
  };

  const saveListeningHistory = (ep: any) => {
    try {
      const savedHistory = localStorage.getItem('storyvoid_listening_history');
      let historyList: any[] = savedHistory ? JSON.parse(savedHistory) : [];

      historyList = historyList.filter(item => item.id !== ep.id);
      historyList.unshift({
        id: ep.id,
        title: ep.title,
        episode_title: ep.episode_title,
        poster_url: ep.poster_url,
        genre: ep.genre,
      });

      if (historyList.length > 20) historyList.pop();

      localStorage.setItem('storyvoid_listening_history', JSON.stringify(historyList));
    } catch (err) {
      console.error('Error saving history:', err);
    }
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
      showAppAlert('Playback Info', '✨ This is the last episode of the series!');
    }
  };

  const playPrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      const prevEp = currentPlaylist[prevIdx];
      handleEpisodeAction(prevEp, currentPlaylist, prevIdx);
    } else {
      showAppAlert('Playback Info', '✨ This is the first episode!');
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

  const featuredTitle = localStorage.getItem('storyvoid_featured_title');
  const customBannerImg = localStorage.getItem('storyvoid_custom_banner_image');
  const featuredStoryData = uniqueSeriesList.find((s: any) => s.title === featuredTitle);

  const promoTitle = localStorage.getItem('storyvoid_promo_title');
  const promoMedia = localStorage.getItem('storyvoid_promo_media');
  const promoLink = localStorage.getItem('storyvoid_promo_link');

  if (showSplash) {
    return <SplashScreen />;
  }

  if (!isLoggedIn) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="bg-[#0f0d13] min-h-screen text-white font-sans pb-40 selection:bg-orange-500">
      <NotificationModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        isSuccess={modalConfig.isSuccess}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      <CoinStoreModal 
        isOpen={isCoinStoreOpen}
        onClose={() => setIsCoinStoreOpen(false)}
        onBuyCoins={handleBuyCoins}
      />

      <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#121017]">
        <div>
          <h1 className="text-xl font-extrabold tracking-wider text-orange-500">STORYVOID</h1>
          <p className="text-[10px] text-gray-400">SERIALIZED AUDIO</p>
        </div>
        <div 
          onClick={() => setIsCoinStoreOpen(true)}
          className="flex items-center bg-gray-800 px-3.5 py-1.5 rounded-full border border-gray-700 cursor-pointer hover:border-orange-500 transition-all shadow-md"
        >
          <span className="text-yellow-400 mr-1.5">🟡</span>
          <span className="text-xs font-semibold">{coins} Coins</span>
          <span className="ml-1.5 text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold">+</span>
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
              coins={coins}
              onUnlockEpisode={handleUnlockEpisode}
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

              {promoMedia ? (
                <div 
                  onClick={() => {
                    if (promoLink) window.open(promoLink, '_blank');
                  }}
                  className="relative rounded-2xl overflow-hidden border border-orange-500/40 mb-4 h-44 flex flex-col justify-end p-4 cursor-pointer shadow-xl group hover:border-orange-500 transition-all bg-[#16131c]"
                >
                  {promoMedia.match(/\.(mp4|webm|ogg)$/i) || promoMedia.includes('video') ? (
                    <video 
                      src={promoMedia} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      className="absolute inset-0 bg-cover bg-center" 
                      style={{ backgroundImage: `url(${promoMedia})` }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d13] via-[#0f0d13]/50 to-transparent"></div>
                  
                  <div className="relative z-10 space-y-1">
                    <span className="text-[9px] bg-red-600 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block">
                      📢 Sponsored Promo / Ad
                    </span>
                    <h3 className="text-base font-black text-white">{promoTitle || 'Special Promotion'}</h3>
                    <div className="pt-1">
                      <span className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-1.5 rounded-xl text-[11px] shadow-md transition-all inline-block">
                        🔗 Tap to Visit Link
                      </span>
                    </div>
                  </div>
                </div>
              ) : featuredStoryData ? (
                <div 
                  onClick={() => setSelectedStoryTitle(featuredStoryData.title)}
                  className="relative rounded-2xl overflow-hidden border border-orange-500/40 mb-4 h-44 flex flex-col justify-end p-4 cursor-pointer shadow-xl group hover:border-orange-500 transition-all bg-cover bg-center"
                  style={{ backgroundImage: `url(${customBannerImg || featuredStoryData.poster_url})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d13] via-[#0f0d13]/70 to-transparent"></div>
                  
                  <div className="relative z-10 space-y-1">
                    <span className="text-[9px] bg-orange-500 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block">
                      🔥 Trending & Featured
                    </span>
                    <h3 className="text-base font-black text-white">{featuredStoryData.title}</h3>
                    <p className="text-[10px] text-gray-300 line-clamp-1 leading-relaxed">{featuredStoryData.description || 'Listen to this amazing audio series now.'}</p>
                    <div className="pt-1">
                      <span className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-1.5 rounded-xl text-[11px] shadow-md transition-all inline-block">
                        ✨ Play Now
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 mb-6 flex justify-between items-center shadow-md">
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
                      className="bg-[#16131c] rounded-xl p-2.5 border border-gray-800 cursor-pointer hover:border-orange-500 transition-all shadow-md"
                    >
                      <img 
                        src={series.poster_url} 
                        alt="Poster" 
                        className="h-36 w-full object-cover rounded-lg mb-2 border border-gray-700" 
                      />
                      <span className="text-[9px] bg-orange-900/60 text-orange-300 px-2.5 py-0.5 rounded-full font-bold inline-block">
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
        <SearchView 
          stories={stories}
          unlockedEpisodes={unlockedEpisodes}
          coins={coins}
          onEpisodeAction={handleEpisodeAction}
          onUnlockEpisode={handleUnlockEpisode}
        />
      )}

      {activeTab === 'library' && (
        <LibraryView 
          stories={stories}
          unlockedEpisodes={unlockedEpisodes}
          coins={coins}
          onEpisodeAction={handleEpisodeAction}
          onUnlockEpisode={handleUnlockEpisode}
        />
      )}

      {activeTab === 'profile' && (
        <ProfileView 
          userEmail={userEmail} 
          isAdmin={isAdmin} 
          onLogout={handleLogout}
          onOpenCoinStore={() => setIsCoinStoreOpen(true)}
          onWatchAd={watchAdForCoins}
          coins={coins}
        />
      )}

      {activeTab === 'admin' && isAdmin && (
        <div className="p-4 pb-12">
          <AdminPanel stories={stories} fetchStories={fetchStories} setSuccessMessage={(msg) => showAppAlert('Success', msg)} />
        </div>
      )}

      <AudioPlayer 
        currentPlayingEpisode={currentPlayingEpisode}
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
        playNext={playNext}
        playPrev={playPrev}
        audioRef={audioRef}
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

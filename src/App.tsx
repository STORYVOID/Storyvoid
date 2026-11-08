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

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'home' | 'search' | 'library' | 'profile' | 'admin'
  >('home');

  const [coins, setCoins] = useState(30);
  const [isCoinStoreOpen, setIsCoinStoreOpen] = useState(false);

  const [stories, setStories] = useState<any[]>([]);
  const [loadingStories, setLoadingStories] = useState(false);

  const [selectedStoryTitle, setSelectedStoryTitle] = useState('');
  const [selectedGenreFilter, setSelectedGenreFilter] = useState('All');

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    isSuccess: false,
  });

  const [currentPlayingEpisode, setCurrentPlayingEpisode] =
    useState<any>(null);

  const [currentPlaylist, setCurrentPlaylist] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const [unlockedEpisodes, setUnlockedEpisodes] = useState<
    Record<string, boolean>
  >({});

  const audioRef = useRef<HTMLAudioElement>(null);
  const authUserIdRef = useRef<string | null>(null);

  const genres = [
    'All',
    'Fantasy',
    'Romance',
    'Crime',
    'Thriller',
    'Horror',
    'Mystery',
    'Action',
    'Drama',
    'Sci-Fi',
    'Comedy',
  ];

  const showMessage = (
    title: string,
    message: string,
    isSuccess = false
  ) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      isSuccess,
    });
  };

  // SUPABASE WALLET DATA
  const fetchUserWallet = async (userId: string) => {
    try {
      const [walletResult, unlockedResult] = await Promise.all([
        supabase
          .from('app_users')
          .select('coins')
          .eq('id', userId)
          .maybeSingle(),

        supabase
          .from('unlocked_episodes')
          .select('episode_id')
          .eq('user_id', userId),
      ]);

      if (walletResult.error) {
        console.error('Wallet fetch error:', walletResult.error);
      } else if (walletResult.data) {
        setCoins(walletResult.data.coins ?? 30);
      }

      if (unlockedResult.error) {
        console.error('Unlocked episodes error:', unlockedResult.error);
      } else {
        const unlockedMap: Record<string, boolean> = {};

        (unlockedResult.data || []).forEach((item: any) => {
          unlockedMap[item.episode_id] = true;
        });

        setUnlockedEpisodes(unlockedMap);
      }
    } catch (error) {
      console.error('Wallet loading failed:', error);
    }
  };

  // AUTH USER HANDLER
  const applyAuthUser = async (user: any) => {
    if (!user) {
      authUserIdRef.current = null;

      setIsLoggedIn(false);
      setUserEmail('');
      setIsAdmin(false);
      setCoins(30);
      setUnlockedEpisodes({});

      return;
    }

    authUserIdRef.current = user.id;

    const email = (user.email || '').toLowerCase();

    setIsLoggedIn(true);
    setUserEmail(email);
    setIsAdmin(user.app_metadata?.role === 'admin');

    setCoins(30);
    setUnlockedEpisodes({});

    await fetchUserWallet(user.id);
  };

  // APP INITIALIZATION
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    fetchStories();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => {
        void applyAuthUser(session?.user || null);
      }, 0);
    });

    const restoreSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        await applyAuthUser(session?.user || null);
      } catch (error) {
        console.error('Session restore error:', error);
      } finally {
        setAuthReady(true);
      }
    };

    void restoreSession();

    return () => {
      clearTimeout(splashTimer);
      subscription.unsubscribe();
    };
  }, []);

  // LOGIN
  const handleLogin = async (_email: string, _pass: string) => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;

      if (session?.user) {
        await applyAuthUser(session.user);

        showMessage(
          'Welcome to STORYVOID',
          'You are successfully logged in!',
          true
        );
      }
    } catch (error: any) {
      showMessage(
        'Login Error',
        error.message || 'Unable to login.'
      );
    }
  };

  // LOGOUT
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();

      await applyAuthUser(null);

      setCurrentPlayingEpisode(null);
      setCurrentPlaylist([]);
      setCurrentIndex(0);
      setIsPlaying(false);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      setActiveTab('home');
    } catch (error: any) {
      showMessage(
        'Logout Error',
        error.message || 'Unable to logout.'
      );
    }
  };

  // FETCH STORIES
  const fetchStories = async () => {
    try {
      setLoadingStories(true);

      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setStories(data || []);
    } catch (error) {
      console.error('Stories loading error:', error);
    } finally {
      setLoadingStories(false);
    }
  };
    // WATCH AD
  // Real ad network connect hone ke baad hi coins reward diye jayenge.
  const watchAdForCoins = () => {
    showMessage(
      'Ad Reward Not Connected',
      'Watch Ads feature abhi connect nahi hai. Coins abhi ads dekhne par nahi milenge.'
    );
  };

  // BUY COINS
  const handleBuyCoins = () => {
    showMessage(
      'Coming Soon',
      'Coin purchase aur payment system jald hi available hoga.'
    );
  };

  // UNLOCK EPISODE USING SUPABASE RPC
  const handleUnlockEpisode = async (
    episodeId: string,
    price: number
  ): Promise<boolean> => {
    if (!isLoggedIn) {
      showMessage(
        'Login Required',
        'Episode unlock karne ke liye pehle login karo.'
      );
      return false;
    }

    if (unlockedEpisodes[episodeId]) {
      return true;
    }

    try {
      const { data, error } = await supabase.rpc(
        'unlock_episode_with_coins',
        {
          p_episode_id: episodeId,
        }
      );

      if (error) {
        console.error('Episode unlock error:', error);

        showMessage(
          'Unlock Failed',
          'Episode unlock nahi ho paya. Dobara try karo.'
        );

        return false;
      }

      const result = Array.isArray(data) ? data[0] : data;

      if (!result) {
        showMessage(
          'Unlock Failed',
          'Server se valid response nahi mila.'
        );

        return false;
      }

      if (result.balance !== null && result.balance !== undefined) {
        setCoins(Number(result.balance));
      }

      if (
        result.message === 'unlocked' ||
        result.message === 'already_unlocked'
      ) {
        setUnlockedEpisodes((previous) => ({
          ...previous,
          [episodeId]: true,
        }));

        if (result.message === 'unlocked') {
          showMessage(
            'Episode Unlocked!',
            `Episode successfully unlock ho gaya. ${price} coins use hue.`,
            true
          );
        }

        return true;
      }

      if (result.message === 'insufficient_coins') {
        showMessage(
          'Insufficient Coins',
          'Aapke paas is episode ko unlock karne ke liye enough coins nahi hain.'
        );

        return false;
      }

      if (result.message === 'not_logged_in') {
        showMessage(
          'Login Required',
          'Episode unlock karne ke liye login karo.'
        );

        return false;
      }

      if (result.message === 'user_record_not_found') {
        showMessage(
          'Account Error',
          'Aapka wallet record nahi mila. Please dobara login karo.'
        );

        return false;
      }

      if (result.message === 'episode_not_found') {
        showMessage(
          'Episode Not Found',
          'Ye episode ab available nahi hai.'
        );

        return false;
      }

      showMessage(
        'Unlock Failed',
        result.message || 'Episode unlock nahi ho paya.'
      );

      return false;
    } catch (error: any) {
      console.error('Unlock exception:', error);

      showMessage(
        'Error',
        error.message || 'Something went wrong.'
      );

      return false;
    }
  };

  // LISTENING HISTORY
  const saveListeningHistory = (episode: any) => {
    try {
      const oldHistory = JSON.parse(
        localStorage.getItem('storyvoid_listening_history') || '[]'
      );

      const filteredHistory = oldHistory.filter(
        (item: any) => item.id !== episode.id
      );

      filteredHistory.unshift({
        ...episode,
        listenedAt: new Date().toISOString(),
      });

      localStorage.setItem(
        'storyvoid_listening_history',
        JSON.stringify(filteredHistory.slice(0, 20))
      );
    } catch (error) {
      console.error('Listening history error:', error);
    }
  };

  // PLAY AUDIO
  const playAudio = (episode: any) => {
    if (!episode) return;

    if (!episode.audio_url) {
      showMessage(
        'Audio Unavailable',
        'Is episode ka audio abhi available nahi hai.'
      );

      setIsPlaying(false);
      return;
    }

    setCurrentPlayingEpisode(episode);
    setIsPlaying(true);

    if (audioRef.current) {
      audioRef.current.src = episode.audio_url;
      audioRef.current.load();

      const playPromise = audioRef.current.play();

      if (playPromise) {
        playPromise.catch((error) => {
          console.error('Audio play error:', error);
          setIsPlaying(false);
        });
      }
    }
  };

  // EPISODE ACTION
  const handleEpisodeAction = async (
    episode: any,
    playlist: any[] = []
  ) => {
    if (!episode) return;

    const episodePrice = Number(episode.coin_price || 0);

    if (
      episodePrice > 0 &&
      !unlockedEpisodes[episode.id]
    ) {
      const unlocked = await handleUnlockEpisode(
        episode.id,
        episodePrice
      );

      if (!unlocked) return;
    }

    const selectedPlaylist =
      playlist.length > 0 ? playlist : [episode];

    const selectedIndex = selectedPlaylist.findIndex(
      (item: any) => item.id === episode.id
    );

    setCurrentPlaylist(selectedPlaylist);
    setCurrentIndex(selectedIndex >= 0 ? selectedIndex : 0);

    playAudio(episode);
    saveListeningHistory(episode);
  };

  // PLAY / PAUSE
  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((error) => {
          console.error('Audio resume error:', error);
          setIsPlaying(false);
        });
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // NEXT EPISODE
  const handleNextEpisode = () => {
    if (currentIndex < currentPlaylist.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextEpisode = currentPlaylist[nextIndex];

      setCurrentIndex(nextIndex);
      playAudio(nextEpisode);
      saveListeningHistory(nextEpisode);
    }
  };

  // PREVIOUS EPISODE
  const handlePreviousEpisode = () => {
    if (currentIndex > 0) {
      const previousIndex = currentIndex - 1;
      const previousEpisode = currentPlaylist[previousIndex];

      setCurrentIndex(previousIndex);
      playAudio(previousEpisode);
      saveListeningHistory(previousEpisode);
    }
  };

  // AUDIO ENDED
  const handleAudioEnded = () => {
    if (currentIndex < currentPlaylist.length - 1) {
      handleNextEpisode();
    } else {
      setIsPlaying(false);
    }
  };

  // GROUP EPISODES INTO STORIES
  const groupedStories = stories.reduce(
    (groups: Record<string, any>, episode: any) => {
      const title = episode.title || 'Untitled Story';

      if (!groups[title]) {
        groups[title] = {
          title,
          genre: episode.genre || 'Drama',
          description: episode.description || '',
          poster_url: episode.poster_url || episode.cover_url || '',
          cover_url: episode.cover_url || episode.poster_url || '',
          episodes: [],
        };
      }

      groups[title].episodes.push(episode);

      return groups;
    },
    {}
  );

  const series = Object.values(groupedStories).map(
    (story: any) => ({
      ...story,
      episodes: story.episodes.sort(
        (a: any, b: any) =>
          Number(a.episode_number || 1) -
          Number(b.episode_number || 1)
      ),
      episodesCount: story.episodes.length,
    })
  );

  // FEATURED STORY
  const featuredStory = series[0] || null;

  // PROMO BANNER
  const promoBanner = {
    title: 'Discover Your Next Adventure',
    subtitle: 'Listen to amazing stories on STORYVOID',
  };

  // SELECTED STORY
  const selectedStory = series.find(
    (story: any) => story.title === selectedStoryTitle
  );

  // FILTER STORIES BY GENRE
  const filteredStories =
    selectedGenreFilter === 'All'
      ? series
      : series.filter(
          (story: any) =>
            story.genre?.toLowerCase() ===
            selectedGenreFilter.toLowerCase()
        );
    // SPLASH SCREEN
  // READ EXISTING BANNER SETTINGS — DO NOT MODIFY THEM
  const savedFeaturedTitle =
    typeof window !== 'undefined'
      ? localStorage.getItem('storyvoid_featured_title') || ''
      : '';

  const customBannerImage =
    typeof window !== 'undefined'
      ? localStorage.getItem('storyvoid_custom_banner_image') || ''
      : '';

  const bannerStory =
    series.find((story: any) => story.title === savedFeaturedTitle) ||
    featuredStory;

  const bannerTitle =
    savedFeaturedTitle || bannerStory?.title || 'Discover Amazing Stories';

  const bannerImage =
    customBannerImage ||
    bannerStory?.poster_url ||
    bannerStory?.cover_url ||
    '';

  // SPLASH SCREEN
  if (showSplash) {
    return <SplashScreen />;
  }

  // AUTH SCREEN
  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#0e0c12] flex items-center justify-center text-white">
        Loading STORYVOID...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0e0c12] text-white pb-24">

      {/* HEADER */}
      <header className="bg-[#100e15] border-b border-[#292431] px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[25px] leading-none font-black tracking-wide text-[#ff741c]">
              STORYVOID
            </h1>
            <p className="text-[11px] text-gray-400 mt-2 tracking-wider font-bold">
              SERIALIZED AUDIO
            </p>
          </div>

          <button
            onClick={() => setIsCoinStoreOpen(true)}
            className="flex items-center gap-2 bg-[#202938] border border-[#343d4c] rounded-full px-4 py-3 text-white"
          >
            <span className="text-2xl">🟡</span>
            <span className="font-bold text-sm">{coins} Coins</span>
            <span className="bg-[#ff741c] rounded-full w-7 h-7 flex items-center justify-center font-bold">
              +
            </span>
          </button>
        </div>
      </header>

      {/* AUDIO */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <main className="px-4 pt-4">

        {/* HOME */}
        {activeTab === 'home' && (
          <div className="space-y-6">

            {/* GENRES */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => {
                    setSelectedGenreFilter(genre);
                    setSelectedStoryTitle('');
                  }}
                  className={`shrink-0 rounded-full px-4 py-3 text-sm font-bold border ${
                    selectedGenreFilter === genre
                      ? 'bg-[#ff741c] text-white border-[#ff741c]'
                      : 'bg-[#17141d] text-gray-400 border-[#302b39]'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            {/* FEATURED BANNER — EXISTING IMAGE SETTING PRESERVED */}
            {!selectedStory && (
              <div
                className="relative w-full overflow-hidden rounded-[25px] border border-[#69422e]"
                style={{ aspectRatio: '2.05 / 1' }}
              >
                {bannerImage && (
                  <img
                    src={bannerImage}
                    alt={bannerTitle}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="inline-block rounded-full bg-[#ff741c] px-3 py-1 text-[11px] font-black tracking-wide">
                    🔥 TRENDING & FEATURED
                  </span>

                  <h2 className="text-xl font-black mt-3">
                    {bannerTitle}
                  </h2>

                  <p className="text-sm text-gray-200 mt-2 line-clamp-2">
                    {bannerStory?.description || promoBanner.subtitle}
                  </p>

                  <button
                    onClick={() => {
                      if (bannerStory) {
                        setSelectedStoryTitle(bannerStory.title);
                      }
                    }}
                    className="mt-4 rounded-full bg-[#ff741c] px-5 py-3 text-sm font-bold"
                  >
                    ✨ Play Now
                  </button>
                </div>
              </div>
            )}

            {/* FREE COINS */}
            {!selectedStory && (
              <div className="rounded-[25px] border border-[#302b39] bg-[#17141d] p-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-[#ffd329] text-base">
                    🟡 EARN FREE COINS
                  </h3>
                  <p className="text-sm text-gray-300 mt-1">
                    Watch a short ad to get +20 coins.
                  </p>
                </div>

                <button
                  onClick={watchAdForCoins}
                  className="shrink-0 rounded-full bg-[#f4bd00] px-5 py-3 text-sm font-black text-black"
                >
                  Watch Ad
                </button>
              </div>
            )}

            {/* SELECTED STORY EPISODES */}
            {selectedStory ? (
              <div>
                <button
                  onClick={() => setSelectedStoryTitle('')}
                  className="text-[#ff8a43] font-bold mb-4"
                >
                  ← Back to Stories
                </button>

                <h2 className="text-xl font-black mb-4">
                  {selectedStory.title}
                </h2>

                <EpisodeList
                  episodes={selectedStory.episodes}
                  onEpisodeClick={(episode: any) =>
                    handleEpisodeAction(
                      episode,
                      selectedStory.episodes
                    )
                  }
                  unlockedEpisodes={unlockedEpisodes}
                />
              </div>
            ) : (
              <>
                {/* STORY COLLECTION */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black tracking-wide">
                    ALL AUDIO SERIES
                  </h2>

                  <button
                    onClick={fetchStories}
                    className="text-[#ff984e] text-sm font-bold underline"
                  >
                    Refresh
                  </button>
                </div>

                {loadingStories ? (
                  <p className="text-gray-400 text-sm">
                    Loading stories...
                  </p>
                ) : filteredStories.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    No stories available.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {filteredStories.map((story: any) => (
                      <button
                        key={story.title}
                        onClick={() =>
                          setSelectedStoryTitle(story.title)
                        }
                        className="min-w-0 rounded-[22px] border border-[#302b39] bg-[#17141d] p-3 text-left overflow-hidden"
                      >
                        {story.cover_url ? (
                          <img
                            src={story.cover_url}
                            alt={story.title}
                            className="w-full aspect-square rounded-xl object-cover border border-[#393343]"
                          />
                        ) : (
                          <div className="w-full aspect-square rounded-xl bg-[#25202c] flex items-center justify-center">
                            <span className="text-4xl">🎧</span>
                          </div>
                        )}

                        <span className="inline-block mt-3 rounded-full bg-[#542b20] text-[#ffbb83] px-3 py-1 text-[11px] font-bold">
                          {story.genre || 'Drama'}
                        </span>

                        <h3 className="font-black text-sm mt-3 truncate">
                          {story.title}
                        </h3>

                        <p className="text-xs text-gray-400 mt-1">
                          {story.episodesCount}{' '}
                          {story.episodesCount === 1
                            ? 'Episode'
                            : 'Episodes'}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* SEARCH */}
        {activeTab === 'search' && (
          <SearchView
            stories={stories}
            onEpisodeClick={(episode: any) =>
              handleEpisodeAction(episode)
            }
          />
        )}

        {/* LIBRARY */}
        {activeTab === 'library' && (
          <LibraryView
            onEpisodeClick={(episode: any) =>
              handleEpisodeAction(episode)
            }
          />
        )}

        {/* PROFILE */}
        {activeTab === 'profile' && (
          <ProfileView
            userEmail={userEmail}
            coins={coins}
            onLogout={handleLogout}
            onOpenCoinStore={() => setIsCoinStoreOpen(true)}
          />
        )}

        {/* ADMIN */}
        {activeTab === 'admin' && isAdmin && (
          <AdminPanel
            stories={stories}
            fetchStories={fetchStories}
            setSuccessMessage={(message: string) =>
              showMessage('Success', message, true)
            }
          />
        )}
      </main>

      {/* AUDIO PLAYER */}
      {currentPlayingEpisode && (
        <div className="fixed bottom-[68px] left-0 right-0 z-40">
          <AudioPlayer
            episode={currentPlayingEpisode}
            isPlaying={isPlaying}
            onPlayPause={togglePlayPause}
            onNext={handleNextEpisode}
            onPrevious={handlePreviousEpisode}
          />
        </div>
      )}

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#100e15] border-t border-[#302b39] flex justify-around py-3">
        {[
          { id: 'home', label: 'HOME', icon: '🏠' },
          { id: 'search', label: 'SEARCH', icon: '🔍' },
          { id: 'library', label: 'LIBRARY', icon: '📚' },
          { id: 'profile', label: 'PROFILE', icon: '👤' },
          ...(isAdmin
            ? [{ id: 'admin', label: 'ADMIN', icon: '🛠️' }]
            : []),
        ].map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 text-xs font-bold ${
              activeTab === tab.id
                ? 'text-[#ff741c]'
                : 'text-gray-400'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* COIN STORE */}
      {isCoinStoreOpen && (
        <CoinStoreModal
          onClose={() => setIsCoinStoreOpen(false)}
          coins={coins}
          onBuyCoins={handleBuyCoins}
        />
      )}

      {/* MESSAGE MODAL */}
      {modalConfig.isOpen && (
        <NotificationModal
          title={modalConfig.title}
          message={modalConfig.message}
          isSuccess={modalConfig.isSuccess}
          onClose={() =>
            setModalConfig((previous) => ({
              ...previous,
              isOpen: false,
            }))
          }
        />
      )}
    </div>
  );
};

export default App;

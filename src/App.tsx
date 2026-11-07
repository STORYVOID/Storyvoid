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
  if (showSplash) {
    return <SplashScreen />;
  }

  // AUTH SCREEN
  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#0D0F14] flex items-center justify-center text-white">
        Loading STORYVOID...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0D0F14] text-white pb-28">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#0D0F14]/95 backdrop-blur-md border-b border-white/10 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-widest text-white">
            STORY<span className="text-purple-500">VOID</span>
          </h1>

          <button
            onClick={() => setIsCoinStoreOpen(true)}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-2 text-yellow-400 font-bold"
          >
            🪙 {coins}
          </button>
        </div>
      </header>

      {/* AUDIO ELEMENT */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <main className="p-4">
        {/* HOME */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">
                Welcome to STORYVOID
              </h2>
              <p className="text-gray-400 mt-1">
                {promoBanner.subtitle}
              </p>
            </div>

            <div className="rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 p-5">
              <p className="text-sm text-purple-200">
                FEATURED STORY
              </p>

              <h2 className="text-2xl font-bold mt-2">
                {featuredStory?.title || 'Discover Amazing Stories'}
              </h2>

              <p className="text-gray-300 text-sm mt-2">
                {featuredStory?.description || promoBanner.title}
              </p>

              {featuredStory && (
                <button
                  onClick={() =>
                    setSelectedStoryTitle(featuredStory.title)
                  }
                  className="mt-4 bg-white text-black rounded-full px-5 py-2 font-bold"
                >
                  Explore Story
                </button>
              )}
            </div>

            <button
              onClick={watchAdForCoins}
              className="w-full rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-4 text-left"
            >
              <p className="font-bold text-yellow-400">
                🪙 Get Free Coins
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Watch an ad to earn coins (coming soon).
              </p>
            </button>

            <div>
              <h2 className="text-xl font-bold mb-3">
                Browse Genres
              </h2>

              <div className="flex gap-2 overflow-x-auto pb-3">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => {
                      setSelectedGenreFilter(genre);
                      setSelectedStoryTitle('');
                    }}
                    className={`px-4 py-2 rounded-full whitespace-nowrap ${
                      selectedGenreFilter === genre
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {selectedStory ? (
              <div>
                <button
                  onClick={() => setSelectedStoryTitle('')}
                  className="text-purple-400 mb-4"
                >
                  ← Back to Stories
                </button>

                <h2 className="text-xl font-bold mb-2">
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
              <div>
                <h2 className="text-xl font-bold mb-4">
                  {selectedGenreFilter === 'All'
                    ? 'All Stories'
                    : selectedGenreFilter + ' Stories'}
                </h2>

                {loadingStories ? (
                  <p className="text-gray-400">
                    Loading stories...
                  </p>
                ) : filteredStories.length === 0 ? (
                  <p className="text-gray-400">
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
                        className="text-left rounded-xl overflow-hidden bg-white/5 border border-white/10"
                      >
                        {story.cover_url ? (
                          <img
                            src={story.cover_url}
                            alt={story.title}
                            className="w-full aspect-[3/4] object-cover"
                          />
                        ) : (
                          <div className="w-full aspect-[3/4] bg-gradient-to-br from-purple-900 to-gray-900 flex items-center justify-center">
                            <span className="text-3xl">🎧</span>
                          </div>
                        )}

                        <div className="p-3">
                          <h3 className="font-bold line-clamp-2">
                            {story.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">
                            {story.genre} • {story.episodesCount} Episodes
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#151720] border-t border-white/10 flex justify-around py-3">
        {[
          { id: 'home', label: 'Home', icon: '🏠' },
          { id: 'search', label: 'Search', icon: '🔍' },
          { id: 'library', label: 'Library', icon: '📚' },
          { id: 'profile', label: 'Profile', icon: '👤' },
          ...(isAdmin
            ? [{ id: 'admin', label: 'Admin', icon: '⚙️' }]
            : []),
        ].map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 text-xs ${
              activeTab === tab.id
                ? 'text-purple-400'
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

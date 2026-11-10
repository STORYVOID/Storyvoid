
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';

import { AuthScreen } from './components/AuthScreen';
import { AudioPlayer } from './components/AudioPlayer';
import { NotificationModal } from './components/NotificationModal';
import { SplashScreen } from './components/SplashScreen';
import { CoinStoreModal } from './components/CoinStoreModal';

import { AppHeader } from './components/AppHeader';
import { AppTabContent } from './components/AppTabContent';
import { BottomNavigation } from './components/BottomNavigation';

import { useStories } from './hooks/useStories';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'home' | 'search' | 'library' | 'profile' | 'admin'
  >('home');

  const [coins, setCoins] = useState(30);
  const [isCoinStoreOpen, setIsCoinStoreOpen] = useState(false);

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

  const {
    stories,
    loadingStories,
    fetchStories,
    series,
  } = useStories();

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

  // WALLET DATA
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

    setIsLoggedIn(true);
    setUserEmail((user.email || '').toLowerCase());
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

    void fetchStories();

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

  // WATCH AD
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

  // UNLOCK EPISODE
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

    if (unlockedEpisodes[episodeId]) return true;

    try {
      const { data, error } = await supabase.rpc(
        'unlock_episode_with_coins',
        { p_episode_id: episodeId }
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

      const messages: Record<string, [string, string]> = {
        insufficient_coins: [
          'Insufficient Coins',
          'Aapke paas is episode ko unlock karne ke liye enough coins nahi hain.',
        ],
        not_logged_in: [
          'Login Required',
          'Episode unlock karne ke liye login karo.',
        ],
        user_record_not_found: [
          'Account Error',
          'Aapka wallet record nahi mila. Please dobara login karo.',
        ],
        episode_not_found: [
          'Episode Not Found',
          'Ye episode ab available nahi hai.',
        ],
      };

      const message = messages[result.message];

      showMessage(
        message?.[0] || 'Unlock Failed',
        message?.[1] || result.message || 'Episode unlock nahi ho paya.'
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

    if (episodePrice > 0 && !unlockedEpisodes[episode.id]) {
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

  // AUDIO CONTROLS
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

  const handleNextEpisode = () => {
    if (currentIndex >= currentPlaylist.length - 1) return;

    const nextIndex = currentIndex + 1;
    const nextEpisode = currentPlaylist[nextIndex];

    setCurrentIndex(nextIndex);
    playAudio(nextEpisode);
    saveListeningHistory(nextEpisode);
  };

  const handlePreviousEpisode = () => {
    if (currentIndex <= 0) return;

    const previousIndex = currentIndex - 1;
    const previousEpisode = currentPlaylist[previousIndex];

    setCurrentIndex(previousIndex);
    playAudio(previousEpisode);
    saveListeningHistory(previousEpisode);
  };

  const handleAudioEnded = () => {
    if (currentIndex < currentPlaylist.length - 1) {
      handleNextEpisode();
    } else {
      setIsPlaying(false);
    }
  };

  // STORY SELECTION AND FILTERING
  const selectedStory = series.find(
    (story: any) => story.title === selectedStoryTitle
  );

  const filteredStories =
    selectedGenreFilter === 'All'
      ? series
      : series.filter(
          (story: any) =>
            story.genre?.toLowerCase() ===
            selectedGenreFilter.toLowerCase()
        );

  // EXISTING FEATURED BANNER SETTINGS — PRESERVED
  const savedFeaturedTitle =
    typeof window !== 'undefined'
      ? localStorage.getItem('storyvoid_featured_title') || ''
      : '';

  const customBannerImage =
    typeof window !== 'undefined'
      ? localStorage.getItem('storyvoid_custom_banner_image') || ''
      : '';

  const featuredStory = series[0] || null;

  const bannerStory =
    series.find(
      (story: any) => story.title === savedFeaturedTitle
    ) || featuredStory;

  const bannerTitle =
    savedFeaturedTitle ||
    bannerStory?.title ||
    'Discover Amazing Stories';

  const bannerImage =
    customBannerImage ||
    bannerStory?.poster_url ||
    bannerStory?.cover_url ||
    '';

  const bannerDescription =
    bannerStory?.description ||
    'Listen to amazing stories on STORYVOID';

  // LOADING SCREENS
  if (showSplash) {
    return <SplashScreen />;
  }

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

  // HOME SCREEN PROPS
  const homeProps = {
    genres,
    selectedGenreFilter,
    onGenreChange: (genre: string) => {
      setSelectedGenreFilter(genre);
      setSelectedStoryTitle('');
    },
    selectedStory,
    onBackToStories: () => setSelectedStoryTitle(''),
    onEpisodeClick: (episode: any, playlist: any[]) =>
      handleEpisodeAction(episode, playlist),
    unlockedEpisodes,
    bannerImage,
    bannerTitle,
    bannerDescription,
    onPlayFeatured: () => {
      if (bannerStory) {
        setSelectedStoryTitle(bannerStory.title);
      }
    },
    onWatchAd: watchAdForCoins,
    filteredStories,
    loadingStories,
    onRefresh: fetchStories,
    onSelectStory: (title: string) => setSelectedStoryTitle(title),
  };

  return (
    <div className="min-h-screen bg-[#0e0c12] text-white pb-24">

      <AppHeader
        coins={coins}
        onOpenCoinStore={() => setIsCoinStoreOpen(true)}
      />

      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <main className="px-4 pt-4">
        <AppTabContent
          activeTab={activeTab}
          isAdmin={isAdmin}
          homeProps={homeProps}
          stories={stories}
          onEpisodeClick={(episode: any) =>
            handleEpisodeAction(episode)
          }
          userEmail={userEmail}
          coins={coins}
          onLogout={handleLogout}
          onOpenCoinStore={() => setIsCoinStoreOpen(true)}
          fetchStories={fetchStories}
          showSuccessMessage={(message: string) =>
            showMessage('Success', message, true)
          }
        />
      </main>

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

      <BottomNavigation
        activeTab={activeTab}
        isAdmin={isAdmin}
        onTabChange={(tab: string) =>
          setActiveTab(
            tab as 'home' | 'search' | 'library' | 'profile' | 'admin'
          )
        }
      />

      {isCoinStoreOpen && (
        <CoinStoreModal
          onClose={() => setIsCoinStoreOpen(false)}
          coins={coins}
          onBuyCoins={handleBuyCoins}
        />
      )}

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
        

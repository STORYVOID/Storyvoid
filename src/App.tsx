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

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'library' | 'profile' | 'admin'>('home');

  const [coins, setCoins] = useState(30);
  const [isCoinStoreOpen, setIsCoinStoreOpen] = useState(false);
  const [selectedStoryTitle, setSelectedStoryTitle] = useState('');
  const [selectedGenreFilter, setSelectedGenreFilter] = useState('All');

  // SHARED AD STATES FOR HOME & PROFILE SYNC
  const [adsWatched, setAdsWatched] = useState(0);
  const [adMessage, setAdMessage] = useState('');
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const claimLockRef = useRef(false);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    isSuccess: false,
  });

  const [currentPlayingEpisode, setCurrentPlayingEpisode] = useState<any>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [unlockedEpisodes, setUnlockedEpisodes] = useState<Record<string, boolean>>({});

  const audioRef = useRef<HTMLAudioElement>(null);
  const { stories, loadingStories, fetchStories, series } = useStories();

  const genres = ['All', 'Fantasy', 'Romance', 'Crime', 'Thriller', 'Horror', 'Mystery', 'Action', 'Drama', 'Sci-Fi', 'Comedy'];

  const showMessage = (title: string, message: string, isSuccess = false) => {
    setModalConfig({ isOpen: true, title, message, isSuccess });
  };

  const todayKey = new Date().toDateString();
  const userAdKey = `storyvoid_ads_${userEmail || 'guest'}`;
  const userDateKey = `storyvoid_date_${userEmail || 'guest'}`;

  // LOAD DAILY AD COUNT ON AUTH/START
  useEffect(() => {
    try {
      const lastClaimDate = localStorage.getItem(userDateKey);
      const watchedCount = parseInt(localStorage.getItem(userAdKey) || '0', 10);

      if (lastClaimDate !== todayKey) {
        localStorage.setItem(userDateKey, todayKey);
        localStorage.setItem(userAdKey, '0');
        setAdsWatched(0);
        setAdMessage('');
      } else {
        setAdsWatched(watchedCount);
        if (watchedCount >= 5) {
          setAdMessage('✨ Daily limit reached! (5/5 ads watched). Come back tomorrow.');
        } else if (watchedCount > 0) {
          setAdMessage(`📺 You have watched ${watchedCount}/5 ads today.`);
        }
      }
    } catch (err) {
      console.error('Error loading ad state:', err);
    }
  }, [userEmail, todayKey, userAdKey, userDateKey]);

  // FETCH USER WALLET AND UNLOCKED EPISODES
  const fetchUserWallet = async (userId: string) => {
    try {
      const [walletRes, unlockedRes] = await Promise.all([
        supabase.from('app_users').select('coins').eq('id', userId).maybeSingle(),
        supabase.from('unlocked_episodes').select('episode_id').eq('user_id', userId),
      ]);

      if (walletRes.data) setCoins(walletRes.data.coins ?? 30);

      if (unlockedRes.data) {
        const map: Record<string, boolean> = {};
        unlockedRes.data.forEach((item: any) => {
          map[item.episode_id] = true;
        });
        setUnlockedEpisodes(map);
      }
    } catch (err) {
      console.error('Wallet error:', err);
    }
  };

  // APPLY AUTH USER
  const applyAuthUser = async (user: any) => {
    if (!user) {
      setIsLoggedIn(false);
      setUserEmail('');
      setIsAdmin(false);
      setCoins(30);
      setUnlockedEpisodes({});
      return;
    }

    setIsLoggedIn(true);
    setUserEmail((user.email || '').toLowerCase());
    setIsAdmin(user.app_metadata?.role === 'admin');

    await fetchUserWallet(user.id);
  };

  // SUPABASE AD REWARD FUNCTION & SHARED HANDLER
  const handleAdReward = async (amount: number): Promise<boolean> => {
    if (!isLoggedIn) {
      showMessage('Login Required', 'Please login to earn coins.');
      return false;
    }

    if (amount !== 6) {
      showMessage('Error', 'Invalid reward amount.');
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('add_ad_reward');

      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;

      if (!result?.success || result.balance === undefined) {
        throw new Error('Reward could not be confirmed.');
      }

      setCoins(Number(result.balance));
      return true;

    } catch (err: any) {
      console.error('Ad reward error:', err);
      showMessage('Reward Failed', err.message || 'Coins could not be added.');
      return false;
    }
  };

  // UNIFIED WATCH AD TRIGGER (USED BY BOTH HOME AND PROFILE)
  const handleWatchAdClick = async () => {
    if (isClaimingReward || claimLockRef.current) return;

    const currentWatched = parseInt(localStorage.getItem(userAdKey) || '0', 10);
    const lastClaimDate = localStorage.getItem(userDateKey);

    if (lastClaimDate !== todayKey) {
      localStorage.setItem(userDateKey, todayKey);
      localStorage.setItem(userAdKey, '0');
      setAdsWatched(0);
    }

    if (currentWatched >= 5 && lastClaimDate === todayKey) {
      showMessage('Limit Reached', 'Aap aaj ki daily limit (5 ads) poori kar chuke hain!');
      return;
    }

    try {
      setIsClaimingReward(true);
      claimLockRef.current = true;
      setAdMessage('Loading rewarded ad...');

      const { AdMobService } = await import('./services/adMobService');
      await AdMobService.initialize();
      await AdMobService.showRewardedAd(async () => {
        const success = await handleAdReward(6);

        if (!success) {
          setAdMessage('❌ Coins could not be added. Please try again.');
          return;
        }

        let updatedWatched = 0;
        const freshClaimDate = localStorage.getItem(userDateKey);

        if (freshClaimDate === todayKey) {
          updatedWatched = parseInt(localStorage.getItem(userAdKey) || '0', 10);
        }

        updatedWatched += 1;
        localStorage.setItem(userAdKey, String(updatedWatched));
        localStorage.setItem(userDateKey, todayKey);

        setAdsWatched(updatedWatched);

        if (updatedWatched < 5) {
          setAdMessage(`🎉 Reward claimed! (+6 coins added). ${5 - updatedWatched} left today.`);
          showMessage('Reward Claimed!', `+6 coins added! (${updatedWatched}/5 ads watched today)`, true);
        } else {
          setAdMessage('🔥 Daily quota completed! You earned 30 coins today.');
          showMessage('Limit Reached', 'Daily quota completed! You earned 30 coins today.', true);
        }
      });
    } catch (error: any) {
      console.error('Reward claim failed:', error);
      setAdMessage('⚠️ Failed to claim reward.');
      showMessage('Error', 'Failed to load ad. Please try again.');
    } finally {
      setIsClaimingReward(false);
      claimLockRef.current = false;
    }
  };

  // AUTH INITIALIZATION
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);

    fetchStories();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setTimeout(() => applyAuthUser(session?.user || null), 0);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      applyAuthUser(session?.user || null);
      setAuthReady(true);
    });

    return () => {
      clearTimeout(timer);
      authListener.subscription.unsubscribe();
    };
  }, []);

  // LOGIN
  const handleLogin = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      await applyAuthUser(session.user);
      showMessage('Welcome', 'Logged in successfully!', true);
    }
  };

  // LOGOUT
  const handleLogout = async () => {
    await supabase.auth.signOut();
    await applyAuthUser(null);
    setActiveTab('home');
  };

  // EPISODE UNLOCK SYSTEM
  const handleUnlockEpisode = async (episodeId: string, price: number): Promise<boolean> => {
    if (!isLoggedIn) {
      showMessage('Login Required', 'Please login to unlock episodes.');
      return false;
    }

    if (unlockedEpisodes[episodeId]) return true;

    try {
      const { data, error } = await supabase.rpc('unlock_episode_with_coins', {
        p_episode_id: episodeId
      });

      if (error) throw error;

      const res = Array.isArray(data) ? data[0] : data;

      if (res?.balance !== undefined) {
        setCoins(Number(res.balance));
      }

      if (res?.message === 'unlocked' || res?.message === 'already_unlocked') {
        setUnlockedEpisodes(prev => ({
          ...prev,
          [episodeId]: true
        }));

        if (res.message === 'unlocked') {
          showMessage('Unlocked!', `Episode unlocked for ${price} coins.`, true);
        }

        return true;
      }

      showMessage('Failed', res?.message || 'Could not unlock episode.');
      return false;

    } catch (err: any) {
      showMessage('Error', err.message || 'Something went wrong.');
      return false;
    }
  };

  // AUDIO PLAYBACK
  const playAudio = (episode: any) => {
    if (!episode?.audio_url) return;

    setCurrentPlayingEpisode(episode);
    setIsPlaying(true);

    if (audioRef.current) {
      audioRef.current.src = episode.audio_url;
      audioRef.current.play().catch(() => setIsPlaying(false));
    }

    try {
      const historyKey = `storyvoid_history_${(userEmail || 'guest').toLowerCase()}`;
      const saved = localStorage.getItem(historyKey);

      let history = saved ? JSON.parse(saved) : [];

      history = history.filter((item: any) => item.id !== episode.id);
      history.unshift(episode);

      if (history.length > 25) history.pop();

      localStorage.setItem(historyKey, JSON.stringify(history));

    } catch (err) {
      console.error('History save error:', err);
    }
  };

  // EPISODE ACTION
  const handleEpisodeAction = async (episode: any, playlist: any[] = []) => {
    const price = Number(episode.coin_price || 0);

    if (price > 0 && !unlockedEpisodes[episode.id]) {
      const unlocked = await handleUnlockEpisode(episode.id, price);
      if (!unlocked) return;
    }

    if (currentPlayingEpisode?.id === episode.id && audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    const list = playlist.length > 0 ? playlist : [episode];

    setCurrentPlaylist(list);

    const foundIndex = list.findIndex(i => i.id === episode.id);

    setCurrentIndex(foundIndex >= 0 ? foundIndex : 0);

    playAudio(episode);
  };

  // PLAY PAUSE
  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // NEXT EPISODE
  const playNext = () => {
    if (currentIndex < currentPlaylist.length - 1) {
      const nextEp = currentPlaylist[currentIndex + 1];

      setCurrentIndex(currentIndex + 1);

      handleEpisodeAction(nextEp, currentPlaylist);
    }
  };

  // PREVIOUS EPISODE
  const playPrev = () => {
    if (currentIndex > 0) {
      const prevEp = currentPlaylist[currentIndex - 1];

      setCurrentIndex(currentIndex - 1);

      handleEpisodeAction(prevEp, currentPlaylist);
    }
  };

  if (showSplash) return <SplashScreen />;

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

  const currentSelectedStory = series.find(
    (s: any) => s.title === selectedStoryTitle
  );

  // HOME TAB PROPS
  const homeProps = {
    genres,
    selectedGenreFilter,

    onGenreChange: (g: string) => {
      setSelectedGenreFilter(g);
      setSelectedStoryTitle('');
    },

    selectedStory: currentSelectedStory,

    onBackToStories: () => setSelectedStoryTitle(''),

    onEpisodeClick: (ep: any, list: any[]) => handleEpisodeAction(ep, list),

    unlockedEpisodes,

    bannerImage: localStorage.getItem('storyvoid_custom_banner_image') || series[0]?.poster_url || '',

    bannerTitle: localStorage.getItem('storyvoid_featured_title') || series[0]?.title || 'Discover Amazing Stories',

    bannerDescription: series[0]?.description || 'Listen to amazing stories on STORYVOID',

    onPlayFeatured: () => {
      if (series[0]) setSelectedStoryTitle(series[0].title);
    },

    onWatchAd: handleWatchAdClick,
    onAddCoins: handleAdReward,

    filteredStories: selectedGenreFilter === 'All'
      ? series
      : series.filter(
          (s: any) => s.genre?.toLowerCase() === selectedGenreFilter.toLowerCase()
        ),

    loadingStories,
    onRefresh: fetchStories,
    onSelectStory: (title: string) => setSelectedStoryTitle(title),
    currentPlayingEpisode,
    isPlaying,
    userEmail,
  };

  return (
    <div className="min-h-screen bg-[#0e0c12] text-white pb-24">

      <AppHeader
        coins={coins}
        onOpenCoinStore={() => setIsCoinStoreOpen(true)}
        onOpenProfile={() => setActiveTab('profile')}
      />

      <audio
        ref={audioRef}
        onEnded={() => {
          if (currentIndex < currentPlaylist.length - 1) {
            playNext();
          } else {
            setIsPlaying(false);
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <main className="px-3 pt-3">
        <AppTabContent
          activeTab={activeTab}
          isAdmin={isAdmin}
          homeProps={homeProps}
          stories={stories}
          series={series}
          onEpisodeClick={(ep: any) => handleEpisodeAction(ep, [ep])}
          userEmail={userEmail}
          coins={coins}
          onLogout={handleLogout}
          onOpenCoinStore={() => setIsCoinStoreOpen(true)}
          fetchStories={fetchStories}
          showSuccessMessage={(msg: string) => showMessage('Success', msg, true)}
          onWatchAd={handleWatchAdClick}
          adsWatched={adsWatched}
          adMessage={adMessage}
          isClaimingReward={isClaimingReward}
        />
      </main>

      {currentPlayingEpisode && (
        <AudioPlayer
          currentPlayingEpisode={currentPlayingEpisode}
          isPlaying={isPlaying}
          togglePlayPause={togglePlayPause}
          playNext={playNext}
          playPrev={playPrev}
          audioRef={audioRef}
        />
      )}

      <BottomNavigation
        activeTab={activeTab}
        isAdmin={isAdmin}
        onTabChange={(tab: any) => setActiveTab(tab)}
      />

      {isCoinStoreOpen && (
        <CoinStoreModal
          onClose={() => setIsCoinStoreOpen(false)}
          coins={coins}
          onBuyCoins={() => {}}
        />
      )}

      {modalConfig.isOpen && (
        <NotificationModal
          {...modalConfig}
          onClose={() => setModalConfig(prev => ({
            ...prev,
            isOpen: false
          }))}
        />
      )}

    </div>
  );
}

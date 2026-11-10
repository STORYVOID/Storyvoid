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

  const fetchUserWallet = async (userId: string) => {
    try {
      const [walletRes, unlockedRes] = await Promise.all([
        supabase.from('app_users').select('coins').eq('id', userId).maybeSingle(),
        supabase.from('unlocked_episodes').select('episode_id').eq('user_id', userId),
      ]);

      if (walletRes.data) setCoins(walletRes.data.coins ?? 30);
      if (unlockedRes.data) {
        const map: Record<string, boolean> = {};
        unlockedRes.data.forEach((item: any) => { map[item.episode_id] = true; });
        setUnlockedEpisodes(map);
      }
    } catch (err) {
      console.error('Wallet error:', err);
    }
  };

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

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    fetchStories();

    supabase.auth.onAuthStateChange((_, session) => {
      setTimeout(() => applyAuthUser(session?.user || null), 0);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      applyAuthUser(session?.user || null);
      setAuthReady(true);
    });

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await applyAuthUser(session.user);
      showMessage('Welcome', 'Logged in successfully!', true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await applyAuthUser(null);
    setActiveTab('home');
  };

  const handleUnlockEpisode = async (episodeId: string, price: number): Promise<boolean> => {
    if (!isLoggedIn) {
      showMessage('Login Required', 'Please login to unlock episodes.');
      return false;
    }
    if (unlockedEpisodes[episodeId]) return true;

    try {
      const { data, error } = await supabase.rpc('unlock_episode_with_coins', { p_episode_id: episodeId });
      if (error) throw error;
      const res = Array.isArray(data) ? data[0] : data;

      if (res?.balance !== undefined) setCoins(Number(res.balance));
      if (res?.message === 'unlocked' || res?.message === 'already_unlocked') {
        setUnlockedEpisodes(prev => ({ ...prev, [episodeId]: true }));
        if (res.message === 'unlocked') showMessage('Unlocked!', `Episode unlocked for ${price} coins.`, true);
        return true;
      }
      showMessage('Failed', res?.message || 'Could not unlock episode.');
      return false;
    } catch (err: any) {
      showMessage('Error', err.message || 'Something went wrong.');
      return false;
    }
  };

  const playAudio = (episode: any) => {
    if (!episode?.audio_url) return;
    setCurrentPlayingEpisode(episode);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = episode.audio_url;
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  };

  const handleEpisodeAction = async (episode: any, playlist: any[] = []) => {
    const price = Number(episode.coin_price || 0);
    if (price > 0 && !unlockedEpisodes[episode.id]) {
      const unlocked = await handleUnlockEpisode(episode.id, price);
      if (!unlocked) return;
    }
    const list = playlist.length > 0 ? playlist : [episode];
    setCurrentPlaylist(list);
    setCurrentIndex(list.findIndex(i => i.id === episode.id) >= 0 ? list.findIndex(i => i.id === episode.id) : 0);
    playAudio(episode);
  };

  if (showSplash) return <SplashScreen />;
  if (!authReady) return <div className="min-h-screen bg-[#0e0c12] flex items-center justify-center text-white">Loading STORYVOID...</div>;
  if (!isLoggedIn) return <AuthScreen onLogin={handleLogin} />;

  const homeProps = {
    genres,
    selectedGenreFilter,
    onGenreChange: (g: string) => { setSelectedGenreFilter(g); setSelectedStoryTitle(''); },
    selectedStory: series.find((s: any) => s.title === selectedStoryTitle),
    onBackToStories: () => setSelectedStoryTitle(''),
    onEpisodeClick: (ep: any, list: any[]) => handleEpisodeAction(ep, list),
    unlockedEpisodes,
    bannerImage: localStorage.getItem('storyvoid_custom_banner_image') || series[0]?.poster_url || '',
    bannerTitle: localStorage.getItem('storyvoid_featured_title') || series[0]?.title || 'Discover Amazing Stories',
    bannerDescription: series[0]?.description || 'Listen to amazing stories on STORYVOID',
    onPlayFeatured: () => { if (series[0]) setSelectedStoryTitle(series[0].title); },
    onWatchAd: () => showMessage('Coming Soon', 'Ads not connected yet.'),
    filteredStories: selectedGenreFilter === 'All' ? series : series.filter((s: any) => s.genre?.toLowerCase() === selectedGenreFilter.toLowerCase()),
    loadingStories,
    onRefresh: fetchStories,
    onSelectStory: (title: string) => setSelectedStoryTitle(title),
  };

  return (
    <div className="min-h-screen bg-[#0e0c12] text-white pb-24">
      <AppHeader coins={coins} onOpenCoinStore={() => setIsCoinStoreOpen(true)} />
      
      <audio 
        ref={audioRef} 
        onEnded={() => { if (currentIndex < currentPlaylist.length - 1) handleEpisodeAction(currentPlaylist[currentIndex + 1], currentPlaylist); else setIsPlaying(false); }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <main className="px-4 pt-4">
        <AppTabContent
          activeTab={activeTab}
          isAdmin={isAdmin}
          homeProps={homeProps}
          stories={stories}
          onEpisodeClick={(ep: any) => handleEpisodeAction(ep)}
          userEmail={userEmail}
          coins={coins}
          onLogout={handleLogout}
          onOpenCoinStore={() => setIsCoinStoreOpen(true)}
          fetchStories={fetchStories}
          showSuccessMessage={(msg: string) => showMessage('Success', msg, true)}
        />
      </main>

      {currentPlayingEpisode && (
        <div className="fixed bottom-[68px] left-0 right-0 z-40">
          <AudioPlayer
            episode={currentPlayingEpisode}
            isPlaying={isPlaying}
            onPlayPause={() => {
              if (!audioRef.current) return;
              if (audioRef.current.paused) audioRef.current.play();
              else audioRef.current.pause();
            }}
            onNext={() => { if (currentIndex < currentPlaylist.length - 1) handleEpisodeAction(currentPlaylist[currentIndex + 1], currentPlaylist); }}
            onPrevious={() => { if (currentIndex > 0) handleEpisodeAction(currentPlaylist[currentIndex - 1], currentPlaylist); }}
          />
        </div>
      )}

      <BottomNavigation activeTab={activeTab} isAdmin={isAdmin} onTabChange={(tab: any) => setActiveTab(tab)} />

      {isCoinStoreOpen && <CoinStoreModal onClose={() => setIsCoinStoreOpen(false)} coins={coins} onBuyCoins={() => {}} />}
      {modalConfig.isOpen && <NotificationModal {...modalConfig} onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} />}
    </div>
  );
        }
          

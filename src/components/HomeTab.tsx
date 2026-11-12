import { useState, useEffect, useRef } from 'react';
import { EpisodeList } from './EpisodeList';
import { AdMobService } from '../services/adMobService';

interface HomeTabProps {
  genres: string[];
  selectedGenreFilter: string;
  onGenreChange: (genre: string) => void;
  selectedStory: any;
  onBackToStories: () => void;
  onEpisodeClick: (episode: any, playlist: any[]) => void;
  unlockedEpisodes: Record<string, boolean>;
  bannerImage: string;
  bannerTitle: string;
  bannerDescription: string;
  onPlayFeatured: () => void;
  filteredStories: any[];
  loadingStories: boolean;
  onRefresh: () => void;
  onSelectStory: (title: string) => void;
  currentPlayingEpisode?: any;
  isPlaying?: boolean;
  userEmail?: string;
  onAddCoins?: (amount: number) => Promise<boolean>;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  genres,
  selectedGenreFilter,
  onGenreChange,
  selectedStory,
  onBackToStories,
  onEpisodeClick,
  unlockedEpisodes,
  bannerImage,
  bannerTitle,
  bannerDescription,
  onPlayFeatured,
  filteredStories,
  loadingStories,
  onRefresh,
  onSelectStory,
  currentPlayingEpisode,
  isPlaying,
  userEmail = 'guest',
  onAddCoins,
}) => {
  const [promoTitle, setPromoTitle] = useState('');
  const [promoMediaUrl, setPromoMediaUrl] = useState('');
  const [promoLink, setPromoLink] = useState('');
  const [isPromoEnabled, setIsPromoEnabled] = useState(true);
  const [isFeaturedEnabled, setIsFeaturedEnabled] = useState(true);

  // AD STATES
  const [adsWatched, setAdsWatched] = useState(0);
  const [adMessage, setAdMessage] = useState('');
  const [isClaimingReward, setIsClaimingReward] = useState(false);

  // Prevent duplicate reward calls
  const claimLockRef = useRef(false);

  const todayKey = new Date().toDateString();

  const userAdKey = `storyvoid_ads_${userEmail || 'guest'}`;
  const userDateKey = `storyvoid_date_${userEmail || 'guest'}`;

  // LOAD PROMO AND DAILY AD DATA
  useEffect(() => {
    try {
      setPromoTitle(localStorage.getItem('storyvoid_promo_title') || '');
      setPromoMediaUrl(localStorage.getItem('storyvoid_promo_media') || '');
      setPromoLink(localStorage.getItem('storyvoid_promo_link') || '');

      setIsPromoEnabled(
        localStorage.getItem('storyvoid_promo_enabled') !== 'false'
      );

      setIsFeaturedEnabled(
        localStorage.getItem('storyvoid_featured_enabled') !== 'false'
      );

      const lastClaimDate = localStorage.getItem(userDateKey);

      const watchedCount = parseInt(
        localStorage.getItem(userAdKey) || '0',
        10
      );

      if (lastClaimDate !== todayKey) {
        localStorage.setItem(userDateKey, todayKey);
        localStorage.setItem(userAdKey, '0');

        setAdsWatched(0);
        setAdMessage('');
      } else {
        setAdsWatched(watchedCount);

        if (watchedCount >= 5) {
          setAdMessage(
            '✨ Daily limit reached! (5/5 ads watched). Come back tomorrow.'
          );
        } else if (watchedCount > 0) {
          setAdMessage(
            `📺 You have watched ${watchedCount}/5 ads today.`
          );
        }
      }
    } catch (err) {
      console.error('Error loading config:', err);
    }
  }, [todayKey, userEmail, userAdKey, userDateKey]);

  // WATCH REAL ADMOB REWARDED AD BUTTON
  const handleWatchAdClick = async () => {
    if (isClaimingReward || claimLockRef.current) return;

    const currentWatched = parseInt(
      localStorage.getItem(userAdKey) || '0',
      10
    );

    const lastClaimDate = localStorage.getItem(userDateKey);

    if (lastClaimDate !== todayKey) {
      localStorage.setItem(userDateKey, todayKey);
      localStorage.setItem(userAdKey, '0');
      setAdsWatched(0);
    }

    if (currentWatched >= 5 && lastClaimDate === todayKey) {
      alert('Aap aaj ki daily limit (5 ads) poori kar chuke hain!');
      return;
    }

    try {
      setIsClaimingReward(true);
      claimLockRef.current = true;
      setAdMessage('Loading rewarded ad...');

      // CALL REAL GOOGLE ADMOB REWARDED AD
      await AdMobService.showRewardedAd(async () => {
        // --- SUCCESS: User watched ad till end ---
        if (!onAddCoins) {
          throw new Error('Reward system is not connected.');
        }

        // Actual Supabase wallet reward (+6 coins)
        const success = await onAddCoins(6);

        if (!success) {
          setAdMessage('❌ Coins could not be added. Please try again.');
          return;
        }

        // Count ad only after successful wallet update
        let updatedWatched = 0;
        const freshClaimDate = localStorage.getItem(userDateKey);

        if (freshClaimDate === todayKey) {
          updatedWatched = parseInt(
            localStorage.getItem(userAdKey) || '0',
            10
          );
        }

        updatedWatched += 1;

        localStorage.setItem(userAdKey, String(updatedWatched));
        localStorage.setItem(userDateKey, todayKey);

        setAdsWatched(updatedWatched);

        if (updatedWatched < 5) {
          setAdMessage(
            `🎉 Ad watched successfully! (+6 coins added). ${5 - updatedWatched} ads left today.`
          );
        } else {
          setAdMessage(
            '🔥 Daily quota completed! You earned 30 coins today.'
          );
        }
      });
    } catch (error: any) {
      console.error('Ad playback or reward claim failed:', error);
      setAdMessage('⚠️ Ad failed to load or was skipped. No coins awarded.');
    } finally {
      setIsClaimingReward(false);
      claimLockRef.current = false;
    }
  };

  const isVideoFile = (url: string) => {
    if (!url) return false;

    const lower = url.toLowerCase();

    return (
      lower.endsWith('.mp4') ||
      lower.endsWith('.webm') ||
      lower.endsWith('.ogg') ||
      lower.includes('video')
    );
  };

  return (
    <div className="space-y-4 pb-20 relative">

      {/* GENRES */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => onGenreChange(genre)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold border cursor-pointer transition-all ${
              selectedGenreFilter === genre
                ? 'bg-[#ff741c] text-white border-[#ff741c]'
                : 'bg-[#17141d] text-gray-400 border-[#302b39]'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* SELECTED STORY VIEW */}
      {selectedStory ? (
        <EpisodeList
          episodes={selectedStory.episodes}
          onEpisodeClick={(ep: any, playlist: any[]) =>
            onEpisodeClick(ep, playlist)
          }
          unlockedEpisodes={unlockedEpisodes}
          selectedStory={selectedStory}
          onBackToStories={onBackToStories}
          currentPlayingEpisode={currentPlayingEpisode}
          isPlaying={isPlaying}
          userEmail={userEmail}
        />
      ) : (
        <>
          {/* PROMOTIONAL BANNER */}
          {isPromoEnabled && promoMediaUrl && (
            <div
              className="relative w-full overflow-hidden rounded-2xl border border-orange-500/40 shadow-lg"
              style={{ aspectRatio: '2.05 / 1' }}
            >
              {isVideoFile(promoMediaUrl) ? (
                <video
                  src={promoMediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <img
                  src={promoMediaUrl}
                  alt={promoTitle || 'Promo'}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-end">
                <div>
                  <span className="inline-block rounded-md bg-purple-600 px-2 py-0.5 text-[9px] font-black tracking-wide text-white">
                    📢 SPECIAL PROMO
                  </span>

                  <h3 className="text-xs font-black mt-1 text-white">
                    {promoTitle || 'Special Announcement'}
                  </h3>
                </div>

                {promoLink && (
                  <a
                    href={promoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-[#ff741c] px-3 py-1 text-[11px] font-bold text-white shadow hover:bg-orange-600 transition-all cursor-pointer"
                  >
                    Check Out →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* FEATURED BANNER */}
          {isFeaturedEnabled && (
            <div
              className="relative w-full overflow-hidden rounded-2xl border border-[#69422e]"
              style={{ aspectRatio: '2.05 / 1' }}
            >
              {bannerImage && (
                isVideoFile(bannerImage) ? (
                  <video
                    src={bannerImage}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={bannerImage}
                    alt={bannerTitle}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-3">
                <span className="inline-block rounded-md bg-[#ff741c] px-2 py-0.5 text-[9px] font-black tracking-wide">
                  🔥 TRENDING & FEATURED
                </span>

                <h2 className="text-sm font-black mt-1.5 text-white">
                  {bannerTitle}
                </h2>

                <p className="text-[11px] text-gray-200 mt-1 line-clamp-1">
                  {bannerDescription}
                </p>

                <button
                  onClick={onPlayFeatured}
                  className="mt-2 rounded-xl bg-[#ff741c] px-3.5 py-1.5 text-xs font-bold cursor-pointer"
                >
                  ✨ Play Now
                </button>
              </div>
            </div>
          )}

          {/* EARN FREE COINS CARD */}
          <div className="rounded-2xl border border-[#302b39] bg-[#17141d] p-3 space-y-2 shadow-md">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-[#ffd329] text-xs flex items-center gap-1">
                  🟡 EARN FREE COINS ({adsWatched}/5 Ads Watched)
                </h3>

                <p className="text-[10px] text-gray-300 mt-0.5">
                  Watch rewarded ad to get instant +6 coins! (Max 30/day)
                </p>
              </div>

              <button
                onClick={handleWatchAdClick}
                disabled={adsWatched >= 5 || isClaimingReward}
                className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-black transition-all ${
                  adsWatched >= 5 || isClaimingReward
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-[#f4bd00] text-black cursor-pointer hover:bg-yellow-400'
                }`}
              >
                {isClaimingReward
                  ? 'Loading Ad...'
                  : adsWatched >= 5
                    ? 'Limit Reached'
                    : 'Watch Ad'}
              </button>
            </div>

            {adMessage && (
              <p className="text-[10px] text-orange-400 font-semibold bg-[#121017] p-1.5 rounded-lg text-center">
                {adMessage}
              </p>
            )}
          </div>

          {/* STORY COLLECTION */}
          <div className="flex items-center justify-between mt-2">
            <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wide">
              ALL AUDIO SERIES
            </h2>

            <button
              onClick={onRefresh}
              className="text-[#ff984e] text-[10px] font-bold underline cursor-pointer"
            >
              Refresh
            </button>
          </div>

          {loadingStories ? (
            <p className="text-gray-400 text-xs py-4 text-center">
              Loading stories...
            </p>
          ) : filteredStories.length === 0 ? (
            <p className="text-gray-400 text-xs py-4 text-center">
              No stories available.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredStories.map((story: any) => (
                <button
                  key={story.title}
                  onClick={() => onSelectStory(story.title)}
                  className="min-w-0 rounded-xl border border-[#302b39] bg-[#17141d] p-2.5 text-left overflow-hidden cursor-pointer hover:border-orange-500 transition-all shadow-md"
                >
                  {story.cover_url ? (
                    <img
                      src={story.cover_url}
                      alt={story.title}
                      className="w-full h-32 rounded-lg object-cover border border-[#393343]"
                    />
                  ) : (
                    <div className="w-full h-32 rounded-lg bg-[#25202c] flex items-center justify-center">
                      <span className="text-2xl">🎧</span>
                    </div>
                  )}

                  <span className="inline-block mt-2 rounded-md bg-[#542b20] text-[#ffbb83] px-2 py-0.5 text-[9px] font-bold">
                    {story.genre || 'Drama'}
                  </span>

                  <h3 className="font-bold text-xs mt-1 truncate text-white">
                    {story.title}
                  </h3>

                  <p className="text-[10px] text-gray-400 mt-0.5">
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
  );
};
        

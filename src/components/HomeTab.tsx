import { useState, useEffect, useRef } from 'react';
import { EpisodeList } from './EpisodeList';

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
}) => {
  const [promoTitle, setPromoTitle] = useState('');
  const [promoMediaUrl, setPromoMediaUrl] = useState('');
  const [promoLink, setPromoLink] = useState('');
  const [isPromoEnabled, setIsPromoEnabled] = useState(true);
  const [isFeaturedEnabled, setIsFeaturedEnabled] = useState(true);

  // LOAD PROMO CONFIG
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
    } catch (err) {
      console.error('Error loading config:', err);
    }
  }, []);

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
    <div className="space-y-5 pb-28 relative px-1">

      {/* GENRES - Medium sized & clean spacing */}
      <div className="flex gap-2.5 overflow-x-auto py-1 scrollbar-none">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => onGenreChange(genre)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold border cursor-pointer transition-all ${
              selectedGenreFilter === genre
                ? 'bg-[#ff741c] text-white border-[#ff741c] shadow-md shadow-orange-900/30'
                : 'bg-[#17141d] text-gray-300 border-[#302b39] hover:border-gray-500'
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
              className="relative w-full overflow-hidden rounded-2xl border border-orange-500/40 shadow-xl"
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

              <div className="absolute bottom-0 left-0 right-0 p-3.5 flex justify-between items-end">
                <div>
                  <span className="inline-block rounded-md bg-purple-600 px-2.5 py-0.5 text-[10px] font-black tracking-wide text-white shadow">
                    📢 SPECIAL PROMO
                  </span>

                  <h3 className="text-sm font-black mt-1 text-white">
                    {promoTitle || 'Special Announcement'}
                  </h3>
                </div>

                {promoLink && (
                  <a
                    href={promoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-[#ff741c] px-3.5 py-1.5 text-xs font-bold text-white shadow-lg hover:bg-orange-600 transition-all cursor-pointer"
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
              className="relative w-full overflow-hidden rounded-2xl border border-[#69422e] shadow-xl"
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

              <div className="absolute bottom-0 left-0 right-0 p-3.5">
                <span className="inline-block rounded-md bg-[#ff741c] px-2.5 py-0.5 text-[10px] font-black tracking-wide shadow">
                  🔥 TRENDING & FEATURED
                </span>

                <h2 className="text-base font-black mt-1.5 text-white">
                  {bannerTitle}
                </h2>

                <p className="text-xs text-gray-200 mt-1 line-clamp-1">
                  {bannerDescription}
                </p>

                <button
                  onClick={onPlayFeatured}
                  className="mt-2.5 rounded-xl bg-[#ff741c] px-4 py-2 text-xs font-bold cursor-pointer shadow-md hover:bg-orange-600 transition-all"
                >
                  ✨ Play Now
                </button>
              </div>
            </div>
          )}

          {/* STORY COLLECTION */}
          <div className="flex items-center justify-between mt-4 mb-1">
            <h2 className="text-sm font-extrabold text-gray-200 uppercase tracking-wide">
              ALL AUDIO SERIES
            </h2>

            <button
              onClick={onRefresh}
              className="text-[#ff984e] text-xs font-bold underline cursor-pointer hover:text-orange-400"
            >
              Refresh
            </button>
          </div>

          {loadingStories ? (
            <p className="text-gray-400 text-sm py-6 text-center">
              Loading stories...
            </p>
          ) : filteredStories.length === 0 ? (
            <p className="text-gray-400 text-sm py-6 text-center">
              No stories available.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3.5">
              {filteredStories.map((story: any) => (
                <button
                  key={story.title}
                  onClick={() => onSelectStory(story.title)}
                  className="min-w-0 rounded-2xl border border-[#302b39] bg-[#17141d] p-3 text-left overflow-hidden cursor-pointer hover:border-orange-500 transition-all shadow-lg"
                >
                  {story.cover_url ? (
                    <img
                      src={story.cover_url}
                      alt={story.title}
                      className="w-full h-36 rounded-xl object-cover border border-[#393343]"
                    />
                  ) : (
                    <div className="w-full h-36 rounded-xl bg-[#25202c] flex items-center justify-center">
                      <span className="text-3xl">🎧</span>
                    </div>
                  )}

                  <span className="inline-block mt-2.5 rounded-md bg-[#542b20] text-[#ffbb83] px-2.5 py-0.5 text-[10px] font-bold">
                    {story.genre || 'Drama'}
                  </span>

                  <h3 className="font-bold text-sm mt-1.5 truncate text-white">
                    {story.title}
                  </h3>

                  <p className="text-xs text-gray-400 mt-0.5">
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
            

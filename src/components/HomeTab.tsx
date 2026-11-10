import React from 'react';
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
  onWatchAd: () => void;
  filteredStories: any[];
  loadingStories: boolean;
  onRefresh: () => void;
  onSelectStory: (title: string) => void;
  currentPlayingEpisode?: any;
  isPlaying?: boolean;
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
  onWatchAd,
  filteredStories,
  loadingStories,
  onRefresh,
  onSelectStory,
  currentPlayingEpisode,
  isPlaying,
}) => {
  return (
    <div className="space-y-4">

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

      {/* SELECTED STORY VIEW (EPISODES & POSTER) */}
      {selectedStory ? (
        <EpisodeList
          episodes={selectedStory.episodes}
          onEpisodeClick={(ep: any, playlist: any[]) => onEpisodeClick(ep, playlist)}
          unlockedEpisodes={unlockedEpisodes}
          selectedStory={selectedStory}
          onBackToStories={onBackToStories}
          currentPlayingEpisode={currentPlayingEpisode}
          isPlaying={isPlaying}
        />
      ) : (
        <>
          {/* FEATURED BANNER */}
          <div
            className="relative w-full overflow-hidden rounded-2xl border border-[#69422e]"
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

          {/* FREE COINS */}
          <div className="rounded-2xl border border-[#302b39] bg-[#17141d] p-3 flex items-center justify-between gap-2 shadow-md">
            <div>
              <h3 className="font-bold text-[#ffd329] text-xs flex items-center gap-1">
                🟡 EARN FREE COINS
              </h3>
              <p className="text-[10px] text-gray-300 mt-0.5">
                Watch a short ad to get +20 coins.
              </p>
            </div>

            <button
              onClick={onWatchAd}
              className="shrink-0 rounded-xl bg-[#f4bd00] px-3.5 py-1.5 text-xs font-black text-black cursor-pointer hover:bg-yellow-400 transition-all"
            >
              Watch Ad
            </button>
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
              

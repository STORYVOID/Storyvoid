
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
}) => {
  return (
    <div className="space-y-6">

      {/* GENRES */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => onGenreChange(genre)}
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

      {/* FEATURED BANNER */}
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
              {bannerDescription}
            </p>

            <button
              onClick={onPlayFeatured}
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
            onClick={onWatchAd}
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
            onClick={onBackToStories}
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
              onEpisodeClick(episode, selectedStory.episodes)
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
              onClick={onRefresh}
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
                  onClick={() => onSelectStory(story.title)}
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
  );
};

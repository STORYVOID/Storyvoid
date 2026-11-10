import React, { useState, useEffect } from 'react';

interface EpisodeListProps {
  episodes: any[];
  onEpisodeClick: (episode: any, playlist: any[]) => void;
  unlockedEpisodes: Record<string, boolean>;
  selectedStory?: any;
  onBackToStories?: () => void;
  currentPlayingEpisode?: any;
  isPlaying?: boolean;
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
  episodes,
  onEpisodeClick,
  unlockedEpisodes,
  selectedStory,
  onBackToStories,
  currentPlayingEpisode,
  isPlaying,
}) => {
  const [isFollowed, setIsFollowed] = useState<boolean>(false);
  const storyTitle = selectedStory?.title || 'Story';

  useEffect(() => {
    try {
      const savedFollows = localStorage.getItem('storyvoid_followed_series');
      const followedTitles: string[] = savedFollows ? JSON.parse(savedFollows) : [];
      setIsFollowed(followedTitles.includes(storyTitle));
    } catch (err) {
      console.error('Error checking follow status:', err);
    }
  }, [storyTitle]);

  const toggleFollow = () => {
    try {
      const savedFollows = localStorage.getItem('storyvoid_followed_series');
      let followedTitles: string[] = savedFollows ? JSON.parse(savedFollows) : [];

      if (isFollowed) {
        followedTitles = followedTitles.filter(t => t !== storyTitle);
        setIsFollowed(false);
      } else {
        followedTitles.push(storyTitle);
        setIsFollowed(true);
      }
      localStorage.setItem('storyvoid_followed_series', JSON.stringify(followedTitles));
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  return (
    <div className="space-y-3 w-full pb-24">
      <div className="flex justify-between items-center mb-1">
        {onBackToStories && (
          <button 
            onClick={onBackToStories}
            className="text-[11px] text-[#ff8a43] font-bold px-3 py-1.5 rounded-xl bg-[#16131c] border border-gray-800 cursor-pointer"
          >
            ← Back
          </button>
        )}

        <button 
          onClick={toggleFollow}
          className={`text-[11px] font-bold px-3.5 py-1.5 rounded-xl border cursor-pointer transition-all ${
            isFollowed 
              ? 'bg-[#ff741c] text-white border-[#ff741c]' 
              : 'bg-[#16131c] text-[#ff8a43] border-gray-800'
          }`}
        >
          {isFollowed ? '❤️ Following' : '🤍 Follow Series'}
        </button>
      </div>

      {selectedStory && (
        <div className="bg-[#16131c] p-3 rounded-2xl border border-gray-800 flex gap-3 items-center shadow-lg">
          <img 
            src={selectedStory.poster_url || selectedStory.cover_url || ''} 
            alt="Poster" 
            className="w-20 h-24 object-cover rounded-xl border border-gray-700 shrink-0"
          />
          <div className="flex-1 space-y-1 overflow-hidden">
            <span className="text-[9px] bg-orange-950 text-orange-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block">
              {selectedStory.genre || 'Drama'}
            </span>
            <h2 className="text-xs font-black text-white truncate">{selectedStory.title}</h2>
            <p className="text-[10px] text-gray-300 line-clamp-2">{selectedStory.description || 'An immersive audio series.'}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-4 mb-2">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide">Episodes Playlist</h3>
        <span className="text-[10px] text-gray-500">{episodes.length} Episodes</span>
      </div>

      <div className="space-y-2 w-full">
        {episodes.map((ep, idx) => {
          const price = Number(ep.coin_price || 0);
          const isUnlocked = price === 0 || unlockedEpisodes[ep.id];
          const isCurrentPlaying = currentPlayingEpisode?.id === ep.id;

          return (
            <div 
              key={ep.id || idx} 
              className={`p-3 rounded-xl border transition-all flex justify-between items-center w-full shadow-md ${
                isCurrentPlaying ? 'border-[#ff741c] bg-[#1a151f]' : 'border-gray-800 bg-[#16131c]'
              }`}
            >
              <div className="space-y-0.5 pr-2 flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded font-bold shrink-0">
                    EP {idx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate">
                    {ep.episode_title || `Episode ${idx + 1}`}
                  </h4>
                </div>
                <p className="text-[10px] font-medium">
                  {price > 0 && !isUnlocked ? (
                    <span className="text-yellow-400">🔒 {price} Coins</span>
                  ) : isCurrentPlaying ? (
                    <span className="text-[#ff741c] font-bold">
                      {isPlaying ? '▶ Playing...' : '⏸ Paused'}
                    </span>
                  ) : (
                    <span className="text-emerald-400">✨ Ready</span>
                  )}
                </p>
              </div>

              <button 
                onClick={() => onEpisodeClick(ep, episodes)}
                className="text-[11px] font-bold px-3.5 py-1.5 rounded-xl bg-[#ff741c] hover:bg-orange-600 text-white transition-all cursor-pointer shrink-0 flex items-center gap-1"
              >
                {price > 0 && !isUnlocked ? (
                  'Unlock'
                ) : isCurrentPlaying && isPlaying ? (
                  <>⏸ Pause</>
                ) : (
                  <>▶ Play</>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

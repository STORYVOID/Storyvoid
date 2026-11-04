import React, { useState, useEffect } from 'react';

interface EpisodeListProps {
  selectedStoryTitle: string;
  stories: any[];
  unlockedEpisodes: Record<string, boolean>;
  onBack: () => void;
  onEpisodeAction: (ep: any, allSeriesEpisodes: any[], index: number) => void;
  coins: number;
  onUnlockEpisode: (ep: any, price: number) => boolean;
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
  selectedStoryTitle,
  stories,
  unlockedEpisodes,
  onBack,
  onEpisodeAction,
  coins,
  onUnlockEpisode,
}) => {
  const [popupEpisode, setPopupEpisode] = useState<any>(null);
  const [isFollowed, setIsFollowed] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedFollows = localStorage.getItem('storyvoid_followed_series');
      const followedTitles: string[] = savedFollows ? JSON.parse(savedFollows) : [];
      setIsFollowed(followedTitles.includes(selectedStoryTitle));
    } catch (err) {
      console.error('Error checking follow status:', err);
    }
  }, [selectedStoryTitle]);

  const toggleFollow = () => {
    try {
      const savedFollows = localStorage.getItem('storyvoid_followed_series');
      let followedTitles: string[] = savedFollows ? JSON.parse(savedFollows) : [];

      if (isFollowed) {
        followedTitles = followedTitles.filter(t => t !== selectedStoryTitle);
        setIsFollowed(false);
      } else {
        followedTitles.push(selectedStoryTitle);
        setIsFollowed(true);
      }
      localStorage.setItem('storyvoid_followed_series', JSON.stringify(followedTitles));
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  const seriesStories = stories
    .filter(s => s.title === selectedStoryTitle)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const firstSeries = seriesStories[0] || {};

  const handleItemClick = (ep: any, allSeries: any[], idx: number) => {
    const price = Number(ep.coin_price) || 0;
    const isUnlocked = price === 0 || unlockedEpisodes[ep.id];

    if (!isUnlocked) {
      if (coins < price) {
        return;
      }
      setPopupEpisode({ ep, allSeries, idx, price });
    } else {
      onEpisodeAction(ep, allSeries, idx);
    }
  };

  const confirmUnlock = () => {
    if (!popupEpisode) return;
    const { ep, allSeries, idx, price } = popupEpisode;
    const success = onUnlockEpisode(ep, price);
    if (success) {
      setPopupEpisode(null);
      onEpisodeAction(ep, allSeries, idx);
    }
  };

  return (
    <div className="space-y-4 w-full px-3 sm:px-4 pb-20 relative">
      <div className="flex justify-between items-center mb-2">
        <button 
          onClick={onBack}
          className="text-xs text-orange-400 font-bold flex items-center bg-[#16131c] px-3.5 py-2 rounded-xl border border-gray-800 w-fit cursor-pointer hover:border-orange-500 transition-all shadow-md"
        >
          ← Back
        </button>

        <button 
          onClick={toggleFollow}
          className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all cursor-pointer shadow-md ${
            isFollowed 
              ? 'bg-orange-500 text-white border-orange-500' 
              : 'bg-[#16131c] text-orange-400 border-gray-800 hover:border-orange-500'
          }`}
        >
          {isFollowed ? '❤️ Following' : '🤍 Follow Series'}
        </button>
      </div>

      {/* Story details header - Full width comfortable layout */}
      <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 flex gap-4 items-center shadow-lg w-full">
        <img 
          src={firstSeries.poster_url || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400'} 
          alt="Poster" 
          className="w-28 h-36 object-cover rounded-xl border border-gray-700 shadow-md shrink-0"
        />
        <div className="flex-1 space-y-1.5 overflow-hidden">
          <span className="text-[9px] bg-orange-950 text-orange-300 border border-orange-800/60 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block">
            {firstSeries.genre || 'Fantasy'}
          </span>
          <h2 className="text-sm font-black text-white truncate">{firstSeries.title}</h2>
          <p className="text-[10px] text-gray-300 line-clamp-3 leading-relaxed">{firstSeries.description || 'An immersive audio series.'}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 mb-2 px-1">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide">Episodes Playlist</h3>
        <span className="text-[10px] text-gray-500">{seriesStories.length} Episodes Available</span>
      </div>

      <div className="space-y-2.5 w-full">
        {seriesStories.map((ep, idx) => {
          const price = Number(ep.coin_price) || 0;
          const isUnlocked = price === 0 || unlockedEpisodes[ep.id];

          return (
            <div 
              key={ep.id || idx} 
              className={`p-3.5 rounded-xl border transition-all flex justify-between items-center w-full ${isUnlocked ? 'bg-[#16131c] border-gray-800 hover:border-orange-500/50' : 'bg-[#131117] border-gray-800/80 opacity-90'}`}
            >
              <div className="space-y-1 pr-2 flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-bold shrink-0">
                    EP {idx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate">{ep.episode_title || `Episode ${idx + 1}`}</h4>
                </div>
                <p className="text-[10px] font-medium">
                  {price > 0 && !isUnlocked ? (
                    <span className="text-yellow-400 flex items-center gap-1">🔒 Requires {price} Coins</span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1">✨ Unlocked & Ready</span>
                  )}
                </p>
              </div>

              <button 
                onClick={() => handleItemClick(ep, seriesStories, idx)}
                className={`text-[11px] font-bold px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 ${
                  price > 0 && !isUnlocked 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white' 
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {price > 0 && !isUnlocked ? `🔓 Unlock (${price}C)` : '▶ Play Episode'}
              </button>
            </div>
          );
        })}
      </div>

      {popupEpisode && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1721] border border-orange-500/50 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-fadeIn">
            <div className="w-12 h-12 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              🎉
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Unlock Episode</h3>
              <p className="text-xs text-gray-300 mt-1">
                Do you want to use <span className="text-yellow-400 font-bold">{popupEpisode.price} Coins</span> to unlock <span className="text-orange-400 font-bold">{popupEpisode.ep.episode_title}</span>?
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button 
                onClick={() => setPopupEpisode(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmUnlock}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2.5 rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-1"
              >
                ✨ Play Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
    

import React from 'react';

interface EpisodeListProps {
  selectedStoryTitle: string;
  stories: any[];
  unlockedEpisodes: Record<string, boolean>;
  onBack: () => void;
  onEpisodeAction: (ep: any, allSeriesEpisodes: any[], index: number) => void;
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
  selectedStoryTitle,
  stories,
  unlockedEpisodes,
  onBack,
  onEpisodeAction,
}) => {
  const seriesStories = stories.filter(s => s.title === selectedStoryTitle);
  const firstSeries = seriesStories[0] || {};

  return (
    <div className="space-y-4">
      <button 
        onClick={onBack}
        className="text-xs text-orange-400 font-bold mb-4 flex items-center bg-[#16131c] px-3 py-1.5 rounded-lg border border-gray-800 w-fit cursor-pointer"
      >
        ← Back to Home
      </button>

      <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 flex gap-4 items-center">
        <img 
          src={firstSeries.poster_url || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400'} 
          alt="Poster" 
          className="w-24 h-32 object-cover rounded-xl border border-gray-700"
        />
        <div>
          <span className="text-[9px] bg-orange-900/60 text-orange-300 px-2 py-0.5 rounded-full font-bold">
            {firstSeries.genre || 'Thriller'}
          </span>
          <h2 className="text-base font-black mt-1 text-white">{firstSeries.title}</h2>
          <p className="text-[11px] text-gray-400 mt-1 line-clamp-3">{firstSeries.description || 'An immersive audio series.'}</p>
        </div>
      </div>

      <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide mt-6 mb-2">Episodes List</h3>
      <div className="space-y-2">
        {seriesStories.map((ep, idx) => {
          const price = Number(ep.coin_price) || 0;
          const isUnlocked = price === 0 || unlockedEpisodes[ep.id];
          return (
            <div key={ep.id || idx} className="bg-[#16131c] p-3 rounded-xl border border-gray-800 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-white">{ep.episode_title || `Episode ${idx + 1}`}</h4>
                <p className="text-[10px] text-yellow-400 mt-0.5">
                  {price > 0 && !isUnlocked ? `🔒 ${price} Coins` : '✨ Unlocked / Free'}
                </p>
              </div>
              <button 
                onClick={() => onEpisodeAction(ep, seriesStories, idx)}
                className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold px-3 py-2 rounded-lg transition-all cursor-pointer"
              >
                {price > 0 && !isUnlocked ? `Unlock (${price}C)` : '▶ Play'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

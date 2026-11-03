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
  // Series ke episodes filter karke unhe properly sort kar lo (Episode 1 pehle, phir 2, etc.)
  const seriesStories = stories
    .filter(s => s.title === selectedStoryTitle)
    .sort((a, b) => {
      // Agar episode titles me number hain toh unke hisab se sort karega
      const numA = parseInt(a.episode_title?.replace(/[^0-9]/g, '') || '0');
      const numB = parseInt(b.episode_title?.replace(/[^0-9]/g, '') || '0');
      return numA - numB;
    });

  const firstSeries = seriesStories[0] || {};

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <button 
        onClick={onBack}
        className="text-xs text-orange-400 font-bold mb-2 flex items-center bg-[#16131c] px-3 py-1.5 rounded-lg border border-gray-800 w-fit cursor-pointer hover:border-orange-500 transition-all"
      >
        ← Back to Home
      </button>

      {/* Series Header Card */}
      <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 flex gap-4 items-center shadow-lg">
        <img 
          src={firstSeries.poster_url || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400'} 
          alt="Poster" 
          className="w-24 h-32 object-cover rounded-xl border border-gray-700 shadow-md"
        />
        <div className="flex-1">
          <span className="text-[9px] bg-orange-900/60 text-orange-300 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            {firstSeries.genre || 'Thriller'}
          </span>
          <h2 className="text-base font-black mt-1 text-white">{firstSeries.title}</h2>
          <p className="text-[11px] text-gray-400 mt-1 line-clamp-3 leading-relaxed">{firstSeries.description || 'An immersive audio series.'}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 mb-2">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide">Episodes Playlist</h3>
        <span className="text-[10px] text-gray-500">{seriesStories.length} Episodes Available</span>
      </div>

      {/* Episodes List */}
      <div className="space-y-2.5 pb-16">
        {seriesStories.map((ep, idx) => {
          const price = Number(ep.coin_price) || 0;
          const isUnlocked = price === 0 || unlockedEpisodes[ep.id];

          return (
            <div 
              key={ep.id || idx} 
              className={`p-3.5 rounded-xl border transition-all flex justify-between items-center ${isUnlocked ? 'bg-[#16131c] border-gray-800 hover:border-orange-500/50' : 'bg-[#131117] border-gray-800/80 opacity-90'}`}
            >
              <div className="space-y-1 pr-2">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-bold">
                    EP {idx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-xs">{ep.episode_title || `Episode ${idx + 1}`}</h4>
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
                onClick={() => onEpisodeAction(ep, seriesStories, idx)}
                className={`text-[11px] font-bold px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1 whitespace-nowrap ${
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
    </div>
  );
};
        

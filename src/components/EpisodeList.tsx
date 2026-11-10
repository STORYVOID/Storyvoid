import React, { useState, useEffect } from 'react';

interface EpisodeListProps {
  episodes: any[];
  onEpisodeClick: (episode: any, playlist: any[]) => void;
  unlockedEpisodes: Record<string, boolean>;
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
  episodes,
  onEpisodeClick,
  unlockedEpisodes,
}) => {
  return (
    <div className="space-y-2.5 w-full">
      {episodes.map((ep, idx) => {
        const price = Number(ep.coin_price || 0);
        const isUnlocked = price === 0 || unlockedEpisodes[ep.id];

        return (
          <div 
            key={ep.id || idx} 
            className="p-3.5 rounded-xl border border-gray-800 bg-[#16131c] flex justify-between items-center w-full shadow-md"
          >
            <div className="space-y-1 pr-2 flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-bold shrink-0">
                  EP {idx + 1}
                </span>
                <h4 className="text-xs font-bold text-white truncate">
                  {ep.episode_title || `Episode ${idx + 1}`}
                </h4>
              </div>
              <p className="text-[10px] font-medium">
                {price > 0 && !isUnlocked ? (
                  <span className="text-yellow-400">🔒 Requires {price} Coins</span>
                ) : (
                  <span className="text-emerald-400">✨ Unlocked & Ready</span>
                )}
              </p>
            </div>

            <button 
              onClick={() => onEpisodeClick(ep, episodes)}
              className="text-[11px] font-bold px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-md cursor-pointer shrink-0"
            >
              {price > 0 && !isUnlocked ? `Unlock (${price}C)` : '▶ Play'}
            </button>
          </div>
        );
      })}
    </div>
  );
};

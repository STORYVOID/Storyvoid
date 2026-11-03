import React from 'react';

interface AudioPlayerProps {
  currentPlayingEpisode: any;
  isPlaying: boolean;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrev: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentPlayingEpisode,
  isPlaying,
  togglePlayPause,
  playNext,
  playPrev,
}) => {
  if (!currentPlayingEpisode) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-[#1a1721] border-t border-orange-500/50 p-3 px-4 z-40 shadow-2xl space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 truncate">
          <div className="w-9 h-9 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 font-bold text-xs">
            ▶
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-white truncate">{currentPlayingEpisode.episode_title || 'Playing Episode'}</h4>
            <p className="text-[10px] text-gray-400 truncate">{currentPlayingEpisode.title}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={playPrev}
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer"
            title="Previous Episode"
          >
            ⏮ Prev
          </button>
          <button 
            onClick={togglePlayPause}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer shadow-md"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button 
            onClick={playNext}
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer"
            title="Next Episode"
          >
            Next ⏭
          </button>
        </div>
      </div>
    </div>
  );
};

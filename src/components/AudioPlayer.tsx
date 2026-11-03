import React, { useState } from 'react';

interface AudioPlayerProps {
  currentPlayingEpisode: any;
  isPlaying: boolean;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrev: () => void;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentPlayingEpisode,
  isPlaying,
  togglePlayPause,
  playNext,
  playPrev,
  audioRef,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentPlayingEpisode) return null;

  const skipTime = (seconds: number) => {
    if (audioRef && audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  return (
    <>
      {/* Mini Player Bar */}
      <div 
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-16 left-0 right-0 bg-[#1a1721] border-t border-orange-500/50 p-3 px-4 z-40 shadow-2xl flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center space-x-3 truncate">
          <div className="w-9 h-9 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 font-bold text-xs">
            ▶
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-white truncate">{currentPlayingEpisode.episode_title || 'Playing Episode'}</h4>
            <p className="text-[10px] text-gray-400 truncate">{currentPlayingEpisode.title}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
          <button 
            onClick={playPrev}
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer"
          >
            ⏮ Prev
          </button>
          <button 
            onClick={togglePlayPause}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer shadow-md"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button 
            onClick={playNext}
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer"
          >
            Next ⏭
          </button>
        </div>
      </div>

      {/* Full Screen Expanded Player Panel */}
      {isExpanded && (
        <div className="fixed inset-0 bg-[#0f0d13] z-50 flex flex-col justify-between p-6 animate-fadeIn">
          {/* Top Header */}
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-white text-xl font-bold bg-gray-800/60 p-2 rounded-full cursor-pointer hover:bg-gray-700"
            >
              ⌄
            </button>
            <div className="text-center">
              <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Now Playing</p>
              <h3 className="text-xs font-bold text-white truncate max-w-[200px]">{currentPlayingEpisode.title}</h3>
            </div>
            <div className="w-8"></div>
          </div>

          {/* Center Poster & Details (Poster size optimized & smaller) */}
          <div className="flex flex-col items-center justify-center space-y-4 my-auto">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
              <img 
                src={currentPlayingEpisode.poster_url || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400'} 
                alt="Story Poster" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center space-y-1 px-4">
              <h2 className="text-sm font-black text-white">{currentPlayingEpisode.episode_title}</h2>
              <p className="text-xs text-gray-400">{currentPlayingEpisode.title}</p>
            </div>
          </div>

          {/* Bottom Controls with 10s Skip Buttons */}
          <div className="space-y-4 pb-6">
            <div className="flex items-center justify-center space-x-4">
              <button 
                onClick={() => skipTime(-10)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer"
              >
                ↺ -10s
              </button>
              <button 
                onClick={playPrev}
                className="text-white hover:text-orange-400 text-xs font-bold px-2 cursor-pointer"
              >
                ⏮ PREV
              </button>
              <button 
                onClick={togglePlayPause}
                className="w-14 h-14 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-xl cursor-pointer"
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button 
                onClick={playNext}
                className="text-white hover:text-orange-400 text-xs font-bold px-2 cursor-pointer"
              >
                NEXT ⏭
              </button>
              <button 
                onClick={() => skipTime(10)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer"
              >
                +10s ↻
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
            

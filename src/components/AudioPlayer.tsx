import React, { useState, useEffect } from 'react';

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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef?.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [audioRef]);

  if (!currentPlayingEpisode) return null;

  const skipTime = (seconds: number) => {
    if (audioRef && audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef && audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <>
      {/* Mini Player Bar - Placed exactly above bottom navigation */}
      <div 
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-[52px] left-0 right-0 bg-[#16131c] border-t border-orange-500/40 p-2.5 px-4 z-40 shadow-2xl flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center space-x-3 truncate">
          <div className="w-9 h-9 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 font-bold text-xs shrink-0">
            ▶
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-white truncate">{currentPlayingEpisode.episode_title || 'Playing Episode'}</h4>
            <p className="text-[10px] text-gray-400 truncate">{currentPlayingEpisode.title}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0" onClick={e => e.stopPropagation()}>
          <button 
            onClick={() => skipTime(-10)}
            className="bg-gray-800 hover:bg-gray-700 text-white p-1.5 rounded-lg text-[10px] cursor-pointer"
          >
            ↺10s
          </button>
          <button 
            onClick={togglePlayPause}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer shadow-md"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button 
            onClick={() => skipTime(10)}
            className="bg-gray-800 hover:bg-gray-700 text-white p-1.5 rounded-lg text-[10px] cursor-pointer"
          >
            10s↻
          </button>
        </div>
      </div>

      {/* Expanded Player View with Progress Bar & Time */}
      {isExpanded && (
        <div className="fixed inset-x-0 top-0 bottom-[52px] bg-[#0e0c12] z-50 flex flex-col justify-between py-6 px-6 overflow-y-auto">
          {/* Top Header */}
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white text-xl px-3 py-1 rounded-full bg-gray-900/80 border border-gray-800 cursor-pointer"
            >
              ⌄
            </button>
            <div className="text-center">
              <span className="text-[10px] tracking-widest text-orange-400 uppercase font-semibold">Now Playing</span>
              <h3 className="text-xs font-bold text-white truncate max-w-[200px]">{currentPlayingEpisode.title}</h3>
            </div>
            <div className="w-8"></div>
          </div>

          {/* Center Poster & Details */}
          <div className="flex flex-col items-center justify-center space-y-4 my-auto py-2">
            <div className="w-48 h-56 rounded-2xl overflow-hidden shadow-2xl border border-gray-800/80 bg-gray-900">
              <img 
                src={currentPlayingEpisode.poster_url || currentPlayingEpisode.cover_url || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400'} 
                alt="Story Poster" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center space-y-1 px-4">
              <h2 className="text-sm font-bold text-white tracking-wide">{currentPlayingEpisode.episode_title}</h2>
              <p className="text-xs text-gray-400">{currentPlayingEpisode.title}</p>
            </div>
          </div>

          {/* Progress Bar & Time Tracker */}
          <div className="space-y-2 px-2">
            <input 
              type="range" 
              min={0} 
              max={duration || 100} 
              value={currentTime} 
              onChange={handleSeek}
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-[11px] text-gray-400 font-medium">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="space-y-4 pb-2">
            <div className="flex items-center justify-center space-x-4">
              <button 
                onClick={() => skipTime(-10)}
                className="text-gray-300 hover:text-white text-xs font-medium bg-gray-900 border border-gray-800 px-3 py-2.5 rounded-xl cursor-pointer transition-all shadow-md"
              >
                ↺ 10s
              </button>
              <button 
                onClick={playPrev}
                className="text-gray-300 hover:text-orange-400 text-sm p-2 cursor-pointer"
              >
                ⏮
              </button>
              <button 
                onClick={togglePlayPause}
                className="w-14 h-14 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center text-white text-xl shadow-xl cursor-pointer transition-all"
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button 
                onClick={playNext}
                className="text-gray-300 hover:text-orange-400 text-sm p-2 cursor-pointer"
              >
                ⏭
              </button>
              <button 
                onClick={() => skipTime(10)}
                className="text-gray-300 hover:text-white text-xs font-medium bg-gray-900 border border-gray-800 px-3 py-2.5 rounded-xl cursor-pointer transition-all shadow-md"
              >
                10s ↻
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
            

import React, { useState, useEffect } from 'react';
import { EpisodeList } from './EpisodeList';

interface LibraryViewProps {
  stories: any[];
  unlockedEpisodes: Record<string, boolean>;
  coins: number;
  onEpisodeAction: (ep: any, allSeriesEpisodes: any[], index: number) => void;
  onUnlockEpisode: (ep: any, price: number) => boolean;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  stories,
  unlockedEpisodes,
  coins,
  onEpisodeAction,
  onUnlockEpisode,
}) => {
  const [selectedStoryTitle, setSelectedStoryTitle] = useState<string | null>(null);
  const [followedStories, setFollowedStories] = useState<any[]>([]);
  const [listeningHistory, setListeningHistory] = useState<any[]>([]);

  const loadLibraryData = () => {
    try {
      const savedFollows = localStorage.getItem('storyvoid_followed_series');
      const followedTitles: string[] = savedFollows ? JSON.parse(savedFollows) : [];

      const uniqueMap = new Map();
      stories.forEach(item => {
        if (item.title && followedTitles.includes(item.title) && !uniqueMap.has(item.title)) {
          uniqueMap.set(item.title, {
            title: item.title,
            genre: item.genre || 'Thriller',
            description: item.description,
            poster_url: item.poster_url || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400',
          });
        }
      });
      setFollowedStories(Array.from(uniqueMap.values()));

      const savedHistory = localStorage.getItem('storyvoid_listening_history');
      const historyList = savedHistory ? JSON.parse(savedHistory) : [];
      setListeningHistory(historyList);
    } catch (err) {
      console.error('Error loading library data:', err);
    }
  };

  useEffect(() => {
    loadLibraryData();
  }, [stories]);

  const handleClearHistory = () => {
    try {
      localStorage.removeItem('storyvoid_listening_history');
      setListeningHistory([]);
    } catch (err) {
      console.error('Error clearing history:', err);
    }
  };

  if (selectedStoryTitle) {
    return (
      <EpisodeList 
        selectedStoryTitle={selectedStoryTitle}
        stories={stories}
        unlockedEpisodes={unlockedEpisodes}
        onBack={() => {
          setSelectedStoryTitle(null);
          loadLibraryData();
        }}
        onEpisodeAction={onEpisodeAction}
        coins={coins}
        onUnlockEpisode={onUnlockEpisode}
      />
    );
  }

  return (
    <div className="p-4 space-y-6 pb-20 w-full">
      {/* Following Series Section */}
      <div className="space-y-3 w-full">
        <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wide">❤️ Following Series</h2>
        {followedStories.length === 0 ? (
          <div className="bg-[#16131c] p-4 rounded-xl border border-gray-800 text-center w-full">
            <p className="text-[11px] text-gray-400">No followed series yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 w-full">
            {followedStories.map((series: any, idx: number) => (
              <div 
                key={idx} 
                onClick={() => setSelectedStoryTitle(series.title)}
                className="bg-[#16131c] rounded-xl p-2.5 border border-gray-800 cursor-pointer hover:border-orange-500 transition-all shadow-md w-full"
              >
                <img 
                  src={series.poster_url} 
                  alt="Poster" 
                  className="h-36 w-full object-cover rounded-lg mb-2 border border-gray-700" 
                />
                <span className="text-[9px] bg-orange-900/60 text-orange-300 px-2.5 py-0.5 rounded-full font-bold inline-block">
                  {series.genre}
                </span>
                <h4 className="text-xs font-bold truncate mt-1 text-white">{series.title}</h4>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Listening History Section with Clear Button */}
      <div className="space-y-3 w-full">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wide">🎧 Listening History</h2>
          {listeningHistory.length > 0 && (
            <button 
              onClick={handleClearHistory}
              className="text-[10px] bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800/50 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer shadow-sm"
            >
              🗑️ Clear History
            </button>
          )}
        </div>

        {listeningHistory.length === 0 ? (
          <div className="bg-[#16131c] p-4 rounded-xl border border-gray-800 text-center w-full">
            <p className="text-[11px] text-gray-400">No history yet. Start listening to episodes!</p>
          </div>
        ) : (
          <div className="space-y-2 w-full">
            {listeningHistory.map((item: any, idx: number) => (
              <div 
                key={idx} 
                onClick={() => setSelectedStoryTitle(item.title)}
                className="bg-[#16131c] p-3 rounded-xl border border-gray-800 flex justify-between items-center cursor-pointer hover:border-orange-500 transition-all shadow-md w-full"
              >
                <div className="flex items-center space-x-3 truncate flex-1 pr-2">
                  <img src={item.poster_url || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400'} alt="Cover" className="w-10 h-12 object-cover rounded-lg border border-gray-700 shrink-0" />
                  <div className="truncate flex-1">
                    <h4 className="text-xs font-bold text-white truncate">{item.episode_title}</h4>
                    <p className="text-[10px] text-gray-400 truncate">{item.title}</p>
                  </div>
                </div>
                <span className="text-[10px] text-orange-400 font-bold whitespace-nowrap shrink-0">Play Again →</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
              

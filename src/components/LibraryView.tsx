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
      // 1. Followed Stories load karein
      const savedFollows = localStorage.getItem('storyvoid_followed_series');
      const followedTitles: string[] = savedFollows ? JSON.parse(savedFollows) : [];

      const uniqueMap = new Map();
      stories.forEach(item => {
        if (item.title && followedTitles.includes(item.title) && !uniqueMap.has(item.title)) {
          uniqueMap.set(item.title, {
            title: item.title,
            genre: item.genre || 'Thriller',
            poster_url: item.poster_url || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400',
          });
        }
      });
      setFollowedStories(Array.from(uniqueMap.values()));

      // 2. Listening History load karein
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
    <div className="p-4 space-y-6 pb-20">
      {/* Following Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wide">❤️ Following Series</h2>
        {followedStories.length === 0 ? (
          <div className="bg-[#16131c] p-4 rounded-xl border border-gray-800 text-center">
            <p className="text-[11px] text-gray-400">No followed series yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {followedStories.map((series: any, idx: number) => (
              <div 
                key={idx} 
                onClick={() => setSelectedStoryTitle(series.title)}
                className="bg-[#16131c] rounded-xl p-2 border border-gray-800 cursor-pointer hover:border-orange-500 transition-all shadow-md"
              >
                <img 
                  src={series.poster_url} 
                  alt="Poster" 
                  className="h-28 w-full object-cover rounded-lg mb-1.5 border border-gray-700" 
                />
                <span className="text-[8px] bg-orange-900/60 text-orange-300 px-2 py-0.5 rounded-full font-bold inline-block">
                  {series.genre}
                </span>
                <h4 className="text-[11px] font-bold truncate mt-1 text-white">{series.title}</h4>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Listening History Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wide">🎧 Listening History</h2>
        {listeningHistory.length === 0 ? (
          <div className="bg-[#16131c] p-4 rounded-xl border border-gray-800 text-center">
            <p className="text-[11px] text-gray-400">No history yet. Start listening to episodes!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {listeningHistory.map((item: any, idx: number) => (
              <div 
                key={idx} 
                onClick={() => setSelectedStoryTitle(item.title)}
                className="bg-[#16131c] p-3 rounded-xl border border-gray-800 flex justify-between items-center cursor-pointer hover:border-orange-500 transition-all shadow-md"
              >
                <div className="flex items-center space-x-3 truncate">
                  <img src={item.poster_url || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400'} alt="Cover" className="w-10 h-12 object-cover rounded-lg border border-gray-700" />
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white truncate">{item.episode_title}</h4>
                    <p className="text-[10px] text-gray-400 truncate">{item.title}</p>
                  </div>
                </div>
                <span className="text-[10px] text-orange-400 font-bold whitespace-nowrap">Play Again →</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
      

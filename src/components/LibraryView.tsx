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
  const [savedStories, setSavedStories] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('storyvoid_library');
      if (saved) {
        setSavedStories(JSON.parse(saved));
      } else {
        // Default me agar kuch nahi hai toh saari series me se pehli 2-3 dikha sakte hain ya khali rakh sakte hain
        const uniqueMap = new Map();
        stories.forEach(item => {
          if (item.title && !uniqueMap.has(item.title)) {
            uniqueMap.set(item.title, {
              title: item.title,
              genre: item.genre || 'Thriller',
              poster_url: item.poster_url || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400',
            });
          }
        });
        const all = Array.from(uniqueMap.values());
        setSavedStories(all);
      }
    } catch (err) {
      console.error('Error loading library:', err);
    }
  }, [stories]);

  if (selectedStoryTitle) {
    return (
      <EpisodeList 
        selectedStoryTitle={selectedStoryTitle}
        stories={stories}
        unlockedEpisodes={unlockedEpisodes}
        onBack={() => setSelectedStoryTitle(null)}
        onEpisodeAction={onEpisodeAction}
        coins={coins}
        onUnlockEpisode={onUnlockEpisode}
      />
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-sm font-black text-orange-500 uppercase tracking-wider">📚 Your Library & History</h2>
      <p className="text-[10px] text-gray-400">Aapki follow ki gayi stories aur listening history yahan dikhegi.</p>

      {savedStories.length === 0 ? (
        <div className="bg-[#16131c] p-6 rounded-xl border border-gray-800 text-center mt-6">
          <p className="text-xs text-gray-400">No saved stories yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5">
          {savedStories.map((series: any, idx: number) => (
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
  );
};
                        

import React, { useState } from 'react';
import { EpisodeList } from './EpisodeList';

interface SearchViewProps {
  stories: any[];
  unlockedEpisodes: Record<string, boolean>;
  coins: number;
  onEpisodeAction: (ep: any, allSeriesEpisodes: any[], index: number) => void;
  onUnlockEpisode: (ep: any, price: number) => boolean;
}

export const SearchView: React.FC<SearchViewProps> = ({
  stories,
  unlockedEpisodes,
  coins,
  onEpisodeAction,
  onUnlockEpisode,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStoryTitle, setSelectedStoryTitle] = useState<string | null>(null);

  const uniqueSeriesMap = new Map();
  stories.forEach(item => {
    if (item.title && !uniqueSeriesMap.has(item.title)) {
      uniqueSeriesMap.set(item.title, {
        title: item.title,
        genre: item.genre || 'Thriller',
        description: item.description,
        poster_url: item.poster_url || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400',
        episodesCount: 1
      });
    } else if (item.title) {
      const existing = uniqueSeriesMap.get(item.title);
      existing.episodesCount += 1;
    }
  });
  const uniqueSeriesList = Array.from(uniqueSeriesMap.values());

  const searchResultsList = uniqueSeriesList.filter((s: any) => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.genre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <h2 className="text-sm font-black text-orange-500 mb-3 uppercase tracking-wider">🔍 Search Stories</h2>
      <input 
        type="text" 
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Search audio thrillers, fantasy..." 
        className="w-full bg-[#16131c] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500 mb-4 shadow-lg"
      />

      {searchResultsList.length === 0 ? (
        <div className="bg-[#16131c] p-6 rounded-xl border border-gray-800 text-center mt-6">
          <p className="text-xs text-gray-400">No stories found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {searchResultsList.map((series: any, idx: number) => (
            <div 
              key={idx} 
              onClick={() => setSelectedStoryTitle(series.title)}
              className="bg-[#16131c] rounded-xl p-2.5 border border-gray-800 cursor-pointer hover:border-orange-500 transition-all shadow-md"
            >
              <img 
                src={series.poster_url} 
                alt="Poster" 
                className="h-36 w-full object-cover rounded-lg mb-2 border border-gray-700" 
              />
              <span className="text-[9px] bg-orange-900/60 text-orange-300 px-2.5 py-0.5 rounded-full font-bold">
                {series.genre}
              </span>
              <h4 className="text-xs font-bold truncate mt-1 text-white">{series.title}</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">{series.episodesCount} Episodes</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
    

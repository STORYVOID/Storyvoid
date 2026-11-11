import React, { useState, useEffect } from 'react';

interface LibraryViewProps {
  series: any[];
  onSelectStory: (title: string) => void;
  onEpisodeClick: (ep: any, playlist: any[]) => void;
  userEmail?: string;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  series,
  onSelectStory,
  onEpisodeClick,
  userEmail = 'guest',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'following' | 'history'>('following');
  const [followedTitles, setFollowedTitles] = useState<string[]>([]);
  const [historyEpisodes, setHistoryEpisodes] = useState<any[]>([]);

  const followKey = `storyvoid_followed_series_${userEmail.toLowerCase()}`;
  const historyKey = `storyvoid_history_${userEmail.toLowerCase()}`;

  useEffect(() => {
    try {
      const savedFollows = localStorage.getItem(followKey);
      if (savedFollows) {
        setFollowedTitles(JSON.parse(savedFollows));
      }

      const savedHistory = localStorage.getItem(historyKey);
      if (savedHistory) {
        setHistoryEpisodes(JSON.parse(savedHistory));
      }
    } catch (err) {
      console.error('Error loading library data:', err);
    }
  }, [userEmail]);

  const followedSeriesList = series.filter(s => followedTitles.includes(s.title));

  return (
    <div className="space-y-4 pb-20">
      <h2 className="text-sm font-black text-white uppercase tracking-wider">My Library</h2>

      <div className="flex gap-2 border-b border-gray-800 pb-2">
        <button
          onClick={() => setActiveSubTab('following')}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'following'
              ? 'bg-[#ff741c] text-white'
              : 'bg-[#16131c] text-gray-400 hover:text-white'
          }`}
        >
          ❤️ Following ({followedSeriesList.length})
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'history'
              ? 'bg-[#ff741c] text-white'
              : 'bg-[#16131c] text-gray-400 hover:text-white'
          }`}
        >
          🕒 History ({historyEpisodes.length})
        </button>
      </div>

      {activeSubTab === 'following' ? (
        followedSeriesList.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-2xl">🤍</p>
            <p className="text-xs text-gray-400">No followed series yet.</p>
            <p className="text-[10px] text-gray-500">Go to home and follow your favorite stories!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {followedSeriesList.map((story: any) => (
              <button
                key={story.title}
                onClick={() => onSelectStory(story.title)}
                className="rounded-xl border border-gray-800 bg-[#16131c] p-2.5 text-left overflow-hidden cursor-pointer hover:border-orange-500 transition-all shadow-md"
              >
                <img
                  src={story.cover_url || story.poster_url}
                  alt={story.title}
                  className="w-full h-32 rounded-lg object-cover border border-gray-800"
                />
                <span className="inline-block mt-2 bg-orange-950 text-orange-300 px-2 py-0.5 rounded text-[9px] font-bold">
                  {story.genre || 'Drama'}
                </span>
                <h3 className="font-bold text-xs mt-1 truncate text-white">{story.title}</h3>
                <p className="text-[10px] text-gray-400">{story.episodesCount} Episodes</p>
              </button>
            ))}
          </div>
        )
      ) : (
        historyEpisodes.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-2xl">🎧</p>
            <p className="text-xs text-gray-400">No listening history found.</p>
            <p className="text-[10px] text-gray-500">Play an episode to see it here!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {historyEpisodes.map((ep: any, idx: number) => (
              <div
                key={ep.id || idx}
                className="p-3 rounded-xl border border-gray-800 bg-[#16131c] flex justify-between items-center w-full shadow-md"
              >
                <div className="space-y-0.5 pr-2 flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{ep.episode_title || ep.title}</h4>
                  <p className="text-[10px] text-gray-400 truncate">{ep.title}</p>
                </div>
                <button
                  onClick={() => onEpisodeClick(ep, [ep])}
                  className="text-[11px] font-bold px-3.5 py-1.5 rounded-xl bg-[#ff741c] hover:bg-orange-600 text-white transition-all cursor-pointer shrink-0"
                >
                  ▶ Play
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
            

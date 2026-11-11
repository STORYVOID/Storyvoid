import React, { useState } from 'react';
import { HomeTab } from './HomeTab';
import { LibraryView } from './LibraryView';
import { ProfileTab } from './ProfileTab';
import { AdminTab } from './AdminTab';

interface AppTabContentProps {
  activeTab: 'home' | 'search' | 'library' | 'profile' | 'admin';
  isAdmin: boolean;
  homeProps: any;
  stories: any[];
  series?: any[];
  onEpisodeClick: (ep: any, playlist: any[]) => void;
  userEmail: string;
  coins: number;
  onLogout: () => void;
  onOpenCoinStore: () => void;
  fetchStories: () => void;
  showSuccessMessage: (msg: string) => void;
}

export const AppTabContent: React.FC<AppTabContentProps> = ({
  activeTab,
  isAdmin,
  homeProps,
  stories,
  series = [],
  onEpisodeClick,
  userEmail,
  coins,
  onLogout,
  onOpenCoinStore,
  fetchStories,
  showSuccessMessage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  switch (activeTab) {
    case 'home':
      return <HomeTab {...homeProps} />;
    
    case 'search':
      const filtered = stories.filter(s => 
        s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.genre?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return (
        <div className="space-y-4 pb-20">
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Search Stories</h2>
          <input 
            type="text"
            placeholder="Search by title or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#16131c] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
          />
          <div className="space-y-2">
            {filtered.map((ep: any, idx: number) => (
              <div key={ep.id || idx} className="p-3 rounded-xl border border-gray-800 bg-[#16131c] flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-white">{ep.episode_title || ep.title}</h4>
                  <p className="text-[10px] text-gray-400">{ep.title} • {ep.genre}</p>
                </div>
                <button 
                  onClick={() => onEpisodeClick(ep, [ep])}
                  className="text-[11px] font-bold px-3.5 py-1.5 rounded-xl bg-[#ff741c] text-white cursor-pointer"
                >
                  ▶ Play
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'library':
      return (
        <LibraryView 
          series={series} 
          onSelectStory={(title) => homeProps.onSelectStory(title)}
          onEpisodeClick={onEpisodeClick}
          userEmail={userEmail}
        />
      );
    
    case 'profile':
      return (
        <ProfileTab 
          userEmail={userEmail} 
          coins={coins} 
          onLogout={onLogout} 
          onOpenCoinStore={onOpenCoinStore} 
        />
      );
    
    case 'admin':
      return isAdmin ? (
        <AdminTab 
          fetchStories={fetchStories} 
          showSuccessMessage={showSuccessMessage} 
        />
      ) : (
        <div className="text-center py-12 text-gray-400 text-xs">Access Denied</div>
      );
      
    default:
      return <HomeTab {...homeProps} />;
  }
};
        

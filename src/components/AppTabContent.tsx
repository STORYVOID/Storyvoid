import React from 'react';
import { HomeTab } from './HomeTab';
import { SearchTab } from './SearchTab';
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
  switch (activeTab) {
    case 'home':
      return <HomeTab {...homeProps} />;
    
    case 'search':
      return <SearchTab stories={stories} onEpisodeClick={onEpisodeClick} />;
    
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

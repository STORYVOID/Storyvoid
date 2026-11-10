
import React from 'react';
import { AdminPanel } from '../AdminPanel';
import { HomeTab } from './HomeTab';
import { SearchView } from './SearchView';
import { LibraryView } from './LibraryView';
import { ProfileView } from './ProfileView';

interface AppTabContentProps {
  activeTab: string;
  isAdmin: boolean;
  homeProps: React.ComponentProps<typeof HomeTab>;
  stories: any[];
  onEpisodeClick: (episode: any) => void;
  userEmail: string;
  coins: number;
  onLogout: () => void;
  onOpenCoinStore: () => void;
  fetchStories: () => void;
  showSuccessMessage: (message: string) => void;
}

export const AppTabContent: React.FC<AppTabContentProps> = ({
  activeTab,
  isAdmin,
  homeProps,
  stories,
  onEpisodeClick,
  userEmail,
  coins,
  onLogout,
  onOpenCoinStore,
  fetchStories,
  showSuccessMessage,
}) => {
  return (
    <>
      {activeTab === 'home' && <HomeTab {...homeProps} />}

      {activeTab === 'search' && (
        <SearchView
          stories={stories}
          onEpisodeClick={onEpisodeClick}
        />
      )}

      {activeTab === 'library' && (
        <LibraryView onEpisodeClick={onEpisodeClick} />
      )}

      {activeTab === 'profile' && (
        <ProfileView
          userEmail={userEmail}
          coins={coins}
          onLogout={onLogout}
          onOpenCoinStore={onOpenCoinStore}
        />
      )}

      {activeTab === 'admin' && isAdmin && (
        <AdminPanel
          stories={stories}
          fetchStories={fetchStories}
          setSuccessMessage={showSuccessMessage}
        />
      )}
    </>
  );
};
  

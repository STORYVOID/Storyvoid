import React from 'react';
import { HomeTab } from './HomeTab';
import { SearchView } from './SearchView';
import { LibraryView } from './LibraryView';
import { ProfileView } from './ProfileView';
import { AdminPanel } from '../AdminPanel';

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
  onWatchAd?: () => void;
  adsWatched?: number;
  adMessage?: string;
  isClaimingReward?: boolean;
}

export const AppTabContent: React.FC<AppTabContentProps> = ({
  activeTab,
  isAdmin,
  homeProps,
  stories,
  series,
  onEpisodeClick,
  userEmail,
  coins,
  onLogout,
  onOpenCoinStore,
  fetchStories,
  showSuccessMessage,
  onWatchAd,
  adsWatched,
  adMessage,
  isClaimingReward,
}) => {
  switch (activeTab) {
    case 'home':
      return <HomeTab {...homeProps} />;

    case 'search':
      return (
        <SearchView
          stories={stories}
          onEpisodeClick={onEpisodeClick}
        />
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
        <ProfileView
          userEmail={userEmail}
          isAdmin={isAdmin}
          coins={coins}
          onLogout={onLogout}
          onOpenCoinStore={onOpenCoinStore}
          onWatchAd={onWatchAd || homeProps.onWatchAd}
          adsWatched={adsWatched}
          adMessage={adMessage}
          isClaimingReward={isClaimingReward}
        />
      );

    case 'admin':
      return isAdmin ? (
        <AdminPanel
          stories={stories}
          fetchStories={fetchStories}
          setSuccessMessage={showSuccessMessage}
        />
      ) : (
        <div className="p-8 text-center text-red-500">
          Access Denied
        </div>
      );

    default:
      return <HomeTab {...homeProps} />;
  }
};

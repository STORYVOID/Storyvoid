
import { useState } from 'react';

export const useAppNavigation = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [selectedGenre, setSelectedGenre] = useState('All');

  const goHome = () => {
    setActiveTab('home');
    setSelectedStory(null);
  };

  return {
    activeTab,
    setActiveTab,
    selectedStory,
    setSelectedStory,
    selectedGenre,
    setSelectedGenre,
    goHome,
  };
};

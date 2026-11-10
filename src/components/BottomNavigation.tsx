import React from 'react';

interface BottomNavigationProps {
  activeTab: string;
  isAdmin: boolean;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  isAdmin,
  onTabChange,
}) => {
  const tabs = [
    { id: 'home', label: 'HOME', icon: '🏠' },
    { id: 'search', label: 'SEARCH', icon: '🔍' },
    { id: 'library', label: 'LIBRARY', icon: '📚' },
    { id: 'profile', label: 'PROFILE', icon: '👤' },
    ...(isAdmin
      ? [{ id: 'admin', label: 'ADMIN', icon: '🛠️' }]
      : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#100e15] border-t border-[#302b39] flex justify-around py-1.5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold cursor-pointer transition-all ${
            activeTab === tab.id
              ? 'text-[#ff741c]'
              : 'text-gray-400'
          }`}
        >
          <span className="text-base">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

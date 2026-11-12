import React from 'react';

interface AppHeaderProps {
  coins: number;
  onOpenCoinStore: () => void;
  onOpenProfile?: () => void; // Optional prop to open profile tab
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  coins,
  onOpenCoinStore,
  onOpenProfile,
}) => {
  return (
    <header className="bg-[#100e15] border-b border-[#292431] px-3 py-2.5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg leading-none font-black tracking-wide text-[#ff741c]">
            STORYVOID
          </h1>
          <p className="text-[9px] text-gray-400 mt-1 tracking-wider font-bold">
            SERIALIZED AUDIO
          </p>
        </div>

        <button
          onClick={onOpenProfile ? onOpenProfile : onOpenCoinStore}
          className="flex items-center gap-1.5 bg-[#202938] border border-[#343d4c] rounded-full px-3 py-1.5 text-white cursor-pointer hover:border-orange-500 transition-all"
          title="Go to Profile & Coins"
        >
          <span className="text-sm">🟡</span>
          <span className="font-bold text-xs">{coins} Coins</span>
          <span className="bg-[#ff741c] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            +
          </span>
        </button>
      </div>
    </header>
  );
};

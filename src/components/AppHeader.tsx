
import React from 'react';

interface AppHeaderProps {
  coins: number;
  onOpenCoinStore: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  coins,
  onOpenCoinStore,
}) => {
  return (
    <header className="bg-[#100e15] border-b border-[#292431] px-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[25px] leading-none font-black tracking-wide text-[#ff741c]">
            STORYVOID
          </h1>
          <p className="text-[11px] text-gray-400 mt-2 tracking-wider font-bold">
            SERIALIZED AUDIO
          </p>
        </div>

        <button
          onClick={onOpenCoinStore}
          className="flex items-center gap-2 bg-[#202938] border border-[#343d4c] rounded-full px-4 py-3 text-white"
        >
          <span className="text-2xl">🟡</span>
          <span className="font-bold text-sm">{coins} Coins</span>
          <span className="bg-[#ff741c] rounded-full w-7 h-7 flex items-center justify-center font-bold">
            +
          </span>
        </button>
      </div>
    </header>
  );
};

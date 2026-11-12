import React from 'react';

interface ProfileViewProps {
  userEmail: string;
  isAdmin: boolean;
  onLogout: () => void;
  onOpenCoinStore: () => void;
  onWatchAd: () => void;
  coins: number;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userEmail,
  isAdmin,
  onLogout,
  onOpenCoinStore,
  onWatchAd,
  coins,
}) => {
  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto pb-20">
      <h2 className="text-sm font-black text-orange-500 uppercase tracking-wider">👤 My Profile</h2>

      {/* User Info Card */}
      <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 flex justify-between items-center shadow-lg">
        <div>
          <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">
            {isAdmin ? 'Logged in as (Admin)' : 'Logged in as (Listener)'}
          </span>
          <h3 className="text-xs font-bold text-white mt-1">{userEmail}</h3>
        </div>
        <button 
          onClick={onLogout}
          className="bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800/50 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
        >
          Logout
        </button>
      </div>

      {/* Wallet Balance Card */}
      <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-yellow-500/20 text-yellow-400 rounded-xl flex items-center justify-center text-lg">
            🟡
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Wallet Balance</span>
            <h3 className="text-sm font-black text-yellow-400">{coins} Coins Available</h3>
          </div>
        </div>
      </div>

      {/* Action Buttons: Buy Coins & Watch Ad */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button 
          onClick={onOpenCoinStore}
          className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white p-4 rounded-2xl font-bold text-xs shadow-lg transition-all cursor-pointer flex flex-col items-center justify-center space-y-1.5 border border-orange-400/30"
        >
          <span className="text-xl">💳</span>
          <span>Buy Coins (UPI / GPay)</span>
        </button>

        <button 
          onClick={onWatchAd}
          className="bg-[#16131c] hover:bg-gray-800 text-yellow-400 border border-yellow-500/40 p-4 rounded-2xl font-bold text-xs shadow-lg transition-all cursor-pointer flex flex-col items-center justify-center space-y-1.5"
        >
          <span className="text-xl">📺</span>
          <span>Watch Ad (+6 Coins)</span>
        </button>
      </div>

      {/* Welcome Note Card */}
      <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 text-center space-y-1 shadow-md">
        <h4 className="text-xs font-bold text-orange-400">✨ Welcome to StoryVoid!</h4>
        <p className="text-[11px] text-gray-400 leading-relaxed">Enjoy listening to serialized audio stories and unlock premium episodes anytime.</p>
      </div>
    </div>
  );
};

import React from 'react';

interface ProfileViewProps {
  userEmail: string;
  isAdmin: boolean;
  onLogout: () => void;
  onOpenCoinStore: () => void;
  onWatchAd: () => void;
  coins: number;
  adsWatched?: number;
  adMessage?: string;
  isClaimingReward?: boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userEmail,
  isAdmin,
  onLogout,
  onOpenCoinStore,
  onWatchAd,
  coins,
  adsWatched = 0,
  adMessage = '',
  isClaimingReward = false,
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

      {/* Buy Coins Button - Coming Soon */}
      <div>
        <button 
          disabled
          className="w-full bg-[#16131c] text-gray-400 p-4 rounded-2xl font-bold text-xs shadow-md border border-gray-800 flex items-center justify-between cursor-not-allowed opacity-80"
        >
          <div className="flex items-center space-x-2">
            <span className="text-xl">💳</span>
            <span>Buy Coins (UPI / GPay)</span>
          </div>
          <span className="bg-orange-500/20 text-orange-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border border-orange-500/30">
            Coming Soon 🚀
          </span>
        </button>
      </div>

      {/* EARN FREE COINS CARD (Exact Home Style & Sync) */}
      <div className="rounded-2xl border border-[#302b39] bg-[#17141d] p-3 space-y-2 shadow-md">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-[#ffd329] text-xs flex items-center gap-1">
              🟡 EARN FREE COINS ({adsWatched}/5 Ads Watched)
            </h3>

            <p className="text-[10px] text-gray-300 mt-0.5">
              Watch rewarded ad to get instant +6 coins! (Max 30/day)
            </p>
          </div>

          <button
            onClick={onWatchAd}
            disabled={adsWatched >= 5 || isClaimingReward}
            className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-black transition-all ${
              adsWatched >= 5 || isClaimingReward
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-[#f4bd00] text-black cursor-pointer hover:bg-yellow-400'
            }`}
          >
            {isClaimingReward
              ? 'Loading Ad...'
              : adsWatched >= 5
                ? 'Limit Reached'
                : 'Watch Ad'}
          </button>
        </div>

        {adMessage && (
          <p className="text-[10px] text-orange-400 font-semibold bg-[#121017] p-1.5 rounded-lg text-center">
            {adMessage}
          </p>
        )}
      </div>

      {/* Welcome Note Card */}
      <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 text-center space-y-1 shadow-md">
        <h4 className="text-xs font-bold text-orange-400">✨ Welcome to StoryVoid!</h4>
        <p className="text-[11px] text-gray-400 leading-relaxed">Enjoy listening to serialized audio stories and unlock premium episodes anytime.</p>
      </div>
    </div>
  );
};
              

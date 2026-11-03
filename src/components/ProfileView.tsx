import React from 'react';

interface ProfileViewProps {
  userEmail: string;
  isAdmin: boolean;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ userEmail, isAdmin, onLogout }) => {
  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-12">
      <div className="bg-[#16131c] p-4 rounded-xl border border-gray-800 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-400">Logged in as ({isAdmin ? 'Admin' : 'User'})</p>
          <p className="text-xs font-bold text-orange-400">{userEmail}</p>
        </div>
        <button 
          onClick={onLogout} 
          className="text-[10px] bg-red-900/40 text-red-300 hover:bg-red-900 px-3 py-1.5 rounded-lg border border-red-800 font-bold cursor-pointer"
        >
          Logout
        </button>
      </div>

      <div className="bg-[#16131c] p-5 rounded-2xl border border-gray-800 text-center">
        <p className="text-xs text-gray-300 font-semibold mb-1">✨ Welcome to StoryVoid!</p>
        <p className="text-[11px] text-gray-400">Enjoy listening to serialized audio stories.</p>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const AdminUsersTab: React.FC = () => {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .order('last_login', { ascending: false });

      if (error) throw error;
      if (data) setUsersList(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const totalUsers = usersList.length;
  const activeUsers = usersList.filter(u => {
    if (!u.last_login) return false;
    const lastLoginDate = new Date(u.last_login).getTime();
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return lastLoginDate >= sevenDaysAgo;
  }).length;

  return (
    <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 space-y-4 shadow-lg">
      <div className="flex justify-between items-center border-b border-gray-800 pb-3">
        <div>
          <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wide">👥 Registered Users Analytics</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Real-time user statistics from database</p>
        </div>
        <button 
          onClick={fetchUsers}
          className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/40 px-3 py-1.5 rounded-xl font-bold cursor-pointer hover:bg-orange-500 hover:text-white transition-all"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#121017] p-3 rounded-xl border border-gray-800 text-center">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Total Users</span>
          <h4 className="text-lg font-black text-white mt-0.5">{totalUsers}</h4>
        </div>
        <div className="bg-[#121017] p-3 rounded-xl border border-gray-800 text-center">
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider">Active (7 Days)</span>
          <h4 className="text-lg font-black text-emerald-400 mt-0.5">{activeUsers}</h4>
        </div>
      </div>

      {loadingUsers ? (
        <p className="text-xs text-gray-400 text-center py-6">Loading users from database...</p>
      ) : usersList.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-6">No users found.</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-none">
          {usersList.map((u, idx) => (
            <div key={idx} className="bg-[#121017] p-3 rounded-xl border border-gray-800 flex justify-between items-center text-xs">
              <div className="truncate pr-2">
                <p className="font-bold text-white truncate">{u.email}</p>
                <p className="text-[9px] text-gray-400 mt-0.5">Last Login: {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="flex items-center space-x-1 bg-yellow-500/10 border border-yellow-500/30 px-2.5 py-1 rounded-lg shrink-0">
                <span className="text-yellow-400 text-[10px]">🟡</span>
                <span className="font-bold text-yellow-400 text-[11px]">{u.coins} Coins</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

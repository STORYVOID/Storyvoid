import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

export const UsersTab: React.FC = () => {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .order('last_login', { ascending: false });

      if (error) throw error;
      if (data) setUsersList(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = usersList.filter(u => {
    const diff = new Date().getTime() - new Date(u.last_login).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const inactiveCount = usersList.length - activeCount;

  return (
    <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 space-y-4 shadow-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide">👥 User Analytics & Management</h3>
        <button onClick={fetchUsers} className="text-[10px] text-orange-400 underline cursor-pointer">Refresh</button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-[#0f0d13] p-3 rounded-xl border border-gray-800">
          <p className="text-[10px] text-gray-400 uppercase">Total Users</p>
          <p className="text-base font-black text-white mt-1">{usersList.length}</p>
        </div>
        <div className="bg-[#0f0d13] p-3 rounded-xl border border-emerald-950">
          <p className="text-[10px] text-emerald-400 uppercase">Active</p>
          <p className="text-base font-black text-emerald-400 mt-1">{activeCount}</p>
        </div>
        <div className="bg-[#0f0d13] p-3 rounded-xl border border-red-950">
          <p className="text-[10px] text-red-400 uppercase">Inactive</p>
          <p className="text-base font-black text-red-400 mt-1">{inactiveCount}</p>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <h4 className="text-[11px] font-bold text-gray-400">Registered Users List</h4>
        {loading ? (
          <p className="text-xs text-gray-400 text-center py-4">Loading users...</p>
        ) : usersList.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No users found in database.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {usersList.map((user, idx) => {
              const isRecent = new Date().getTime() - new Date(user.last_login).getTime() < 7 * 24 * 60 * 60 * 1000;
              return (
                <div key={idx} className="bg-[#0f0d13] p-3 rounded-xl border border-gray-800 flex justify-between items-center">
                  <div className="truncate pr-2">
                    <p className="text-xs font-bold text-white truncate">{user.email}</p>
                    <p className="text-[9px] text-gray-500">Last Login: {new Date(user.last_login).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${isRecent ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
                    {isRecent ? 'Active' : 'Inactive'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

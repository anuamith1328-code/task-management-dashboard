import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskAPI } from '../services/api';

export default function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const { refreshProfile } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await taskAPI.getStats();
        setStats(res.data.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = Number(stats?.total || 0);
  const completed = Number(stats?.completed || 0);
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Your account information and activity</p>
      </div>

      <div className="card flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 w-full">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center sm:text-left">{user?.name}</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</p>
              <p className="text-gray-900 dark:text-white font-medium mt-0.5">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Member Since</p>
              <p className="text-gray-900 dark:text-white font-medium mt-0.5">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{total}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Tasks</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-emerald-500">{completed}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Completed Tasks</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-indigo-600">{completionRate}%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Completion Rate</p>
          </div>
        </div>
      )}
    </div>
  );
}

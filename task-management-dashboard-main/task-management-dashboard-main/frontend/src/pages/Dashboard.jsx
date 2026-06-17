import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler,
} from 'chart.js';
import { taskAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const statusBadge = (status) => {
  if (status === 'Completed') return 'badge-completed';
  if (status === 'In Progress') return 'badge-inprogress';
  return 'badge-todo';
};

const priorityBadge = (priority) => {
  if (priority === 'High') return 'badge-high';
  if (priority === 'Medium') return 'badge-medium';
  return 'badge-low';
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await taskAPI.getStats();
        setStats(res.data.stats);
        setRecentTasks(res.data.recentTasks);
        setWeeklyData(res.data.weeklyData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const total = Number(stats?.total || 0);
  const todo = Number(stats?.todo || 0);
  const inprogress = Number(stats?.inprogress || 0);
  const completed = Number(stats?.completed || 0);

  const cards = [
    { label: 'Total Tasks', value: total, color: 'bg-indigo-600', icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2' },
    { label: 'Pending Tasks', value: todo, color: 'bg-gray-500', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'In Progress', value: inprogress, color: 'bg-amber-500', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { label: 'Completed', value: completed, color: 'bg-emerald-500', icon: 'M5 13l4 4L19 7' },
  ];

  const doughnutData = {
    labels: ['Todo', 'In Progress', 'Completed'],
    datasets: [{
      data: [todo, inprogress, completed],
      backgroundColor: ['#9CA3AF', '#F59E0B', '#22C55E'],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const lineData = {
    labels: weeklyData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Tasks Created',
      data: weeklyData.map(d => d.count),
      borderColor: '#4F46E5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#4F46E5',
      pointRadius: 4,
    }],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's an overview of your productivity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{c.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{c.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl ${c.color} flex items-center justify-center flex-shrink-0`}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={c.icon} /></svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Task Status</h3>
          {total > 0 ? (
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom', labels: { color: '#6B7280', boxWidth: 12 } } }, maintainAspectRatio: false }} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No tasks yet</div>
          )}
        </div>
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Productivity (Last 7 Days)</h3>
          <div className="h-64">
            <Line data={lineData} options={{
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false }, ticks: { color: '#9CA3AF' } },
                y: { beginAtZero: true, ticks: { color: '#9CA3AF', stepSize: 1 }, grid: { color: 'rgba(156,163,175,0.1)' } },
              },
            }} />
          </div>
        </div>
      </div>

      {/* Recent tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Tasks</h3>
          <Link to="/tasks" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View all</Link>
        </div>
        {recentTasks.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No tasks yet. Create your first task to get started!</p>
        ) : (
          <div className="space-y-3">
            {recentTasks.map((t) => (
              <div key={t.task_id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{t.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {t.project_name || 'No project'} {t.due_date ? `· Due ${new Date(t.due_date).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <span className={priorityBadge(t.priority)}>{t.priority}</span>
                  <span className={statusBadge(t.status)}>{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

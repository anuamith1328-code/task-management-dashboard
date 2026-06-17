import React, { useEffect, useState, useCallback } from 'react';
import { taskAPI, projectAPI } from '../services/api';
import TaskModal from '../components/TaskModal';

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

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      const res = await taskAPI.getAll(params);
      setTasks(res.data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectAPI.getAll();
        setProjects(res.data.projects);
      } catch (err) { console.error(err); }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchTasks, 300);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const handleSave = async (data) => {
    if (editingTask) {
      await taskAPI.update(editingTask.task_id, data);
    } else {
      await taskAPI.create(data);
    }
    setModalOpen(false);
    setEditingTask(null);
    fetchTasks();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    await taskAPI.delete(id);
    fetchTasks();
  };

  const toggleComplete = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Todo' : 'Completed';
    await taskAPI.update(task.task_id, { ...task, status: newStatus, due_date: task.due_date ? task.due_date.split('T')[0] : null });
    fetchTasks();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track all your tasks</p>
        </div>
        <button onClick={() => { setEditingTask(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2 justify-center">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="card flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" /></svg>
          <input className="input pl-9" placeholder="Search tasks by title or description..."
            value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </div>
        <select className="input sm:w-44" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <select className="input sm:w-44" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400">No tasks found. {filters.search || filters.status || filters.priority ? 'Try changing the filters.' : 'Create your first task to get started!'}</p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th className="px-6 py-3 font-medium">Task</th>
                <th className="px-6 py-3 font-medium">Project</th>
                <th className="px-6 py-3 font-medium">Priority</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Due Date</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.task_id} className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={t.status === 'Completed'} onChange={() => toggleComplete(t)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                      <div>
                        <p className={`font-medium text-gray-900 dark:text-white ${t.status === 'Completed' ? 'line-through opacity-60' : ''}`}>{t.title}</p>
                        {t.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-xs truncate">{t.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{t.project_name || '—'}</td>
                  <td className="px-6 py-4"><span className={priorityBadge(t.priority)}>{t.priority}</span></td>
                  <td className="px-6 py-4"><span className={statusBadge(t.status)}>{t.status}</span></td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{t.due_date ? new Date(t.due_date).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditingTask(t); setModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-indigo-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(t.task_id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <TaskModal task={editingTask} projects={projects} onClose={() => { setModalOpen(false); setEditingTask(null); }} onSave={handleSave} />
      )}
    </div>
  );
}

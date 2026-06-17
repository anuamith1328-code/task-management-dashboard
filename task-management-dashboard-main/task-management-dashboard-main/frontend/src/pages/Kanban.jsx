import React, { useEffect, useState } from 'react';
import { taskAPI, projectAPI } from '../services/api';
import TaskModal from '../components/TaskModal';

const columns = [
  { key: 'Todo', label: 'Todo', color: 'bg-gray-400' },
  { key: 'In Progress', label: 'In Progress', color: 'bg-amber-500' },
  { key: 'Completed', label: 'Completed', color: 'bg-emerald-500' },
];

const priorityBadge = (priority) => {
  if (priority === 'High') return 'badge-high';
  if (priority === 'Medium') return 'badge-medium';
  return 'badge-low';
};

export default function Kanban() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('Todo');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tRes, pRes] = await Promise.all([taskAPI.getAll(), projectAPI.getAll()]);
      setTasks(tRes.data.tasks);
      setProjects(pRes.data.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDrop = async (status) => {
    setDragOverCol(null);
    if (!draggedTask || draggedTask.status === status) { setDraggedTask(null); return; }
    const updated = { ...draggedTask, status };
    setTasks((prev) => prev.map((t) => (t.task_id === draggedTask.task_id ? updated : t)));
    setDraggedTask(null);
    try {
      await taskAPI.update(draggedTask.task_id, { ...draggedTask, status, due_date: draggedTask.due_date ? draggedTask.due_date.split('T')[0] : null });
    } catch (err) {
      console.error(err);
      fetchAll();
    }
  };

  const handleSave = async (data) => {
    if (editingTask) {
      await taskAPI.update(editingTask.task_id, data);
    } else {
      await taskAPI.create(data);
    }
    setModalOpen(false);
    setEditingTask(null);
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await taskAPI.delete(id);
    fetchAll();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kanban Board</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Drag and drop tasks to update their status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div
              key={col.key}
              onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.key); }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={() => handleDrop(col.key)}
              className={`rounded-xl p-3 bg-gray-100/60 dark:bg-gray-800/40 min-h-[400px] transition-colors ${dragOverCol === col.key ? 'drag-over' : ''}`}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{col.label}</h3>
                  <span className="text-xs text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5">{colTasks.length}</span>
                </div>
                <button onClick={() => { setEditingTask(null); setDefaultStatus(col.key); setModalOpen(true); }} className="text-gray-400 hover:text-indigo-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>

              <div className="space-y-2">
                {colTasks.map((t) => (
                  <div
                    key={t.task_id}
                    draggable
                    onDragStart={() => setDraggedTask(t)}
                    onDragEnd={() => setDraggedTask(null)}
                    onClick={() => { setEditingTask(t); setModalOpen(true); }}
                    className={`bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700 cursor-grab hover:shadow-md transition-all duration-150 ${draggedTask?.task_id === t.task_id ? 'dragging' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{t.title}</p>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(t.task_id); }} className="text-gray-300 hover:text-red-500 flex-shrink-0 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    {t.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{t.description}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <span className={priorityBadge(t.priority)}>{t.priority}</span>
                      {t.due_date && <span className="text-xs text-gray-400">{new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                    </div>
                    {t.project_name && <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2 truncate">📁 {t.project_name}</p>}
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div className="text-center text-xs text-gray-400 py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <TaskModal
          task={editingTask || (defaultStatus !== 'Todo' ? { status: defaultStatus } : null)}
          projects={projects}
          onClose={() => { setModalOpen(false); setEditingTask(null); setDefaultStatus('Todo'); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

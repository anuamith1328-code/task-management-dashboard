const Task = require('../models/Task');

const getAllTasks = async (req, res, next) => {
  try {
    const { status, priority, search, sort = 'created_at', order = 'DESC' } = req.query;

    const filter = { user_id: req.user.user_id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const validSorts = ['created_at', 'due_date', 'priority', 'status', 'title'];
    const sortCol = validSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order === 'ASC' ? 1 : -1;

    const tasks = await Task.find(filter)
      .populate('project_id', 'project_name')
      .sort({ [sortCol]: sortOrder });

    const formatted = tasks.map(formatTask);
    res.json({ success: true, count: formatted.length, tasks: formatted });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user_id: req.user.user_id })
      .populate('project_id', 'project_name');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.json({ success: true, task: formatTask(task) });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, due_date, project_id } = req.body;
    const task = await Task.create({
      title,
      description,
      priority,
      status,
      due_date: due_date || null,
      project_id: project_id || null,
      user_id: req.user.user_id,
    });
    const populated = await task.populate('project_id', 'project_name');
    res.status(201).json({ success: true, message: 'Task created.', task: formatTask(populated) });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, due_date, project_id } = req.body;
    const task = await Task.findOne({ _id: req.params.id, user_id: req.user.user_id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (due_date !== undefined) task.due_date = due_date || null;
    if (project_id !== undefined) task.project_id = project_id || null;

    await task.save();
    const populated = await task.populate('project_id', 'project_name');
    res.json({ success: true, message: 'Task updated.', task: formatTask(populated) });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const result = await Task.findOneAndDelete({ _id: req.params.id, user_id: req.user.user_id });
    if (!result) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.json({ success: true, message: 'Task deleted.' });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const [total, todo, inprogress, completed] = await Promise.all([
      Task.countDocuments({ user_id: userId }),
      Task.countDocuments({ user_id: userId, status: 'Todo' }),
      Task.countDocuments({ user_id: userId, status: 'In Progress' }),
      Task.countDocuments({ user_id: userId, status: 'Completed' }),
    ]);

    const recentTasksRaw = await Task.find({ user_id: userId })
      .populate('project_id', 'project_name')
      .sort({ created_at: -1 })
      .limit(5);
    const recentTasks = recentTasksRaw.map(formatTask);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyDataRaw = await Task.aggregate([
      { $match: { user_id: new (require('mongoose').Types.ObjectId)(userId), created_at: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const weeklyData = weeklyDataRaw.map((d) => ({ date: d._id, count: d.count }));

    res.json({
      success: true,
      stats: { total, todo, inprogress, completed },
      recentTasks,
      weeklyData,
    });
  } catch (error) {
    next(error);
  }
};

function formatTask(task) {
  const obj = task.toObject ? task.toObject() : task;
  return {
    task_id: obj._id,
    title: obj.title,
    description: obj.description,
    priority: obj.priority,
    status: obj.status,
    due_date: obj.due_date,
    project_id: obj.project_id?._id || obj.project_id || null,
    project_name: obj.project_id?.project_name || null,
    user_id: obj.user_id,
    created_at: obj.created_at,
  };
}

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask, getDashboardStats };

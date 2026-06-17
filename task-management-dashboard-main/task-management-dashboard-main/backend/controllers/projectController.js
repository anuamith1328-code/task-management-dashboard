const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');

const getAllProjects = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.user_id);

    const projects = await Project.aggregate([
      { $match: { user_id: userId } },
      {
        $lookup: {
          from: 'tasks',
          localField: '_id',
          foreignField: 'project_id',
          as: 'tasks',
        },
      },
      {
        $addFields: {
          task_count: { $size: '$tasks' },
          completed_count: {
            $size: {
              $filter: { input: '$tasks', as: 't', cond: { $eq: ['$$t.status', 'Completed'] } },
            },
          },
        },
      },
      {
        $addFields: {
          completion_percentage: {
            $cond: [
              { $eq: ['$task_count', 0] },
              0,
              { $round: [{ $multiply: [{ $divide: ['$completed_count', '$task_count'] }, 100] }, 0] },
            ],
          },
        },
      },
      { $project: { tasks: 0 } },
      { $sort: { created_at: -1 } },
    ]);

    const formatted = projects.map((p) => ({
      project_id: p._id,
      project_name: p.project_name,
      description: p.description,
      user_id: p.user_id,
      created_at: p.created_at,
      task_count: p.task_count,
      completed_count: p.completed_count,
      completion_percentage: p.completion_percentage,
    }));

    res.json({ success: true, count: formatted.length, projects: formatted });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const { project_name, description } = req.body;
    const project = await Project.create({
      project_name,
      description: description || '',
      user_id: req.user.user_id,
    });
    res.status(201).json({ success: true, message: 'Project created.', project: formatProject(project) });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { project_name, description } = req.body;
    const project = await Project.findOne({ _id: req.params.id, user_id: req.user.user_id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    if (project_name !== undefined) project.project_name = project_name;
    if (description !== undefined) project.description = description;
    await project.save();

    res.json({ success: true, message: 'Project updated.', project: formatProject(project) });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, user_id: req.user.user_id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    // Unassign tasks that belonged to this project
    await Task.updateMany({ project_id: project._id, user_id: req.user.user_id }, { $set: { project_id: null } });

    res.json({ success: true, message: 'Project deleted.' });
  } catch (error) {
    next(error);
  }
};

function formatProject(project) {
  const obj = project.toObject ? project.toObject() : project;
  return {
    project_id: obj._id,
    project_name: obj.project_name,
    description: obj.description,
    user_id: obj.user_id,
    created_at: obj.created_at,
  };
}

module.exports = { getAllProjects, createProject, updateProject, deleteProject };

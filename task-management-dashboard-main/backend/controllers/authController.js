const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Task = require('../models/Task');
require('dotenv').config();

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign(
      { user_id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: { user_id: user._id, name: user.name, email: user.email, created_at: user.created_at },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { user_id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: { user_id: user._id, name: user.name, email: user.email, created_at: user.created_at },
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.user_id).select('name email created_at');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const userId = req.user.user_id;
    const [total_tasks, completed_tasks, inprogress_tasks, todo_tasks] = await Promise.all([
      Task.countDocuments({ user_id: userId }),
      Task.countDocuments({ user_id: userId, status: 'Completed' }),
      Task.countDocuments({ user_id: userId, status: 'In Progress' }),
      Task.countDocuments({ user_id: userId, status: 'Todo' }),
    ]);

    res.json({
      success: true,
      user: {
        user_id: user._id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        total_tasks,
        completed_tasks,
        inprogress_tasks,
        todo_tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile };

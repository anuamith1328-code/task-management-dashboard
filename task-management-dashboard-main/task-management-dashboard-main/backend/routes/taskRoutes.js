const express = require('express');
const router = express.Router();
const { getAllTasks, getTaskById, createTask, updateTask, deleteTask, getDashboardStats } = require('../controllers/taskController');
const { taskValidation } = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/stats', getDashboardStats);
router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.post('/', taskValidation, createTask);
router.put('/:id', taskValidation, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getAllProjects, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { projectValidation } = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', getAllProjects);
router.post('/', projectValidation, createProject);
router.put('/:id', projectValidation, updateProject);
router.delete('/:id', deleteProject);

module.exports = router;

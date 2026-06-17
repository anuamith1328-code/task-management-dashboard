const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors,
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 255 }).withMessage('Title too long'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),
  body('status').optional().isIn(['Todo', 'In Progress', 'Completed']).withMessage('Invalid status'),
  body('due_date').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
  body('project_id').optional({ nullable: true }).isMongoId().withMessage('Invalid project id'),
  handleValidationErrors,
];

const projectValidation = [
  body('project_name').trim().notEmpty().withMessage('Project name is required').isLength({ max: 150 }).withMessage('Name too long'),
  handleValidationErrors,
];

module.exports = { registerValidation, loginValidation, taskValidation, projectValidation };

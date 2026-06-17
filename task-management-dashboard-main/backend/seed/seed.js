/**
 * Seed script — populates MongoDB with sample users, projects, and tasks.
 * Run with: npm run seed
 */
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
require('dotenv').config();

const run = async () => {
  await connectDB();

  console.log('🧹 Clearing existing data...');
  await Promise.all([User.deleteMany({}), Project.deleteMany({}), Task.deleteMany({})]);

  console.log('👤 Creating sample users...');
  const passwordHash = await bcrypt.hash('password123', 10);
  const [alex, sarah] = await User.create([
    { name: 'Alex Johnson', email: 'alex@example.com', password: passwordHash },
    { name: 'Sarah Parker', email: 'sarah@example.com', password: passwordHash },
  ]);

  console.log('📁 Creating sample projects...');
  const [website, mobile, api, marketing] = await Project.create([
    { project_name: 'Website Redesign', description: 'Complete overhaul of the company website with modern design and improved UX', user_id: alex._id },
    { project_name: 'Mobile App MVP', description: 'Build the first version of the mobile application for iOS and Android', user_id: alex._id },
    { project_name: 'API Integration', description: 'Integrate third-party payment and notification services', user_id: alex._id },
    { project_name: 'Marketing Campaign', description: 'Q1 digital marketing campaign across all channels', user_id: sarah._id },
  ]);

  console.log('✅ Creating sample tasks...');
  await Task.create([
    { title: 'Design new landing page', description: 'Create wireframes and high-fidelity mockups for the new landing page', priority: 'High', status: 'In Progress', due_date: '2025-07-15', project_id: website._id, user_id: alex._id },
    { title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment', priority: 'High', status: 'Todo', due_date: '2025-07-10', project_id: mobile._id, user_id: alex._id },
    { title: 'Write API documentation', description: 'Document all REST API endpoints using Swagger/OpenAPI', priority: 'Medium', status: 'Todo', due_date: '2025-07-20', project_id: api._id, user_id: alex._id },
    { title: 'User authentication flow', description: 'Implement login, register, and password reset functionality', priority: 'High', status: 'Completed', due_date: '2025-06-30', project_id: mobile._id, user_id: alex._id },
    { title: 'Database schema design', description: 'Design and normalize the database schema for the application', priority: 'Medium', status: 'Completed', due_date: '2025-06-25', project_id: mobile._id, user_id: alex._id },
    { title: 'Fix navigation bug', description: 'Fix the dropdown menu not closing on mobile devices', priority: 'Low', status: 'Completed', due_date: '2025-07-05', project_id: website._id, user_id: alex._id },
    { title: 'Implement dark mode', description: 'Add dark/light theme toggle to the application', priority: 'Low', status: 'Todo', due_date: '2025-07-25', project_id: website._id, user_id: alex._id },
    { title: 'Payment gateway integration', description: 'Integrate Stripe payment processing', priority: 'High', status: 'In Progress', due_date: '2025-07-18', project_id: api._id, user_id: alex._id },
    { title: 'Performance optimization', description: 'Optimize database queries and add caching layer', priority: 'Medium', status: 'Todo', due_date: '2025-07-30', project_id: api._id, user_id: alex._id },
    { title: 'Write unit tests', description: 'Add unit tests for core business logic components', priority: 'Medium', status: 'In Progress', due_date: '2025-07-22', project_id: mobile._id, user_id: alex._id },
    { title: 'Plan social media calendar', description: 'Outline Q1 social posts across platforms', priority: 'Medium', status: 'Todo', due_date: '2025-07-12', project_id: marketing._id, user_id: sarah._id },
    { title: 'Design email newsletter template', description: 'Create a reusable HTML email template', priority: 'Low', status: 'In Progress', due_date: '2025-07-16', project_id: marketing._id, user_id: sarah._id },
  ]);

  console.log('🎉 Seed complete!');
  console.log('   Demo login: alex@example.com / password123');
  console.log('   Demo login: sarah@example.com / password123');
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

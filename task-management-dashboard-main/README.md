TASKFLOW – TASK MANAGEMENT DASHBOARD

TaskFlow is a full-stack task management web application inspired by tools such as Trello, Asana, and Jira.
It is built using the MERN stack and focuses on clean UI, smooth workflows, and useful productivity insights.

The application supports secure authentication, project and task management, a drag-and-drop Kanban board, dashboard analytics, and dark mode.

FEATURES

AUTHENTICATION
• User registration and login
• JWT-based authentication
• Secure password hashing using bcrypt
• Protected API routes

DASHBOARD
• Summary cards for total, pending, in-progress, and completed tasks
• Task status doughnut chart
• 7-day productivity line chart
• Recently updated tasks

TASK MANAGEMENT
• Create, update, and delete tasks
• Mark tasks as completed
• Filter by status and priority
• Search by title or description

KANBAN BOARD
• Drag and drop tasks between:
– Todo
– In Progress
– Completed

PROJECTS
• Create, edit, and delete projects
• Task count per project
• Automatic completion percentage calculation

USER PROFILE
• View account details
• Join date
• Personal task statistics

UI / UX
• Fully responsive layout
• Sticky sidebar navigation
• Dark mode toggle (persisted)
• Smooth transitions and clean card layout

TECH STACK

Frontend
• React
• React Router DOM
• Axios
• Tailwind CSS
• Chart.js (react-chartjs-2)
• Vite

Backend
• Node.js
• Express.js (MVC architecture)

Database
• MongoDB with Mongoose

Authentication
• JSON Web Tokens (JWT)
• bcryptjs

PROJECT STRUCTURE

task-management-dashboard/
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── services/
│ │ ├── context/
│ │ ├── App.jsx
│ │ └── main.jsx
│ └── package.json
├── backend/
│ ├── config/db.js
│ ├── models/
│ ├── controllers/
│ ├── routes/
│ ├── middleware/
│ ├── seed/seed.js
│ ├── server.js
│ └── package.json
├── README.md
└── DEPLOYMENT.md

LOCAL SETUP

PREREQUISITES
• Node.js 18+
• MongoDB 6+ (local or MongoDB Atlas)

BACKEND SETUP

cd backend
cp .env.example .env

Set the following in .env:
• MONGO_URI
• JWT_SECRET

npm install
npm run dev

Backend runs on: http://localhost:5000

SEED SAMPLE DATA (OPTIONAL)

npm run seed

Demo Login
Email: alex@example.com
Password: password123

FRONTEND SETUP

cd frontend
cp .env.example .env

Set:
VITE_API_URL=http://localhost:5000/api

npm install
npm run dev

Frontend runs on: http://localhost:5173

API OVERVIEW

All task and project routes require:
Authorization: Bearer <token>

AUTH ROUTES
POST /api/auth/register – Register user
POST /api/auth/login – Login user
GET /api/auth/profile – Get user profile

TASK ROUTES
GET /api/tasks
GET /api/tasks/stats
GET /api/tasks/:id
POST /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id

PROJECT ROUTES
GET /api/projects
POST /api/projects
PUT /api/projects/:id
DELETE /api/projects/:id

DESIGN

Primary Color: #4F46E5
Secondary Color: #6366F1
Success: #22C55E
Warning: #F59E0B
Danger: #EF4444
Font: Inter

DEPLOYMENT

See DEPLOYMENT.md for full deployment steps.

Frontend: Vercel
Backend: Render
Database: MongoDB Atlas

LICENSE

MIT License
Free to use for learning, portfolio projects, and internship submissions.
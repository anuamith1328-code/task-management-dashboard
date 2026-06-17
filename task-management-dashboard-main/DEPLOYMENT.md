# Deployment Guide

This guide walks through deploying TaskFlow with:
- **Frontend** → Vercel
- **Backend** → Render
- **Database** → Railway (or Aiven / PlanetScale / any managed MySQL)

---

## 1. Deploy the Database (MongoDB Atlas)

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a new **Cluster** (the free M0 tier works fine)
3. **Database Access** → add a database user with a username/password
4. **Network Access** → add `0.0.0.0/0` (allow access from anywhere) so Render can connect
5. **Connect** → choose "Drivers" → copy the connection string, it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/taskmanager?retryWrites=true&w=majority
   ```
6. (Optional) Seed sample data by running this connection string locally:
   ```bash
   cd backend
   # set MONGO_URI in .env to your Atlas connection string
   npm run seed
   ```

---

## 2. Deploy the Backend (Render)

1. Push your project to GitHub
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your repository, set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variables (from `backend/.env.example`):

   | Key | Value |
   |---|---|
   | `PORT` | `5000` (Render sets `$PORT` automatically, but keep for local) |
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | your Atlas connection string |
   | `JWT_SECRET` | a long random string |
   | `JWT_EXPIRES_IN` | `7d` |
   | `FRONTEND_URL` | your Vercel frontend URL (set after step 3) |

5. Deploy. Note your backend URL, e.g. `https://taskflow-api.onrender.com`
6. Test it: visit `https://taskflow-api.onrender.com/api/health` — should return `{ success: true, message: "TaskManager API is running" }`

---

## 3. Deploy the Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repository
2. Set:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add environment variable:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://taskflow-api.onrender.com/api` (your Render backend URL + `/api`) |

4. Deploy. Vercel gives you a URL like `https://taskflow.vercel.app`

---

## 4. Final Step: Update CORS

1. Go back to your Render backend's environment variables
2. Set `FRONTEND_URL` to your Vercel URL (e.g. `https://taskflow.vercel.app`)
3. Redeploy the backend so CORS allows requests from your live frontend

---

## ✅ Verification Checklist

- [ ] `https://<backend>/api/health` returns success
- [ ] Register a new account from the live frontend
- [ ] Login works and redirects to the dashboard
- [ ] Create a project, then a task assigned to it
- [ ] Drag tasks across the Kanban board
- [ ] Dashboard charts render with data
- [ ] Toggle dark mode and refresh — preference persists
- [ ] Resize browser to mobile width — layout adapts, sidebar collapses

---

## Troubleshooting

- **CORS errors:** double check `FRONTEND_URL` on the backend matches your frontend's exact deployed URL (no trailing slash).
- **Database connection errors:** verify your Atlas connection string credentials are correct and that Network Access allows connections from `0.0.0.0/0` (or Render's IPs).
- **401 errors after login:** ensure `JWT_SECRET` is set and consistent; clear `localStorage` and log in again after changing it.

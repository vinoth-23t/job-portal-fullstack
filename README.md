# Job Portal - Full Stack Application

A role-based Job Portal web application built with React.js, Flask, and SQLite. Deployed as a single Docker container on Render.

🔗 **Live Demo:** [https://job-portal-fullstack-1-2ms0.onrender.com](https://job-portal-fullstack-1-2ms0.onrender.com)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Container                       │
│                                                          │
│  ┌──────────────┐         ┌──────────────────────────┐  │
│  │   Nginx      │────────▶│  React Frontend (Static) │  │
│  │   Port 80    │         └──────────────────────────┘  │
│  │              │                                        │
│  │  /api routes │────────▶┌──────────────────────────┐  │
│  │  (proxy)     │         │  Flask Backend (Gunicorn) │  │
│  └──────────────┘         │  Port 5000                │  │
│                           │                            │  │
│                           │  ┌──────────────────────┐ │  │
│                           │  │  SQLite Database      │ │  │
│                           │  └──────────────────────┘ │  │
│                           └──────────────────────────┘  │
│                                                          │
│                           ┌──────────────────────────┐  │
│                           │  /uploads (Resumes)       │  │
│                           └──────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Remotive API    │
                    │  (External Jobs) │
                    └──────────────────┘
```

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 19, React Router, Axios, React Toastify |
| Backend   | Flask, Flask-CORS, SQLAlchemy, Gunicorn |
| Database  | SQLite                              |
| Server    | Nginx (reverse proxy)               |
| Deploy    | Docker, Render                      |
| External  | Remotive API (remote jobs)          |

---

## Default Users

| Role      | Email                  | Password      |
|-----------|------------------------|---------------|
| Admin     | admin@portal.com       | admin123      |
| Recruiter | recruiter@portal.com   | recruiter123  |
| Candidate | candidate@portal.com   | candidate123  |

---

## Features by Role

### Admin
- ✅ View/search all jobs with pagination & sorting
- ✅ Add jobs with expiry date
- ✅ Edit any job
- ✅ Delete any job
- ✅ View applicants for all jobs
- ✅ Download candidate resumes
- ✅ Update application status (Shortlisted/Rejected)
- ✅ View all users with role badges
- ✅ Delete users
- ✅ Dashboard with stats & charts
- ✅ Profile page (update name/password)
- ✅ Dark mode toggle

### Recruiter
- ✅ View/search all jobs with pagination & sorting
- ✅ Add jobs with expiry date
- ✅ Edit own jobs
- ✅ Delete own jobs only
- ✅ View applicants for own jobs only
- ✅ Download candidate resumes
- ✅ Update application status (Shortlisted/Rejected)
- ✅ Dashboard (shows only own jobs & stats)
- ✅ Profile page (update name/password)
- ✅ Dark mode toggle

### Candidate
- ✅ View/search all jobs with pagination & sorting
- ✅ Apply for portal jobs with resume upload
- ✅ Apply for external remote jobs (opens link)
- ✅ My Applications page (track status)
- ✅ Profile page (update name/password)
- ✅ Dark mode toggle

---

## User Flow Diagram

```
                        ┌─────────────┐
                        │   Register  │
                        └──────┬──────┘
                               │
                        ┌──────▼──────┐
                        │    Login    │
                        └──────┬──────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
      ┌───────▼──────┐ ┌──────▼──────┐ ┌───────▼───────┐
      │    Admin     │ │  Recruiter  │ │   Candidate   │
      └───────┬──────┘ └──────┬──────┘ └───────┬───────┘
              │                │                │
      ┌───────▼──────┐ ┌──────▼──────┐ ┌───────▼───────┐
      │  Dashboard   │ │  Dashboard  │ │   View Jobs   │
      │  - All Jobs  │ │  - Own Jobs │ │   - Search    │
      │  - All Users │ │  - Add Job  │ │   - Sort      │
      │  - Stats     │ │  - Edit Job │ │   - Filter    │
      │  - Charts    │ │  - Delete   │ └───────┬───────┘
      │  - Manage    │ │  - View     │         │
      └──────────────┘ │  Applicants │ ┌───────▼───────┐
                       └─────────────┘ │  Apply + Resume│
                                       └───────┬───────┘
                                               │
                                       ┌───────▼───────┐
                                       │My Applications│
                                       │ - Track Status│
                                       └───────────────┘
```

---

## API Endpoints

| Method | Endpoint                     | Description                    | Access          |
|--------|------------------------------|--------------------------------|-----------------|
| GET    | `/`                          | Health check                   | Public          |
| POST   | `/register`                  | Register user                  | Public          |
| POST   | `/login`                     | Login                          | Public          |
| PUT    | `/profile/:id`               | Update profile                 | Authenticated   |
| GET    | `/jobs`                      | List jobs (search/sort/page)   | Public          |
| GET    | `/job/:id`                   | Get single job                 | Public          |
| POST   | `/add-job`                   | Create job                     | Admin/Recruiter |
| PUT    | `/job/:id`                   | Update job                     | Admin/Recruiter |
| DELETE | `/job/:id`                   | Delete job                     | Admin/Own       |
| POST   | `/apply`                     | Apply with resume              | Candidate       |
| GET    | `/my-applications/:user_id`  | Candidate's applications       | Candidate       |
| GET    | `/job-applications/:job_id`  | Job's applicants               | Admin/Recruiter |
| PUT    | `/application/:id`           | Update application status      | Admin/Recruiter |
| GET    | `/resume/:filename`          | Download resume                | Admin/Recruiter |
| GET    | `/stats`                     | Dashboard statistics           | Admin/Recruiter |
| GET    | `/users`                     | List all users                 | Admin           |
| DELETE | `/user/:id`                  | Delete user                    | Admin           |
| GET    | `/external-jobs`             | Fetch remote jobs (Remotive)   | Public          |

---

## UI Features

- 🌙 Dark mode toggle (persists across sessions)
- 🔔 Toast notifications (success/error/warning)
- ⏳ Loading spinners
- 📊 Dashboard charts (application status breakdown)
- 📱 Responsive design (mobile-friendly)
- 🔍 Search + Sort + Pagination
- 📄 Resume upload modal
- 🏷️ Color-coded status & role badges

---

## Project Structure

```
job-portal-fullstack/
├── Dockerfile              # Single container deployment
├── .dockerignore
├── docker-compose.yml      # Local dev (optional)
├── render.yaml             # Render blueprint (optional)
├── backend/
│   ├── app.py              # Flask API
│   ├── requirements.txt
│   └── Procfile
├── frontend/
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── App.js
│       ├── components/
│       │   ├── Navbar.js
│       │   └── Navbar.css
│       └── pages/
│           ├── Home.js
│           ├── Login.js
│           ├── Register.js
│           ├── Jobs.js
│           ├── AddJob.js
│           ├── EditJob.js
│           ├── AdminDashboard.js
│           ├── MyApplications.js
│           └── Profile.js
└── database/
    └── job_portal.sql
```

---

## Run Locally

### With Docker (recommended)

```bash
docker build -t job-portal .
docker run -p 80:80 -p 5000:5000 job-portal
```

Open http://localhost (frontend) or http://localhost:5000 (API)

### Without Docker

**Backend:**
```bash
cd backend
pip install -r requirements.txt
export DATABASE_URL="sqlite:///job_portal.db"
python app.py
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

---

## Deploy on Render

1. Push to GitHub
2. Render → New → Web Service → Connect repo
3. Settings:
   - **Dockerfile Path:** `./Dockerfile`
   - **Docker Command:** *(leave empty)*
   - **Port:** `80`
4. No environment variables needed
5. Deploy

---

## Screenshots

| Page | Description |
|------|-------------|
| Home | Landing page with hero section |
| Jobs | Search, sort, pagination, apply modal |
| Dashboard | Stats, charts, job management |
| My Applications | Track application status |
| Dark Mode | Full dark theme support |

---

## License

MIT

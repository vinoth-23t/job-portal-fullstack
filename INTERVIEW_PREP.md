# Interview Preparation - Job Portal Project

## Tools & Technology Questions

### Q: What tools/technologies did you use and why?

| Tool | Why |
|------|-----|
| **React.js** | Component-based, fast rendering with virtual DOM, large ecosystem, easy routing with React Router |
| **Flask** | Lightweight Python framework, easy to set up REST APIs, good for small-medium apps |
| **SQLAlchemy** | ORM that lets us write Python instead of raw SQL, supports multiple databases (SQLite, PostgreSQL, MySQL) without code changes |
| **SQLite** | Zero-config database, no server needed, perfect for POC/demo. File-based storage |
| **Nginx** | High-performance reverse proxy, serves static React build, forwards API calls to Flask |
| **Gunicorn** | Production WSGI server for Flask (Flask's built-in server isn't production-ready) |
| **Docker** | Packages everything into one deployable unit, works the same locally and in production |
| **Axios** | Promise-based HTTP client, cleaner syntax than fetch, automatic JSON parsing |
| **React Toastify** | Non-blocking toast notifications, better UX than browser alerts |
| **React Router** | Client-side routing without page reloads, supports URL parameters |
| **Render** | Free hosting, Docker support, auto-deploy from GitHub |

### Q: Why Flask over Django/Express/Spring Boot?

- Flask is lightweight — no boilerplate, just what we need
- Quick to prototype APIs
- Python is readable and good for demos
- Django would be overkill for this size project (has admin panel, ORM, auth built-in but too heavy)
- Express would work too, but Flask + SQLAlchemy is more concise for CRUD

### Q: Why React over Angular/Vue?

- Largest community and job market
- Component-based architecture makes code reusable
- Virtual DOM for performance
- Hooks (useState, useEffect) simplify state management
- Easy to learn and demonstrate

---

## Database & Backend Connection

### Q: How does the backend connect to the database?

```python
# 1. Set database URL (environment variable)
DATABASE_URL = os.getenv("DATABASE_URL")
# Example: "sqlite:////app/job_portal.db"
# Example: "postgresql://user:pass@host/dbname"

# 2. Configure Flask app
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL

# 3. Create SQLAlchemy instance
db = SQLAlchemy(app)

# 4. Define models (tables)
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))

# 5. Create tables on startup
with app.app_context():
    db.create_all()
```

### Q: How does SQLAlchemy ORM work?

- Models = Python classes that map to database tables
- Each class attribute = a column
- `db.session` handles transactions (add, commit, rollback)
- Query example: `User.query.filter_by(email="test@test.com").first()`
- No raw SQL needed — ORM generates it

### Q: How would you switch from SQLite to PostgreSQL?

Just change the `DATABASE_URL` environment variable:
```
# SQLite
DATABASE_URL=sqlite:///job_portal.db

# PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/job_portal
```
No code changes needed — SQLAlchemy handles the difference.

### Q: What is `db.session` and why do we use `commit()` and `rollback()`?

- `db.session` = a transaction workspace
- `commit()` = save changes to database permanently
- `rollback()` = undo changes if an error occurs (prevents partial writes)

---

## Frontend-Backend Communication

### Q: How does the frontend talk to the backend?

```javascript
// Frontend uses Axios to make HTTP requests
const response = await axios.post(`${API}/login`, { email, password });

// Backend receives and responds
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    # ... process and return JSON
    return jsonify({"message": "Success", "user": {...}}), 200
```

### Q: What is CORS and why do you need it?

- **CORS** = Cross-Origin Resource Sharing
- Browser blocks requests from one domain to another by default
- Frontend (localhost:3000) calling Backend (localhost:5000) = different origins
- Flask-CORS allows specified origins to make requests
- In our Docker setup, nginx proxies everything through port 80, so CORS isn't an issue in production

### Q: How does the nginx proxy work?

```
Browser → nginx (port 80)
    ├── /login, /jobs, /apply → proxy to Flask (port 5000)
    └── /everything else → serve React static files
```
This means frontend and API share the same domain — no CORS problems.

---

## Authentication & Authorization

### Q: How does login work?

1. User submits email + password
2. Backend checks against database
3. If valid, returns user object (id, name, email, role)
4. Frontend stores user in `localStorage`
5. Navbar/pages read from `localStorage` to show role-specific content

### Q: How is role-based access controlled?

**Frontend (UI restriction):**
```javascript
// Hide buttons based on role
{user.role === "admin" && <button>Delete User</button>}
```

**Backend (data restriction):**
```python
# Recruiter can only delete own jobs
if user_role == "recruiter" and job.posted_by != user_id:
    return jsonify({"message": "Forbidden"}), 403
```

### Q: What's wrong with this auth approach?

- No token — anyone can call API directly with any user_id
- Password in plain text
- No session expiry
- Frontend-only role checks can be bypassed

### Q: How would you improve it?

- Use **JWT** (JSON Web Token) — token issued on login, sent with every request
- **bcrypt** for password hashing
- Token expiry (e.g., 24 hours)
- Backend middleware to verify token and role on every protected route

---

## Docker & Deployment

### Q: What does the Dockerfile do step by step?

```dockerfile
# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-build
COPY frontend/ → npm install → npm run build

# Stage 2: Setup Python backend + nginx
FROM python:3.11-slim
- Install nginx
- Install Python dependencies
- Copy backend code
- Copy React build to nginx html folder
- Configure nginx to proxy API routes to Flask
- Start nginx + gunicorn
```

### Q: What is multi-stage build and why use it?

- First stage builds React (needs Node.js)
- Second stage runs the app (only needs Python + nginx)
- Final image is smaller — doesn't include Node.js, node_modules
- Only the built static files are copied over

### Q: What is Gunicorn and why not use Flask's built-in server?

- Flask's server is single-threaded, meant for development only
- Gunicorn = production WSGI server, handles multiple concurrent requests
- Spawns worker processes for better performance
- Industry standard for deploying Flask/Django apps

### Q: How does Render deploy this?

1. Push code to GitHub
2. Render detects Dockerfile, builds the image
3. Runs the container, exposes port 80
4. Assigns a public URL
5. Auto-redeploys on new pushes to main

---

## File Upload

### Q: How does resume upload work?

**Frontend:**
```javascript
const formData = new FormData();
formData.append("user_id", user.id);
formData.append("job_id", jobId);
formData.append("resume", file); // File object
axios.post("/apply", formData, { headers: { "Content-Type": "multipart/form-data" } });
```

**Backend:**
```python
file = request.files["resume"]
filename = secure_filename(file.filename)  # Prevents path traversal
file.save(os.path.join(UPLOAD_FOLDER, filename))
```

### Q: What is `secure_filename`?

- Sanitizes filenames to prevent directory traversal attacks
- `../../etc/passwd` → `etc_passwd`
- Removes special characters, keeps only safe ones

---

## State Management

### Q: How do you manage state in React?

- `useState` for component-level state (form inputs, loading flags)
- `localStorage` for persistent data (user session, theme preference)
- No Redux — app is simple enough without it
- Data fetched via `useEffect` on component mount

### Q: Why localStorage and not cookies/Redux?

- localStorage is simple for a POC
- Persists across page refreshes
- No server-side session management needed
- Redux would be overkill for this app size

---

## Error Handling

### Q: How do you handle errors?

**Backend:**
```python
try:
    # ... operation
    db.session.commit()
    return jsonify({"message": "Success"}), 200
except Exception as e:
    db.session.rollback()  # Undo failed changes
    return jsonify({"message": str(e)}), 500
```

**Frontend:**
```javascript
try {
    const response = await axios.post(url, data);
    toast.success(response.data.message);
} catch (error) {
    toast.error(error.response?.data?.message || "Something went wrong");
}
```

---

## Performance & Scalability

### Q: How would you scale this app?

| Current | Production |
|---------|-----------|
| SQLite (single file) | PostgreSQL (concurrent connections) |
| Single container | Multiple containers behind load balancer |
| No caching | Redis for session/query caching |
| No CDN | CloudFront/Cloudflare for static assets |
| Single gunicorn worker | Multiple workers/threads |

### Q: What is pagination and why use it?

- Returns a subset of data per request (e.g., 9 jobs per page)
- Prevents loading 10,000 records at once
- Reduces response time and memory usage
- Backend: `OFFSET` + `LIMIT` in SQL query

---

## Testing

### Q: How would you test this?

- **Unit tests:** pytest for backend API endpoints
- **Integration tests:** Test database operations
- **Frontend tests:** React Testing Library for component behavior
- **E2E tests:** Cypress/Playwright for full user flows
- **Manual testing:** curl commands for API verification

---

## Common Follow-up Questions

### Q: What was the most challenging part?

"Configuring nginx to correctly proxy API routes while serving the React SPA. Also handling the git rebase conflicts during deployment."

### Q: What would you do differently if starting over?

- TypeScript for type safety on frontend
- JWT authentication from the start
- PostgreSQL instead of SQLite
- Add unit tests
- CI/CD pipeline with GitHub Actions
- Separate backend/frontend deployments

### Q: Can multiple users be logged in simultaneously?

Yes — each browser stores its own localStorage. The backend is stateless (no server sessions), so multiple users can make requests independently.

### Q: What happens if two candidates apply for the same job at the same time?

The database has a uniqueness check (`user_id` + `job_id`). SQLAlchemy checks for existing applications before inserting. Second request gets "Already Applied" response.

---

## Quick Demo Script

1. **Login as Admin** → Show dashboard, stats chart, user management
2. **Add a job** with expiry date → Show it appears in list
3. **Login as Candidate** → Search job, apply with resume upload
4. **Login as Recruiter** → View applicant, download resume, mark as Shortlisted
5. **Login as Candidate again** → Show status changed to "Shortlisted"
6. **Toggle dark mode** → Show persistence
7. **Show responsive** → Resize browser to mobile width


---

## React Specific Questions

### Q: What is the Virtual DOM?

- A lightweight copy of the real DOM kept in memory
- When state changes, React compares new virtual DOM with old one (diffing)
- Only updates the changed parts in the real DOM
- This makes React fast — avoids full page re-renders

### Q: What are React Hooks? Which ones did you use?

| Hook | Usage in this project |
|------|----------------------|
| `useState` | Form inputs, job list, loading state, modal visibility |
| `useEffect` | Fetch data on component mount, auto-redirect |
| `useNavigate` | Programmatic navigation after login/logout |
| `useParams` | Get job ID from URL in EditJob page |

### Q: What is useEffect and when does it run?

```javascript
useEffect(() => {
    fetchJobs();  // Runs after component renders
}, []);           // Empty array = run only once (on mount)

useEffect(() => {
    fetchJobs();
}, [page]);       // Runs when 'page' changes
```

### Q: What is conditional rendering?

Showing/hiding UI elements based on conditions:
```javascript
{user.role === "admin" && <button>Delete User</button>}
{loading ? <Spinner /> : <JobList />}
```

### Q: What is prop drilling and how to avoid it?

- Passing props through many levels of components
- Not a big issue in this app (only 2 levels deep)
- Solutions: Context API, Redux, or Zustand for larger apps

### Q: Difference between controlled and uncontrolled components?

- **Controlled:** Input value is managed by React state (`value={state}` + `onChange`)
- **Uncontrolled:** Input manages its own state (use `ref` to read value)
- This project uses controlled components for all forms

### Q: What is React Router and how does it work?

- Client-side routing — no page reload
- URL changes, React renders different components
- `<Route path="/jobs" element={<Jobs />} />`
- `useNavigate()` for programmatic navigation
- Nginx config `try_files $uri /index.html` ensures deep links work

---

## Python/Flask Specific Questions

### Q: What is a decorator in Python? How is `@app.route` a decorator?

- A decorator wraps a function with additional behavior
- `@app.route("/login")` registers the function as a URL handler
- When someone visits `/login`, Flask calls that function

### Q: What is WSGI?

- Web Server Gateway Interface — standard for Python web apps
- Defines how web server communicates with Python application
- Gunicorn is a WSGI server, Flask is a WSGI application
- Gunicorn receives HTTP request → passes to Flask → returns response

### Q: What is `__tablename__` in SQLAlchemy?

- Specifies the actual table name in the database
- Without it, SQLAlchemy generates one from the class name
- `__tablename__ = "users"` → creates/uses table named "users"

### Q: What is a Foreign Key and how did you use it?

```python
class Job(db.Model):
    posted_by = db.Column(db.Integer, db.ForeignKey("users.id"))

class Application(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    job_id = db.Column(db.Integer, db.ForeignKey("jobs.id"))
```
- Links records between tables
- `posted_by` connects a job to the user who created it
- Enables relational queries (who posted this job? who applied?)

### Q: What is the difference between `GET` and `POST`?

| GET | POST |
|-----|------|
| Retrieve data | Send/create data |
| Parameters in URL | Data in request body |
| Cacheable | Not cacheable |
| Idempotent (safe to repeat) | Not idempotent |
| Example: `/jobs?search=python` | Example: `/login` with email/password |

### Q: What are HTTP status codes you used?

| Code | Meaning | Used for |
|------|---------|----------|
| 200 | OK | Successful GET/PUT |
| 201 | Created | Successful POST (new resource) |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Invalid login credentials |
| 403 | Forbidden | Recruiter deleting another's job |
| 404 | Not Found | Job/User doesn't exist |
| 409 | Conflict | User already exists / Already applied |
| 500 | Server Error | Unexpected exception |

---

## Database Questions

### Q: What is an ORM?

- Object-Relational Mapping
- Maps database tables to Python classes
- Maps rows to objects, columns to attributes
- Write Python instead of SQL: `User.query.filter_by(email="x").first()`
- SQLAlchemy generates: `SELECT * FROM users WHERE email = 'x' LIMIT 1`

### Q: What is the difference between SQL and NoSQL?

| SQL (SQLite/PostgreSQL) | NoSQL (MongoDB) |
|------------------------|-----------------|
| Tables with rows/columns | Collections with documents |
| Fixed schema | Flexible schema |
| Relationships via foreign keys | Embedded/referenced documents |
| Good for structured data | Good for unstructured/changing data |
| Used in this project ✓ | Would work but overkill for this |

### Q: What is database migration?

- Changing database schema (add column, rename table) without losing data
- Tools: Alembic (for SQLAlchemy), Flask-Migrate
- Not used in this POC (db.create_all() creates fresh tables)
- In production: `flask db migrate` → `flask db upgrade`

### Q: What is an index and when would you add one?

- Speeds up searches on specific columns
- Like a book's index — find data without scanning every row
- Would add on: `User.email` (login lookups), `Job.title` (search)
- Tradeoff: faster reads, slightly slower writes

### Q: What is a JOIN? Where did you use it?

```python
# Get applications with job details
db.session.query(Application, Job).join(
    Job, Application.job_id == Job.id
).filter(Application.user_id == user_id).all()
```
- Combines data from two tables based on a relationship
- Used in: My Applications (application + job info), Job Applicants (application + user info)

---

## Security Questions

### Q: What is SQL Injection? Are you protected?

- Attacker inputs SQL code in form fields: `' OR 1=1 --`
- **Yes, protected** — SQLAlchemy ORM uses parameterized queries
- Never concatenates user input into SQL strings
- ORM does: `WHERE email = ?` (parameter binding)

### Q: What is XSS (Cross-Site Scripting)?

- Attacker injects JavaScript into your page via input fields
- React auto-escapes content rendered with `{}` — protected by default
- Only vulnerable if using `dangerouslySetInnerHTML` (we don't)

### Q: What is HTTPS and why is it important?

- Encrypts data between browser and server
- Without it, passwords travel as plain text
- Render provides HTTPS automatically for all deployed apps
- Prevents man-in-the-middle attacks

### Q: What is rate limiting?

- Restricting how many requests a user can make per time period
- Prevents brute-force login attacks, API abuse
- Implementation: Flask-Limiter (`@limiter.limit("5 per minute")`)
- Not implemented in this POC

---

## DevOps / Deployment Questions

### Q: What is a reverse proxy?

- Server that sits between client and backend
- Client → Nginx → Flask
- Benefits: load balancing, SSL termination, serve static files, hide backend details
- In our app: nginx serves React + proxies /api routes to Flask

### Q: What is the difference between `CMD` and `ENTRYPOINT` in Dockerfile?

| CMD | ENTRYPOINT |
|-----|-----------|
| Default command, can be overridden | Always runs, can't be easily overridden |
| We use: `CMD ["/start.sh"]` | Used when container has one specific purpose |

### Q: What is `.dockerignore`?

- Like `.gitignore` but for Docker builds
- Excludes files from being copied into the image
- Reduces image size, speeds up builds
- We exclude: `node_modules`, `.git`, `screenshots`

### Q: What is `docker-compose` vs `Dockerfile`?

| Dockerfile | docker-compose |
|-----------|---------------|
| Builds ONE image | Orchestrates MULTIPLE containers |
| Defines what's inside container | Defines how containers connect |
| `docker build` | `docker-compose up` |
| Used for Render deployment | Used for local development |

### Q: What are environment variables and why use them?

- Configuration values set outside the code
- `DATABASE_URL`, `REACT_APP_API_URL`
- Same code works in different environments (dev/staging/prod)
- Keeps secrets out of source code

---

## JavaScript Questions

### Q: What is async/await?

```javascript
// Without: callback hell or .then() chains
// With async/await: reads like synchronous code
const handleLogin = async () => {
    try {
        const response = await axios.post("/login", data);
        // response is available here
    } catch (error) {
        // handle error
    }
};
```

### Q: What is localStorage?

- Browser storage (key-value, strings only)
- Persists even after closing browser
- 5-10MB limit
- We store: user object (JSON stringified), theme preference
- `localStorage.setItem("user", JSON.stringify(user))`
- `JSON.parse(localStorage.getItem("user"))`

### Q: What is the spread operator (`...`)?

```javascript
// Copy + modify object
setJob({ ...job, [e.target.name]: e.target.value });
// Equivalent to: copy all job fields, then override the changed one
```

### Q: What is destructuring?

```javascript
const { id } = useParams();        // Extract 'id' from params object
const [jobs, setJobs] = useState([]); // Array destructuring from useState
```

### Q: What is `FormData` and when do you use it?

- JavaScript object for sending files + data together
- Required for `multipart/form-data` (file uploads)
- Used when candidate applies with resume:
```javascript
const formData = new FormData();
formData.append("resume", file);
formData.append("user_id", user.id);
```

---

## Scenario-Based Questions

### Q: User reports "login not working." How do you debug?

1. Check browser console for errors
2. Check Network tab — is the request reaching the backend?
3. Check response status code (401? 500? CORS error?)
4. Check backend logs (`docker logs container_name`)
5. Test API directly with curl
6. Check if database has the user record

### Q: The app is slow. How do you improve performance?

- Add database indexes on searched columns
- Implement caching (Redis) for repeated queries
- Lazy load external jobs (don't fetch on every page load)
- Compress images/assets
- Use CDN for static files
- Pagination (already implemented ✓)

### Q: A recruiter says they can see another recruiter's applicants. How do you fix?

- Check the `job-applications` endpoint
- Add filter: only return applications for jobs where `posted_by == requesting_user_id`
- Already fixed in frontend (filter by `posted_by`)
- Should also be enforced in backend for security

### Q: How would you add email notifications?

- Use a library like Flask-Mail or SendGrid API
- On application submit: send email to recruiter
- On status change: send email to candidate
- For POC: could simulate with toast "Email sent to recruiter"
- Production: use background task queue (Celery) to not block the API

### Q: How would you add real-time updates?

- WebSockets (Flask-SocketIO) for instant notifications
- Or polling: frontend checks for updates every 30 seconds
- Use case: recruiter sees new application appear without refreshing

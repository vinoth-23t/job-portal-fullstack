"""Job Portal Backend API.

A Flask REST API providing authentication, job management,
and external job listing integration for the Job Portal application.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import requests
import os

app = Flask(__name__)

# -----------------------------------
# CORS CONFIGURATION
# -----------------------------------

CORS(
    app,
    origins=[
        "https://job-portal-fullstack-zeta.vercel.app",
        "https://job-portal-frontend.onrender.com",
        "https://job-portal-fullstack-1-2ms0.onrender.com",
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ]
)

# -----------------------------------
# DATABASE CONFIGURATION
# -----------------------------------

DATABASE_URL = os.getenv("DATABASE_URL")

app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# -----------------------------------
# USER MODEL
# -----------------------------------

class User(db.Model):
    """User model representing registered portal users."""
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50), nullable=False)

# -----------------------------------
# JOB MODEL
# -----------------------------------

class Job(db.Model):
    """Job model representing job listings posted by recruiters."""
    __tablename__ = "jobs"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    company = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    salary = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    posted_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

# -----------------------------------
# APPLICATION MODEL
# -----------------------------------

class Application(db.Model):
    """Application model representing job applications by candidates."""
    __tablename__ = "applications"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey("jobs.id"), nullable=False)
    status = db.Column(db.String(50), default="Applied")

# -----------------------------------
# HOME ROUTE
# -----------------------------------

@app.route("/", methods=["GET"])
def home():
    """Health check endpoint."""
    return jsonify({"message": "Job Portal Backend Running"}), 200

# -----------------------------------
# EXTERNAL JOBS API
# -----------------------------------

@app.route("/external-jobs", methods=["GET"])
def external_jobs():
    """Fetch remote job listings from the Remotive API."""
    try:
        response = requests.get("https://remotive.com/api/remote-jobs")
        data = response.json()
        return jsonify(data.get("jobs", [])), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# -----------------------------------
# REGISTER API
# -----------------------------------

@app.route("/register", methods=["POST"])
def register():
    """Register a new user."""
    try:
        data = request.get_json()
        for field in ["name", "email", "password", "role"]:
            if field not in data:
                return jsonify({"message": f"{field} is required"}), 400

        if User.query.filter_by(email=data["email"]).first():
            return jsonify({"message": "User Already Exists"}), 409

        new_user = User(name=data["name"], email=data["email"],
                        password=data["password"], role=data["role"])
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User Registered Successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

# -----------------------------------
# LOGIN API
# -----------------------------------

@app.route("/login", methods=["POST"])
def login():
    """Authenticate a user by email and password."""
    try:
        data = request.get_json()
        if "email" not in data or "password" not in data:
            return jsonify({"message": "Email and Password Required"}), 400

        user = User.query.filter_by(email=data["email"], password=data["password"]).first()
        if not user:
            return jsonify({"message": "Invalid Email or Password"}), 401

        return jsonify({
            "message": "Login Successful",
            "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# -----------------------------------
# UPDATE PROFILE API
# -----------------------------------

@app.route("/profile/<int:id>", methods=["PUT"])
def update_profile(id):
    """Update user profile."""
    try:
        data = request.get_json()
        user = User.query.get(id)
        if not user:
            return jsonify({"message": "User Not Found"}), 404

        if "name" in data:
            user.name = data["name"]
        if "password" in data and data["password"]:
            user.password = data["password"]

        db.session.commit()
        return jsonify({
            "message": "Profile Updated Successfully",
            "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

# -----------------------------------
# ADD JOB API
# -----------------------------------

@app.route("/add-job", methods=["POST"])
def add_job():
    """Create a new job listing."""
    try:
        data = request.get_json()
        new_job = Job(
            title=data["title"], company=data["company"],
            location=data["location"], salary=data["salary"],
            description=data["description"],
            posted_by=data.get("posted_by")
        )
        db.session.add(new_job)
        db.session.commit()
        return jsonify({"message": "Job Added Successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

# -----------------------------------
# GET JOBS API
# -----------------------------------

@app.route("/jobs", methods=["GET"])
def get_jobs():
    """Retrieve job listings with optional search and pagination."""
    try:
        query = request.args.get("search", "").strip()
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)

        jobs = Job.query
        if query:
            jobs = jobs.filter(
                db.or_(
                    Job.title.ilike(f"%{query}%"),
                    Job.company.ilike(f"%{query}%"),
                    Job.location.ilike(f"%{query}%")
                )
            )
        total = jobs.count()
        jobs = jobs.order_by(Job.id.desc()).offset((page - 1) * per_page).limit(per_page).all()

        return jsonify({
            "jobs": [{"id": j.id, "title": j.title, "company": j.company,
                      "location": j.location, "salary": j.salary,
                      "description": j.description, "posted_by": j.posted_by} for j in jobs],
            "total": total,
            "page": page,
            "pages": (total + per_page - 1) // per_page
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# -----------------------------------
# GET SINGLE JOB API
# -----------------------------------

@app.route("/job/<int:id>", methods=["GET"])
def get_job(id):
    """Get a single job by ID."""
    try:
        job = Job.query.get(id)
        if not job:
            return jsonify({"message": "Job Not Found"}), 404
        return jsonify({
            "id": job.id, "title": job.title, "company": job.company,
            "location": job.location, "salary": job.salary,
            "description": job.description, "posted_by": job.posted_by
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# -----------------------------------
# UPDATE JOB API
# -----------------------------------

@app.route("/job/<int:id>", methods=["PUT"])
def update_job(id):
    """Update an existing job listing by ID."""
    try:
        data = request.get_json()
        job = Job.query.get(id)
        if not job:
            return jsonify({"message": "Job Not Found"}), 404

        job.title = data["title"]
        job.company = data["company"]
        job.location = data["location"]
        job.salary = data["salary"]
        job.description = data["description"]
        db.session.commit()
        return jsonify({"message": "Job Updated Successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

# -----------------------------------
# DELETE JOB API
# -----------------------------------

@app.route("/job/<int:id>", methods=["DELETE"])
def delete_job(id):
    """Delete a job listing by ID. Recruiters can only delete their own jobs."""
    try:
        data = request.get_json() or {}
        job = Job.query.get(id)
        if not job:
            return jsonify({"message": "Job Not Found"}), 404

        user_role = data.get("role")
        user_id = data.get("user_id")

        if user_role == "recruiter" and job.posted_by != user_id:
            return jsonify({"message": "You can only delete your own jobs"}), 403

        Application.query.filter_by(job_id=id).delete()
        db.session.delete(job)
        db.session.commit()
        return jsonify({"message": "Job Deleted Successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

# -----------------------------------
# APPLY FOR JOB API
# -----------------------------------

@app.route("/apply", methods=["POST"])
def apply_job():
    """Apply for a job."""
    try:
        data = request.get_json()
        existing = Application.query.filter_by(
            user_id=data["user_id"], job_id=data["job_id"]).first()
        if existing:
            return jsonify({"message": "Already Applied"}), 409

        app_entry = Application(user_id=data["user_id"], job_id=data["job_id"])
        db.session.add(app_entry)
        db.session.commit()
        return jsonify({"message": "Application Submitted Successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

# -----------------------------------
# GET MY APPLICATIONS API (Candidate)
# -----------------------------------

@app.route("/my-applications/<int:user_id>", methods=["GET"])
def my_applications(user_id):
    """Get all applications for a candidate."""
    try:
        apps = db.session.query(Application, Job).join(
            Job, Application.job_id == Job.id
        ).filter(Application.user_id == user_id).all()

        return jsonify([{
            "id": a.id, "status": a.status,
            "job": {"id": j.id, "title": j.title, "company": j.company, "location": j.location}
        } for a, j in apps]), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# -----------------------------------
# GET JOB APPLICATIONS API (Recruiter/Admin)
# -----------------------------------

@app.route("/job-applications/<int:job_id>", methods=["GET"])
def job_applications(job_id):
    """Get all applications for a specific job."""
    try:
        apps = db.session.query(Application, User).join(
            User, Application.user_id == User.id
        ).filter(Application.job_id == job_id).all()

        return jsonify([{
            "id": a.id, "status": a.status,
            "applicant": {"id": u.id, "name": u.name, "email": u.email}
        } for a, u in apps]), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# -----------------------------------
# UPDATE APPLICATION STATUS API
# -----------------------------------

@app.route("/application/<int:id>", methods=["PUT"])
def update_application_status(id):
    """Update application status (Shortlisted/Rejected)."""
    try:
        data = request.get_json()
        app_entry = Application.query.get(id)
        if not app_entry:
            return jsonify({"message": "Application Not Found"}), 404
        app_entry.status = data["status"]
        db.session.commit()
        return jsonify({"message": "Status Updated Successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

# -----------------------------------
# GET ALL USERS API (Admin Only)
# -----------------------------------

@app.route("/users", methods=["GET"])
def get_users():
    """Retrieve all users. Admin only."""
    try:
        users = User.query.all()
        return jsonify([{
            "id": u.id, "name": u.name, "email": u.email, "role": u.role
        } for u in users]), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# -----------------------------------
# DELETE USER API (Admin Only)
# -----------------------------------

@app.route("/user/<int:id>", methods=["DELETE"])
def delete_user(id):
    """Delete a user by ID. Admin only."""
    try:
        user = User.query.get(id)
        if not user:
            return jsonify({"message": "User Not Found"}), 404
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User Deleted Successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

# -----------------------------------
# CREATE DATABASE TABLES
# -----------------------------------

with app.app_context():
    db.create_all()
    if not User.query.first():
        db.session.add_all([
            User(name="Admin", email="admin@portal.com", password="admin123", role="admin"),
            User(name="Recruiter", email="recruiter@portal.com", password="recruiter123", role="recruiter"),
            User(name="Candidate", email="candidate@portal.com", password="candidate123", role="candidate"),
        ])
        db.session.commit()

# -----------------------------------
# RUN APP
# -----------------------------------

if __name__ == "__main__":
    PORT = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=PORT)

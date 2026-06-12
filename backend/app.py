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

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(100),
        unique=True,
        nullable=False
    )

    password = db.Column(
        db.String(100),
        nullable=False
    )

    role = db.Column(
        db.String(50),
        nullable=False
    )

# -----------------------------------
# JOB MODEL
# -----------------------------------

class Job(db.Model):
    """Job model representing job listings posted by recruiters."""

    __tablename__ = "jobs"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    title = db.Column(
        db.String(200),
        nullable=False
    )

    company = db.Column(
        db.String(200),
        nullable=False
    )

    location = db.Column(
        db.String(200),
        nullable=False
    )

    salary = db.Column(
        db.String(100),
        nullable=False
    )

    description = db.Column(
        db.Text,
        nullable=False
    )

# -----------------------------------
# HOME ROUTE
# -----------------------------------

@app.route("/", methods=["GET"])
def home():
    """Health check endpoint. Returns API running status."""

    return jsonify({
        "message": "Job Portal Backend Running"
    }), 200

# -----------------------------------
# EXTERNAL JOBS API
# -----------------------------------

@app.route(
    "/external-jobs",
    methods=["GET"]
)
def external_jobs():
    """Fetch remote job listings from the Remotive API."""

    try:

        url = (
            "https://remotive.com/api/"
            "remote-jobs"
        )

        response = requests.get(url)

        data = response.json()

        return jsonify(
            data.get("jobs", [])
        ), 200

    except Exception as e:

        return jsonify({
            "message": str(e)
        }), 500

# -----------------------------------
# REGISTER API
# -----------------------------------

@app.route(
    "/register",
    methods=["POST"]
)
def register():
    """Register a new user with name, email, password, and role."""

    try:

        data = request.get_json()

        # Validation

        required_fields = [
            "name",
            "email",
            "password",
            "role"
        ]

        for field in required_fields:

            if field not in data:

                return jsonify({
                    "message":
                    f"{field} is required"
                }), 400

        # Check Existing User

        existing_user = (
            User.query.filter_by(
                email=data["email"]
            ).first()
        )

        if existing_user:

            return jsonify({
                "message":
                "User Already Exists"
            }), 409

        # Create User

        new_user = User(
            name=data["name"],
            email=data["email"],
            password=data["password"],
            role=data["role"]
        )

        db.session.add(new_user)

        db.session.commit()

        return jsonify({
            "message":
            "User Registered Successfully"
        }), 201

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "message": str(e)
        }), 500

# -----------------------------------
# LOGIN API
# -----------------------------------

@app.route(
    "/login",
    methods=["POST"]
)
def login():
    """Authenticate a user by email and password."""

    try:

        data = request.get_json()

        if (
            "email" not in data or
            "password" not in data
        ):

            return jsonify({
                "message":
                "Email and Password Required"
            }), 400

        user = User.query.filter_by(
            email=data["email"],
            password=data["password"]
        ).first()

        if not user:

            return jsonify({
                "message":
                "Invalid Email or Password"
            }), 401

        return jsonify({

            "message":
            "Login Successful",

            "user": {

                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }

        }), 200

    except Exception as e:

        return jsonify({
            "message": str(e)
        }), 500

# -----------------------------------
# ADD JOB API
# -----------------------------------

@app.route(
    "/add-job",
    methods=["POST"]
)
def add_job():
    """Create a new job listing."""

    try:

        data = request.get_json()

        new_job = Job(

            title=data["title"],
            company=data["company"],
            location=data["location"],
            salary=data["salary"],
            description=data["description"]
        )

        db.session.add(new_job)

        db.session.commit()

        return jsonify({
            "message":
            "Job Added Successfully"
        }), 201

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "message": str(e)
        }), 500

# -----------------------------------
# GET JOBS API
# -----------------------------------

@app.route(
    "/jobs",
    methods=["GET"]
)
def get_jobs():
    """Retrieve all job listings."""

    try:

        jobs = Job.query.all()

        jobs_list = []

        for job in jobs:

            jobs_list.append({

                "id": job.id,
                "title": job.title,
                "company": job.company,
                "location": job.location,
                "salary": job.salary,
                "description": job.description
            })

        return jsonify(jobs_list), 200

    except Exception as e:

        return jsonify({
            "message": str(e)
        }), 500

# -----------------------------------
# UPDATE JOB API
# -----------------------------------

@app.route(
    "/job/<int:id>",
    methods=["PUT"]
)
def update_job(id):
    """Update an existing job listing by ID."""

    try:

        data = request.get_json()

        job = Job.query.get(id)

        if not job:

            return jsonify({
                "message":
                "Job Not Found"
            }), 404

        job.title = data["title"]
        job.company = data["company"]
        job.location = data["location"]
        job.salary = data["salary"]
        job.description = data["description"]

        db.session.commit()

        return jsonify({
            "message":
            "Job Updated Successfully"
        }), 200

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "message": str(e)
        }), 500

# -----------------------------------
# DELETE JOB API
# -----------------------------------

@app.route(
    "/job/<int:id>",
    methods=["DELETE"]
)
def delete_job(id):
    """Delete a job listing by ID."""

    try:

        job = Job.query.get(id)

        if not job:

            return jsonify({
                "message":
                "Job Not Found"
            }), 404

        db.session.delete(job)

        db.session.commit()

        return jsonify({
            "message":
            "Job Deleted Successfully"
        }), 200

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "message": str(e)
        }), 500

# -----------------------------------
# GET ALL USERS API (Admin Only)
# -----------------------------------

@app.route("/users", methods=["GET"])
def get_users():
    """Retrieve all users. Admin only."""
    try:
        users = User.query.all()
        return jsonify([{
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role
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

    PORT = int(
        os.environ.get("PORT", 5000)
    )

    app.run(
        host="0.0.0.0",
        port=PORT
    )

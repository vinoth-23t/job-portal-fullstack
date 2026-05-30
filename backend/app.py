from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import requests
import os

app = Flask(__name__)

CORS(app)

# -----------------------------
# DATABASE CONFIGURATION
# -----------------------------

DATABASE_URL = os.getenv("DATABASE_URL")

app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# -----------------------------
# USER MODEL
# -----------------------------

class User(db.Model):

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

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

# -----------------------------
# JOB MODEL
# -----------------------------

class Job(db.Model):

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

# -----------------------------
# HOME ROUTE
# -----------------------------

@app.route('/')
def home():

    return jsonify({
        "message": "Job Portal Backend Running"
    })

# -----------------------------
# EXTERNAL JOBS API
# -----------------------------

@app.route('/external-jobs', methods=['GET'])
def external_jobs():

    try:

        url = "https://remotive.com/api/remote-jobs"

        response = requests.get(url)

        data = response.json()

        return jsonify(data['jobs'])

    except Exception as e:

        return jsonify({
            "message": str(e)
        })

# -----------------------------
# REGISTER API
# -----------------------------

@app.route('/register', methods=['POST'])
def register():

    try:

        data = request.json

        existing_user = User.query.filter_by(
            email=data['email']
        ).first()

        if existing_user:

            return jsonify({
                "message": "User Already Exists"
            })

        new_user = User(
            name=data['name'],
            email=data['email'],
            password=data['password'],
            role=data['role']
        )

        db.session.add(new_user)

        db.session.commit()

        return jsonify({
            "message":
            "User Registered Successfully"
        })

    except Exception as e:

        return jsonify({
            "message": str(e)
        })

# -----------------------------
# LOGIN API
# -----------------------------

@app.route('/login', methods=['POST'])
def login():

    try:

        data = request.json

        user = User.query.filter_by(
            email=data['email'],
            password=data['password']
        ).first()

        if user:

            return jsonify({

                "message":
                "Login Successful",

                "id": user.id,

                "name": user.name,

                "email": user.email,

                "role": user.role
            })

        else:

            return jsonify({
                "message":
                "Invalid Email or Password"
            })

    except Exception as e:

        return jsonify({
            "message": str(e)
        })

# -----------------------------
# ADD JOB API
# -----------------------------

@app.route('/add-job', methods=['POST'])
def add_job():

    try:

        data = request.json

        new_job = Job(

            title=data['title'],
            company=data['company'],
            location=data['location'],
            salary=data['salary'],
            description=data['description']
        )

        db.session.add(new_job)

        db.session.commit()

        return jsonify({
            "message":
            "Job Added Successfully"
        })

    except Exception as e:

        return jsonify({
            "message": str(e)
        })

# -----------------------------
# GET JOBS API
# -----------------------------

@app.route('/jobs', methods=['GET'])
def get_jobs():

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

        return jsonify(jobs_list)

    except Exception as e:

        return jsonify({
            "message": str(e)
        })

# -----------------------------
# UPDATE JOB API
# -----------------------------

@app.route('/job/<int:id>', methods=['PUT'])
def update_job(id):

    try:

        data = request.json

        job = Job.query.get(id)

        if not job:

            return jsonify({
                "message":
                "Job Not Found"
            })

        job.title = data['title']
        job.company = data['company']
        job.location = data['location']
        job.salary = data['salary']
        job.description = data['description']

        db.session.commit()

        return jsonify({
            "message":
            "Job Updated Successfully"
        })

    except Exception as e:

        return jsonify({
            "message": str(e)
        })

# -----------------------------
# DELETE JOB API
# -----------------------------

@app.route('/job/<int:id>', methods=['DELETE'])
def delete_job(id):

    try:

        job = Job.query.get(id)

        if not job:

            return jsonify({
                "message":
                "Job Not Found"
            })

        db.session.delete(job)

        db.session.commit()

        return jsonify({
            "message":
            "Job Deleted Successfully"
        })

    except Exception as e:

        return jsonify({
            "message": str(e)
        })

# -----------------------------
# CREATE DATABASE TABLES
# -----------------------------

with app.app_context():
    db.create_all()

# -----------------------------
# RUN APP
# -----------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
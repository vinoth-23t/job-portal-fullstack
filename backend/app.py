from flask import Flask, request, jsonify
from flask_cors import CORS
<<<<<<< HEAD
import psycopg2
=======
from flask_sqlalchemy import SQLAlchemy
>>>>>>> mysql-local
import requests
import os

app = Flask(__name__)
CORS(app)

<<<<<<< HEAD
# PostgreSQL Connection
db = psycopg2.connect(
    host="dpg-d86ojd9kh4rs73eu1o0g-a.ohio-postgres.render.com",
    database="jobportal_1z0h",
    user="jobportal_user",
    password="TWpyrWdQLPvo3xwmRjj3Dkm68ZRBsOYL",
    port="5432"
)

cursor = db.cursor()

# CREATE TABLES AUTOMATICALLY

cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(100),
    role VARCHAR(20)
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    company VARCHAR(200),
    location VARCHAR(200),
    salary VARCHAR(100),
    description TEXT
)
""")

db.commit()

=======
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
>>>>>>> mysql-local
# HOME ROUTE

@app.route('/')
def home():

    return jsonify({
        "message": "Job Portal Backend Running"
    })

# EXTERNAL JOBS API

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

# REGISTER API

@app.route('/register', methods=['POST'])
def register():

    try:

        data = request.json

        name = data['name']
        email = data['email']
        password = data['password']
        role = data['role']

<<<<<<< HEAD
        query = """
        INSERT INTO users
        (name, email, password, role)
        VALUES (%s, %s, %s, %s)
        """

        values = (
            name,
            email,
            password,
            role
=======
        existing_user = User.query.filter_by(
            email=email
        ).first()

        if existing_user:

            return jsonify({
                "message": "User Already Exists"
            })

        new_user = User(
            name=name,
            email=email,
            password=password,
            role=role
>>>>>>> mysql-local
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

# LOGIN API

@app.route('/login', methods=['POST'])
def login():

    try:

        data = request.json

        email = data['email']
        password = data['password']

<<<<<<< HEAD
        query = """
        SELECT * FROM users
        WHERE email=%s AND password=%s
        """

        values = (
            email,
            password
        )

        cursor.execute(query, values)

        user = cursor.fetchone()
=======
        user = User.query.filter_by(
            email=email,
            password=password
        ).first()
>>>>>>> mysql-local

        if user:

            return jsonify({
<<<<<<< HEAD
                "message": "Login Successful",
                "id": user[0],
                "name": user[1],
                "email": user[2],
                "role": user[4]
=======

                "message":
                "Login Successful",

                "id": user.id,

                "name": user.name,

                "email": user.email,

                "role": user.role
>>>>>>> mysql-local
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

# ADD JOB API

@app.route('/add-job', methods=['POST'])
def add_job():

    try:

        data = request.json

        new_job = Job(

<<<<<<< HEAD
        query = """
        INSERT INTO jobs
        (title, company, location, salary, description)
        VALUES (%s, %s, %s, %s, %s)
        """
=======
            title=data['title'],
            company=data['company'],
            location=data['location'],
            salary=data['salary'],
            description=data['description']
        )

        db.session.add(new_job)
>>>>>>> mysql-local

        db.session.commit()

        return jsonify({
            "message":
            "Job Added Successfully"
        })

    except Exception as e:

        return jsonify({
            "message": str(e)
        })

# GET JOBS API

@app.route('/jobs', methods=['GET'])
def get_jobs():

    try:

<<<<<<< HEAD
        query = "SELECT * FROM jobs"
=======
        jobs = Job.query.all()

        jobs_list = []
>>>>>>> mysql-local

        for job in jobs:

            jobs_list.append({

<<<<<<< HEAD
        jobs_list = []

        for job in jobs:

            jobs_list.append({
                "id": job[0],
                "title": job[1],
                "company": job[2],
                "location": job[3],
                "salary": job[4],
                "description": job[5]
=======
                "id": job.id,
                "title": job.title,
                "company": job.company,
                "location": job.location,
                "salary": job.salary,
                "description": job.description
>>>>>>> mysql-local
            })

        return jsonify(jobs_list)

    except Exception as e:

        return jsonify({
            "message": str(e)
        })

# UPDATE JOB API

@app.route('/job/<int:id>', methods=['PUT'])
def update_job(id):

    try:

        data = request.json

        job = Job.query.get(id)

<<<<<<< HEAD
        query = """
        UPDATE jobs
        SET
            title=%s,
            company=%s,
            location=%s,
            salary=%s,
            description=%s
        WHERE id=%s
        """

        values = (
            title,
            company,
            location,
            salary,
            description,
            id
        )

        cursor.execute(query, values)

        db.commit()
=======
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
>>>>>>> mysql-local

        return jsonify({
            "message":
            "Job Updated Successfully"
        })

    except Exception as e:

        return jsonify({
            "message": str(e)
        })

# DELETE JOB API
<<<<<<< HEAD
=======
# -----------------------------
>>>>>>> mysql-local

@app.route('/job/<int:id>', methods=['DELETE'])
def delete_job(id):

    try:

<<<<<<< HEAD
        query = "DELETE FROM jobs WHERE id=%s"
=======
        job = Job.query.get(id)

        if not job:
>>>>>>> mysql-local

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

<<<<<<< HEAD
if __name__ == '__main__':
=======
# -----------------------------
# CREATE DATABASE TABLES
# -----------------------------

with app.app_context():
    db.create_all()

# -----------------------------
# RUN APP
# -----------------------------
>>>>>>> mysql-local

    app.run(debug=True)
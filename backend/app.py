from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import requests

app = Flask(__name__)
CORS(app)

# PostgreSQL Connection
db = psycopg2.connect(
    host="dpg-d86ojd9kh4rs73eu1o0g-a",
    database="jobportal",
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
        )

        cursor.execute(query, values)

        db.commit()

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

        if user:

            return jsonify({
                "message": "Login Successful",
                "id": user[0],
                "name": user[1],
                "email": user[2],
                "role": user[4]
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

        title = data['title']
        company = data['company']
        location = data['location']
        salary = data['salary']
        description = data['description']

        query = """
        INSERT INTO jobs
        (title, company, location, salary, description)
        VALUES (%s, %s, %s, %s, %s)
        """

        values = (
            title,
            company,
            location,
            salary,
            description
        )

        cursor.execute(query, values)

        db.commit()

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

        query = "SELECT * FROM jobs"

        cursor.execute(query)

        jobs = cursor.fetchall()

        jobs_list = []

        for job in jobs:

            jobs_list.append({
                "id": job[0],
                "title": job[1],
                "company": job[2],
                "location": job[3],
                "salary": job[4],
                "description": job[5]
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

        title = data['title']
        company = data['company']
        location = data['location']
        salary = data['salary']
        description = data['description']

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

        return jsonify({
            "message":
            "Job Updated Successfully"
        })

    except Exception as e:

        return jsonify({
            "message": str(e)
        })

# DELETE JOB API

@app.route('/job/<int:id>', methods=['DELETE'])
def delete_job(id):

    try:

        query = "DELETE FROM jobs WHERE id=%s"

        cursor.execute(query, (id,))

        db.commit()

        return jsonify({
            "message":
            "Job Deleted Successfully"
        })

    except Exception as e:

        return jsonify({
            "message": str(e)
        })

if __name__ == '__main__':

    app.run(debug=True)
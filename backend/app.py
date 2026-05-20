from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import requests

app = Flask(__name__)

CORS(app)

# MySQL Connection

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="1234",
    database="job_portal"
)

# -----------------------------
# HOME ROUTE
# -----------------------------

@app.route('/')
def home():

    return jsonify({
        "message":
        "Job Portal Backend Running"
    })

# -----------------------------
# EXTERNAL JOBS API
# -----------------------------

@app.route('/external-jobs', methods=['GET'])
def external_jobs():

    try:

        url = (
            "https://remotive.com/"
            "api/remote-jobs"
        )

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

        name = data['name']
        email = data['email']
        password = data['password']
        role = data['role']

        cursor = db.cursor()

        # Check Existing User

        check_query = '''
        SELECT * FROM users
        WHERE email = %s
        '''

        cursor.execute(check_query, (email,))

        existing_user = cursor.fetchone()

        if existing_user:

            return jsonify({
                "message":
                "User Already Exists"
            })

        query = '''
        INSERT INTO users
        (name, email, password, role)

        VALUES (%s, %s, %s, %s)
        '''

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

# -----------------------------
# LOGIN API
# -----------------------------

@app.route('/login', methods=['POST'])
def login():

    try:

        data = request.json

        email = data['email']
        password = data['password']

        cursor = db.cursor()

        query = '''
        SELECT * FROM users
        WHERE email = %s
        AND password = %s
        '''

        values = (
            email,
            password
        )

        cursor.execute(query, values)

        user = cursor.fetchone()

        if user:

            return jsonify({

                "message":
                "Login Successful",

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

# -----------------------------
# ADD JOB API
# -----------------------------

@app.route('/add-job', methods=['POST'])
def add_job():

    try:

        data = request.json

        title = data['title']
        company = data['company']
        location = data['location']
        salary = data['salary']
        description = data['description']

        cursor = db.cursor()

        query = '''
        INSERT INTO jobs
        (
            title,
            company,
            location,
            salary,
            description
        )

        VALUES (%s, %s, %s, %s, %s)
        '''

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

# -----------------------------
# GET JOBS API
# -----------------------------

@app.route('/jobs', methods=['GET'])
def get_jobs():

    try:

        cursor = db.cursor(dictionary=True)

        query = '''
        SELECT * FROM jobs
        '''

        cursor.execute(query)

        jobs = cursor.fetchall()

        return jsonify(jobs)

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

        title = data['title']
        company = data['company']
        location = data['location']
        salary = data['salary']
        description = data['description']

        cursor = db.cursor()

        query = '''
        UPDATE jobs

        SET
            title = %s,
            company = %s,
            location = %s,
            salary = %s,
            description = %s

        WHERE id = %s
        '''

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

# -----------------------------
# DELETE JOB API
# -----------------------------

@app.route('/job/<int:id>',
methods=['DELETE'])

def delete_job(id):

    try:

        cursor = db.cursor()

        query = '''
        DELETE FROM jobs
        WHERE id = %s
        '''

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

# -----------------------------
# RUN APP
# -----------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
import { useState } from "react";

import axios from "axios";

import {
  Link,
  useNavigate
} from "react-router-dom";

import "./Register.css";

import Navbar from "../components/Navbar";

function Register() {

  const navigate = useNavigate();

  const [user, setUser] = useState({

    name: "",
    email: "",
    password: "",
    role: ""
  });

  const handleChange = (e) => {

    setUser({

      ...user,

      [e.target.name]:
      e.target.value
    });
  };

  const handleRegister = async (e) => {

    e.preventDefault();

    try {

      const response = await axios.post(

        "http://127.0.0.1:5000/register",

        user
      );

      alert(response.data.message);

      navigate("/login");

    } catch (error) {

      console.log(error);

      alert("Registration Failed");
    }
  };

  return (

    <>
      <Navbar />

      <div className="register-container">

        {/* LEFT SECTION */}

        <div className="register-left">

          <h1>
            Create Account
          </h1>

          <p>
            Join JobPortal and explore
            unlimited career opportunities.
          </p>

          <ul>

            <li>
              Find your dream job
            </li>

            <li>
              Apply easily
            </li>

            <li>
              Connect with companies
            </li>

          </ul>

        </div>

        {/* RIGHT SECTION */}

        <div className="register-right">

          <div className="register-box">

            <h2>Create Account</h2>

            <form onSubmit={handleRegister}>

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={user.name}
                onChange={handleChange}
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={user.email}
                onChange={handleChange}
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={user.password}
                onChange={handleChange}
                required
              />

              <select
                name="role"
                value={user.role}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select Role
                </option>

                <option value="candidate">
                  Candidate
                </option>

                <option value="recruiter">
                  Recruiter
                </option>

              </select>

              <button type="submit">
                Register
              </button>

            </form>

            <p className="switch-text">

              Already have an account?

              <Link to="/login">
                Login
              </Link>

            </p>

          </div>

        </div>

      </div>

      <footer className="auth-footer">

        <h2>JobPortal</h2>

        <p>
          © 2026 All Rights Reserved
        </p>

      </footer>
    </>
  );
}

export default Register;
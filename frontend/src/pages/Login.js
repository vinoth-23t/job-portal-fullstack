import { useState } from "react";

import axios from "axios";

import {
  useNavigate,
  Link
} from "react-router-dom";

import Navbar from "../components/Navbar";

import "./Login.css";

function Login() {

  const navigate = useNavigate();

  const [user, setUser] =
    useState({

      email: "",
      password: ""
    });

  const handleChange = (e) => {

    setUser({

      ...user,

      [e.target.name]:
      e.target.value
    });
  };

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const response =
      await axios.post(

        "http://127.0.0.1:5000/login",

        user
      );

      if (
        response.data.message ===
        "Login Successful"
      ) {

        localStorage.setItem(
          "user",
          JSON.stringify(response.data)
        );

        if (
          response.data.role ===
          "admin"
        ) {

          navigate("/admin");

        } else if (

          response.data.role ===
          "recruiter"

        ) {

          navigate("/admin");

        } else {

          navigate("/jobs");
        }

      } else {

        alert(
          response.data.message
        );
      }

    } catch (error) {

      console.log(error);

      alert("Login Failed");
    }
  };

  return (

    <>
      <Navbar />

      <div className="login-container">

        {/* LEFT SECTION */}

        <div className="login-left">

          <h1>
            Welcome Back
          </h1>

          <p>
            Login to access thousands
            of jobs and opportunities.
          </p>

          <ul>

            <li>
              Apply for jobs instantly
            </li>

            <li>
              Connect with recruiters
            </li>

            <li>
              Build your dream career
            </li>

          </ul>

        </div>

        {/* RIGHT SECTION */}

        <div className="login-right">

          <div className="login-box">

            <h2>Login</h2>

            <form
              onSubmit={handleLogin}
            >

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

              <button type="submit">
                Login
              </button>

            </form>

            <p className="switch-text">

              Don't have an account?

              <Link to="/register">
                Register Now
              </Link>

            </p>

          </div>

        </div>

      </div>

      {/* FOOTER */}

      <footer className="auth-footer">

        <h2>JobPortal</h2>

        <p>
          © 2026 All Rights Reserved
        </p>

      </footer>
    </>
  );
}

export default Login;
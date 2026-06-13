import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./Login.css";

const API = process.env.REACT_APP_API_URL || "https://job-portal-backend-czgj.onrender.com";

function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/login`, user);
      if (response.data.message === "Login Successful") {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        toast.success("Login Successful");
        if (response.data.user.role === "admin" || response.data.user.role === "recruiter") {
          navigate("/admin");
        } else {
          navigate("/jobs");
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-container">
        <div className="login-left">
          <h1>Welcome Back</h1>
          <p>Login to access thousands of jobs and opportunities.</p>
          <ul>
            <li>Apply for jobs instantly</li>
            <li>Connect with recruiters</li>
            <li>Build your dream career</li>
          </ul>
        </div>
        <div className="login-right">
          <div className="login-box">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input type="email" name="email" placeholder="Email" value={user.email} onChange={handleChange} required />
              <input type="password" name="password" placeholder="Password" value={user.password} onChange={handleChange} required />
              <button type="submit">Login</button>
            </form>
            <p className="switch-text">
              Don't have an account? <Link to="/register">Register Now</Link>
            </p>
          </div>
        </div>
      </div>
      <footer className="auth-footer">
        <h2>JobPortal</h2>
        <p>© 2026 All Rights Reserved</p>
      </footer>
    </>
  );
}

export default Login;

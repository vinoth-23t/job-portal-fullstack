import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.body.className = dark ? "dark" : "";
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h1 className="logo">JobPortal</h1>
      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/jobs">Jobs</NavLink>

        {user && (user.role === "admin" || user.role === "recruiter") && (
          <NavLink to="/add-job">Add Job</NavLink>
        )}
        {user && (user.role === "admin" || user.role === "recruiter") && (
          <NavLink to="/admin">Dashboard</NavLink>
        )}
        {user && user.role === "candidate" && (
          <NavLink to="/my-applications">My Applications</NavLink>
        )}

        <button className="theme-toggle" onClick={() => setDark(!dark)}>
          {dark ? "☀️" : "🌙"}
        </button>

        {!user ? (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/profile">{user.name}</NavLink>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

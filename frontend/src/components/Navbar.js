import {
  NavLink,
  useNavigate
} from "react-router-dom";

import "./Navbar.css";

function Navbar() {

  const navigate = useNavigate();

  const user =
    JSON.parse(localStorage.getItem("user"));

  const logout = () => {

    localStorage.removeItem("user");

    navigate("/login");
  };

  return (

    <nav className="navbar">

      <h1 className="logo">
        JobPortal
      </h1>

      <div className="nav-links">

        <NavLink to="/">
          Home
        </NavLink>

        <NavLink to="/jobs">
          Jobs
        </NavLink>

        {user &&
        (
          user.role === "admin" ||
          user.role === "recruiter"
        ) && (

          <NavLink to="/add-job">
            Add Job
          </NavLink>
        )}

        {user && (

          <NavLink to="/admin">
            Dashboard
          </NavLink>
        )}

        {!user ? (

          <>
            <NavLink to="/login">
              Login
            </NavLink>

            <NavLink to="/register">
              Register
            </NavLink>
          </>

        ) : (

          <>
            <span className="username">
              {user.name}
            </span>

            <button
              className="logout-btn"
              onClick={logout}
            >
              Logout
            </button>
          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar;
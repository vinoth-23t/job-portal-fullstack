import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";

// Backend API URL
const API = import.meta.env.VITE_API_URL;

function AdminDashboard() {

  // Logged User
  const user =
    JSON.parse(localStorage.getItem("user"));

  // State
  const [jobs, setJobs] = useState([]);

  // Fetch Jobs
  useEffect(() => {

    fetchJobs();

  }, []);

  const fetchJobs = async () => {

    try {

      const response = await axios.get(
        `${API}/jobs`
      );

      setJobs(response.data);

    } catch (error) {

      console.log(error);

      alert("Failed to Fetch Jobs");
    }
  };

  // Restrict Access
  if (!user) {

    return <h1>Please Login</h1>;
  }

  // Delete Job
  const deleteJob = async (id) => {

    if (user.role === "candidate") {

      alert("Access Denied");

      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmDelete) return;

    try {

      await axios.delete(
        `${API}/job/${id}`
      );

      alert("Job Deleted Successfully");

      fetchJobs();

    } catch (error) {

      console.log(error);

      alert("Failed to Delete Job");
    }
  };

  return (
    <>
      <Navbar />

      <div className="dashboard-container">

        <h1>

          {user.role === "admin"
            ? "Admin Dashboard"
            : user.role === "recruiter"
            ? "Recruiter Dashboard"
            : "User Dashboard"}

        </h1>

        <div className="dashboard-stats">

          <div className="dashboard-card">

            <h2>Total Jobs</h2>

            <p>{jobs.length}</p>

          </div>

          <div className="dashboard-card">

            <h2>Total Applicants</h2>

            <p>120</p>

          </div>

          <div className="dashboard-card">

            <h2>Logged User</h2>

            <p>{user.name}</p>

          </div>

        </div>

        <div className="jobs-section">

          <h2>Posted Jobs</h2>

          <table>

            <thead>

              <tr>

                <th>Title</th>

                <th>Company</th>

                <th>Location</th>

                <th>Salary</th>

                {(user.role === "admin" ||
                  user.role === "recruiter") && (
                  <th>Action</th>
                )}

              </tr>

            </thead>

            <tbody>

              {jobs.length > 0 ? (

                jobs.map((job) => (

                  <tr key={job.id}>

                    <td>{job.title}</td>

                    <td>{job.company}</td>

                    <td>{job.location}</td>

                    <td>{job.salary}</td>

                    {(user.role === "admin" ||
                      user.role === "recruiter") && (

                      <td>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            deleteJob(job.id)
                          }
                        >
                          Delete
                        </button>

                      </td>

                    )}

                  </tr>

                ))

              ) : (

                <tr>

                  <td colSpan="5">

                    No Jobs Available

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>
    </>
  );
}

export default AdminDashboard;
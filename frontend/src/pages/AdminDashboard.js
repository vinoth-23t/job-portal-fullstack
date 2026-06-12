import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";

const API = process.env.REACT_APP_API_URL || "https://job-portal-backend-czgj.onrender.com";

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState({});

  useEffect(() => {
    fetchJobs();
    if (user && user.role === "admin") fetchUsers();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API}/jobs`);
      setJobs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      alert("Failed to Fetch Jobs");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      alert("Failed to Fetch Users");
    }
  };

  const viewApplicants = async (jobId) => {
    try {
      const response = await axios.get(`${API}/job-applications/${jobId}`);
      setApplications({ ...applications, [jobId]: response.data });
    } catch (error) {
      alert("Failed to Fetch Applicants");
    }
  };

  if (!user) return <h1>Please Login</h1>;

  const deleteJob = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await axios.delete(`${API}/job/${id}`, {
        data: { role: user.role, user_id: user.id }
      });
      alert("Job Deleted Successfully");
      fetchJobs();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to Delete Job");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await axios.delete(`${API}/user/${id}`);
      alert("User Deleted Successfully");
      fetchUsers();
    } catch (error) {
      alert("Failed to Delete User");
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1>{user.role === "admin" ? "Admin Dashboard" : "Recruiter Dashboard"}</h1>

        <div className="dashboard-stats">
          <div className="dashboard-card">
            <h2>Total Jobs</h2>
            <p>{jobs.length}</p>
          </div>
          {user.role === "admin" && (
            <div className="dashboard-card">
              <h2>Total Users</h2>
              <p>{users.length}</p>
            </div>
          )}
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
                <th>Applicants</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <>
                    <tr key={job.id}>
                      <td>{job.title}</td>
                      <td>{job.company}</td>
                      <td>{job.location}</td>
                      <td>{job.salary}</td>
                      <td>
                        <button className="view-btn" onClick={() => viewApplicants(job.id)}>
                          View
                        </button>
                      </td>
                      <td>
                        {(user.role === "admin" || job.posted_by === user.id) && (
                          <button className="delete-btn" onClick={() => deleteJob(job.id)}>
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                    {applications[job.id] && applications[job.id].length > 0 && (
                      <tr key={`apps-${job.id}`}>
                        <td colSpan="6">
                          <strong>Applicants:</strong>{" "}
                          {applications[job.id].map((a) => `${a.applicant.name} (${a.applicant.email})`).join(", ")}
                        </td>
                      </tr>
                    )}
                  </>
                ))
              ) : (
                <tr><td colSpan="6">No Jobs Available</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {user.role === "admin" && (
          <div className="jobs-section">
            <h2>Manage Users</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>
                        {u.role !== "admin" && (
                          <button className="delete-btn" onClick={() => deleteUser(u.id)}>Delete</button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4">No Users Found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminDashboard;

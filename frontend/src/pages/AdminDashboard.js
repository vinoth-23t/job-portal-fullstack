import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";

const API = process.env.REACT_APP_API_URL || "https://job-portal-backend-czgj.onrender.com";

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
    fetchStats();
    if (user && user.role === "admin") fetchUsers();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API}/jobs?per_page=100`);
      const data = response.data;
      setJobs(Array.isArray(data) ? data : data.jobs || []);
    } catch (error) { toast.error("Failed to Fetch Jobs"); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) { toast.error("Failed to Fetch Users"); }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
    } catch (error) { /* ignore */ }
  };

  const viewApplicants = async (jobId) => {
    try {
      const response = await axios.get(`${API}/job-applications/${jobId}`);
      setApplications({ ...applications, [jobId]: response.data });
    } catch (error) { toast.error("Failed to Fetch Applicants"); }
  };

  const updateStatus = async (appId, status, jobId) => {
    try {
      await axios.put(`${API}/application/${appId}`, { status });
      toast.success(`Marked as ${status}`);
      viewApplicants(jobId);
    } catch (error) { toast.error("Failed to Update Status"); }
  };

  if (!user) return <h1>Please Login</h1>;

  const deleteJob = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await axios.delete(`${API}/job/${id}`, { data: { role: user.role, user_id: user.id } });
      toast.success("Job Deleted");
      fetchJobs();
    } catch (error) { toast.error(error.response?.data?.message || "Failed to Delete Job"); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await axios.delete(`${API}/user/${id}`);
      toast.success("User Deleted");
      fetchUsers();
    } catch (error) { toast.error("Failed to Delete User"); }
  };

  const myJobs = jobs.filter(job => user.role === "admin" || job.posted_by === user.id);

  const StatusChart = ({ counts }) => {
    const total = counts.Applied + counts.Shortlisted + counts.Rejected || 1;
    return (
      <div className="chart-container">
        <h3>Applications by Status</h3>
        <div className="bar-chart">
          {Object.entries(counts).map(([status, count]) => (
            <div key={status} className="bar-item">
              <div className="bar-label">{status}</div>
              <div className="bar-track">
                <div className={`bar-fill bar-${status.toLowerCase()}`} style={{ width: `${(count / total) * 100}%` }}></div>
              </div>
              <div className="bar-count">{count}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1>{user.role === "admin" ? "Admin Dashboard" : "Recruiter Dashboard"}</h1>

        <div className="dashboard-stats">
          <div className="dashboard-card">
            <h2>My Jobs</h2>
            <p>{myJobs.length}</p>
          </div>
          {stats && (
            <>
              <div className="dashboard-card">
                <h2>Total Applications</h2>
                <p>{stats.total_applications}</p>
              </div>
              {user.role === "admin" && (
                <div className="dashboard-card">
                  <h2>Total Users</h2>
                  <p>{stats.total_users}</p>
                </div>
              )}
            </>
          )}
          <div className="dashboard-card">
            <h2>Logged User</h2>
            <p>{user.name}</p>
          </div>
        </div>

        {stats && stats.status_counts && <StatusChart counts={stats.status_counts} />}

        {loading ? (
          <div className="spinner-container"><div className="spinner"></div></div>
        ) : (
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myJobs.length > 0 ? myJobs.map((job) => (
                  <>
                    <tr key={job.id}>
                      <td>{job.title}</td>
                      <td>{job.company}</td>
                      <td>{job.location}</td>
                      <td>{job.salary}</td>
                      <td><button className="view-btn" onClick={() => viewApplicants(job.id)}>View</button></td>
                      <td>
                        <button className="edit-btn" onClick={() => navigate(`/edit-job/${job.id}`)}>Edit</button>
                        <button className="delete-btn" onClick={() => deleteJob(job.id)}>Delete</button>
                      </td>
                    </tr>
                    {applications[job.id] && applications[job.id].length > 0 && (
                      <tr key={`apps-${job.id}`}>
                        <td colSpan="6">
                          <div className="applicants-list">
                            {applications[job.id].map((a) => (
                              <div key={a.id} className="applicant-row">
                                <span>{a.applicant.name} ({a.applicant.email})</span>
                                {a.resume && (
                                  <a href={`${API}/resume/${a.resume}`} target="_blank" rel="noreferrer" className="resume-link">📄 Resume</a>
                                )}
                                <span className={`status-badge status-${a.status.toLowerCase()}`}>{a.status}</span>
                                <select onChange={(e) => updateStatus(a.id, e.target.value, job.id)} value={a.status}>
                                  <option value="Applied">Applied</option>
                                  <option value="Shortlisted">Shortlisted</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )) : <tr><td colSpan="6">No Jobs Available</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {user.role === "admin" && (
          <div className="jobs-section">
            <h2>Manage Users</h2>
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr>
              </thead>
              <tbody>
                {users.length > 0 ? users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                    <td>{u.role !== "admin" && <button className="delete-btn" onClick={() => deleteUser(u.id)}>Delete</button>}</td>
                  </tr>
                )) : <tr><td colSpan="4">No Users Found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminDashboard;

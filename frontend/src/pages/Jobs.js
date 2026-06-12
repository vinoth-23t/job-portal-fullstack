import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./Jobs.css";

const API = process.env.REACT_APP_API_URL || "https://job-portal-backend-czgj.onrender.com";

function Jobs() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [jobs, setJobs] = useState([]);
  const [externalJobs, setExternalJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchJobs();
    fetchExternalJobs();
  }, []);

  const handleApply = (jobId) => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "candidate") { alert("Only Candidates Can Apply"); return; }
    applyForJob(jobId);
  };

  const applyForJob = async (jobId) => {
    try {
      const response = await axios.post(`${API}/apply`, { user_id: user.id, job_id: jobId });
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to Apply");
    }
  };

  const fetchJobs = async (query = "") => {
    try {
      const response = await axios.get(`${API}/jobs?search=${query}`);
      setJobs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExternalJobs = async () => {
    try {
      const response = await axios.get(`${API}/external-jobs`);
      setExternalJobs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setExternalJobs([]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(search);
  };

  return (
    <>
      <Navbar />
      <div className="jobs-container">
        <h1>Available Jobs</h1>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by title, company, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        {loading && <p>Loading Jobs...</p>}

        <h2>Portal Jobs</h2>
        <div className="jobs-grid">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div className="job-card" key={job.id}>
                <div>
                  <h3>{job.title}</h3>
                  <p><strong>Company:</strong> {job.company}</p>
                  <p><strong>Location:</strong> {job.location}</p>
                  <p><strong>Salary:</strong> {job.salary}</p>
                  <p className="description">{job.description}</p>
                </div>
                {(!user || user.role === "candidate") && (
                  <button className="apply-btn" onClick={() => handleApply(job.id)}>
                    Apply Now
                  </button>
                )}
              </div>
            ))
          ) : (
            <p>No Portal Jobs Available</p>
          )}
        </div>

        <h2>Live Remote Jobs</h2>
        <div className="jobs-grid">
          {externalJobs.length > 0 ? (
            externalJobs.slice(0, 20).map((job, index) => (
              <div className="job-card" key={job.id || index}>
                <div>
                  <h3>{job.title}</h3>
                  <p><strong>Company:</strong> {job.company_name}</p>
                  <p><strong>Category:</strong> {job.category}</p>
                  <p><strong>Location:</strong> {job.candidate_required_location}</p>
                </div>
                <a href={job.url} target="_blank" rel="noreferrer" className="apply-btn">
                  Apply Now
                </a>
              </div>
            ))
          ) : (
            <p>No External Jobs Available</p>
          )}
        </div>
      </div>

      <footer className="jobs-footer">
        <h2>JobPortal</h2>
        <p>Explore opportunities and build your career with us.</p>
        <p>© 2026 All Rights Reserved</p>
      </footer>
    </>
  );
}

export default Jobs;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [applyModal, setApplyModal] = useState(null);
  const [resume, setResume] = useState(null);

  useEffect(() => {
    if (user && window.location.pathname === "/login") navigate("/jobs");
  }, []);

  useEffect(() => { fetchJobs(); }, [page, sort]);
  useEffect(() => { fetchExternalJobs(); }, []);

  const fetchJobs = async (query = search) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/jobs?search=${query}&page=${page}&per_page=9&sort=${sort}`);
      const data = response.data;
      if (data.jobs) { setJobs(data.jobs); setTotalPages(data.pages); }
      else { setJobs(Array.isArray(data) ? data : []); }
    } catch (error) { setJobs([]); }
    finally { setLoading(false); }
  };

  const fetchExternalJobs = async () => {
    try {
      const response = await axios.get(`${API}/external-jobs`);
      setExternalJobs(Array.isArray(response.data) ? response.data : []);
    } catch (error) { setExternalJobs([]); }
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchJobs(search); };

  const openApplyModal = (jobId) => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "candidate") { toast.warn("Only Candidates Can Apply"); return; }
    setApplyModal(jobId);
  };

  const submitApplication = async () => {
    try {
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("job_id", applyModal);
      if (resume) formData.append("resume", resume);

      const response = await axios.post(`${API}/apply`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success(response.data.message);
      setApplyModal(null);
      setResume(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Apply");
    }
  };

  return (
    <>
      <Navbar />
      <div className="jobs-container">
        <h1>Available Jobs</h1>

        <form onSubmit={handleSearch} className="search-form">
          <input type="text" placeholder="Search by title, company, or location..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="sort-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="salary_high">Salary: High to Low</option>
            <option value="salary_low">Salary: Low to High</option>
          </select>
          <button type="submit">Search</button>
        </form>

        {loading ? (
          <div className="spinner-container"><div className="spinner"></div></div>
        ) : (
          <>
            <h2>Portal Jobs</h2>
            <div className="jobs-grid">
              {jobs.length > 0 ? jobs.map((job) => (
                <div className="job-card" key={job.id}>
                  <div>
                    <h3>{job.title}</h3>
                    <p><strong>Company:</strong> {job.company}</p>
                    <p><strong>Location:</strong> {job.location}</p>
                    <p><strong>Salary:</strong> {job.salary}</p>
                    {job.expires_at && <p className="expires"><strong>Expires:</strong> {job.expires_at}</p>}
                    <p className="description">{job.description}</p>
                  </div>
                  {(!user || user.role === "candidate") && (
                    <button className="apply-btn" onClick={() => openApplyModal(job.id)}>Apply Now</button>
                  )}
                </div>
              )) : <p>No Portal Jobs Available</p>}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
                <span>Page {page} of {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
              </div>
            )}
          </>
        )}

        <h2>Live Remote Jobs</h2>
        <div className="jobs-grid">
          {externalJobs.length > 0 ? externalJobs.slice(0, 20).map((job, index) => (
            <div className="job-card" key={job.id || index}>
              <div>
                <h3>{job.title}</h3>
                <p><strong>Company:</strong> {job.company_name}</p>
                <p><strong>Category:</strong> {job.category}</p>
                <p><strong>Location:</strong> {job.candidate_required_location}</p>
              </div>
              <a href={job.url} target="_blank" rel="noreferrer" className="apply-btn">Apply Now</a>
            </div>
          )) : <p>No External Jobs Available</p>}
        </div>
      </div>

      {/* Apply Modal */}
      {applyModal && (
        <div className="modal-overlay" onClick={() => setApplyModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Apply for Job</h2>
            <p>Upload your resume (optional)</p>
            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResume(e.target.files[0])} />
            {resume && <p className="file-name">📄 {resume.name}</p>}
            <div className="modal-actions">
              <button className="apply-btn" onClick={submitApplication}>Submit Application</button>
              <button className="cancel-btn" onClick={() => setApplyModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <footer className="jobs-footer">
        <h2>JobPortal</h2>
        <p>Explore opportunities and build your career with us.</p>
        <p>© 2026 All Rights Reserved</p>
      </footer>
    </>
  );
}

export default Jobs;

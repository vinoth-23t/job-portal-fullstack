import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./AddJob.css";

const API = process.env.REACT_APP_API_URL || "https://job-portal-backend-czgj.onrender.com";

function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [job, setJob] = useState({ title: "", company: "", location: "", salary: "", description: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJob();
  }, []);

  const fetchJob = async () => {
    try {
      const response = await axios.get(`${API}/job/${id}`);
      setJob(response.data);
    } catch (error) {
      toast.error("Failed to load job");
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== "admin" && user.role !== "recruiter")) {
    return <><Navbar /><div className="access-denied"><h1>Access Denied</h1></div></>;
  }

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/job/${id}`, job);
      toast.success("Job Updated Successfully");
      navigate("/admin");
    } catch (error) {
      toast.error("Failed to Update Job");
    }
  };

  if (loading) return <><Navbar /><div className="add-job-container"><p>Loading...</p></div></>;

  return (
    <>
      <Navbar />
      <div className="add-job-container">
        <div className="add-job-box">
          <h2>Edit Job</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" name="title" placeholder="Job Title" value={job.title} onChange={handleChange} required />
            <input type="text" name="company" placeholder="Company Name" value={job.company} onChange={handleChange} required />
            <input type="text" name="location" placeholder="Location" value={job.location} onChange={handleChange} required />
            <input type="text" name="salary" placeholder="Salary" value={job.salary} onChange={handleChange} required />
            <textarea name="description" placeholder="Job Description" value={job.description} onChange={handleChange} required></textarea>
            <button type="submit">Update Job</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditJob;

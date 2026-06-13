import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./AddJob.css";

const API = process.env.REACT_APP_API_URL || "https://job-portal-backend-czgj.onrender.com";

function AddJob() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [job, setJob] = useState({ title: "", company: "", location: "", salary: "", description: "", expires_at: "" });

  if (!user || (user.role !== "admin" && user.role !== "recruiter")) {
    return <><Navbar /><div className="access-denied"><h1>Access Denied</h1><p>Only Recruiters and Admins can add jobs.</p></div></>;
  }

  const handleChange = (e) => setJob({ ...job, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/add-job`, { ...job, posted_by: user.id });
      toast.success("Job Added Successfully");
      setJob({ title: "", company: "", location: "", salary: "", description: "", expires_at: "" });
    } catch (error) { toast.error("Failed to Add Job"); }
  };

  return (
    <>
      <Navbar />
      <div className="add-job-container">
        <div className="add-job-box">
          <h2>Add New Job</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" name="title" placeholder="Job Title" value={job.title} onChange={handleChange} required />
            <input type="text" name="company" placeholder="Company Name" value={job.company} onChange={handleChange} required />
            <input type="text" name="location" placeholder="Location" value={job.location} onChange={handleChange} required />
            <input type="text" name="salary" placeholder="Salary" value={job.salary} onChange={handleChange} required />
            <input type="date" name="expires_at" value={job.expires_at} onChange={handleChange} />
            <textarea name="description" placeholder="Job Description" value={job.description} onChange={handleChange} required></textarea>
            <button type="submit">Add Job</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddJob;

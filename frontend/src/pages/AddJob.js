import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./AddJob.css";

// Backend API URL
const API = import.meta.env.VITE_API_URL;

function AddJob() {

  // Logged User
  const user =
    JSON.parse(localStorage.getItem("user"));

  // Form State
  const [job, setJob] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    description: ""
  });

<<<<<<< HEAD
  // Loading State
  const [isLoading, setIsLoading] = useState(false);

  // Candidate Only
  if (!user) {

    return (
      <>
        <Navbar />
        <h1>Please Login</h1>
      </>
    );
  }

  if (user.role !== "candidate") {
=======
  // Restrict Access
  if (
    !user ||
    (
      user.role !== "admin" &&
      user.role !== "recruiter"
    )
  ) {
>>>>>>> e3dcf63 (Fix API call for job application)

    return (
      <>
        <Navbar />

        <div className="access-denied">

          <h1>Access Denied</h1>

          <p>
            Only Recruiters and Admins
            can add jobs.
          </p>

        </div>
      </>
    );
  }

  // Handle Change
  const handleChange = (e) => {

    setJob({
      ...job,
      [e.target.name]: e.target.value
    });

  };

  // Handle Submit
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!resume.trim()) {
      alert("Please enter a resume link");
      return;
    }

    setIsLoading(true);

    try {

<<<<<<< HEAD
      const response = await fetch(`${API}/apply-job`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: user.id,
          resume: resume
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      alert(data.message || "Application Submitted Successfully");
=======
      const response = await axios.post(
        `${API}/add-job`,
        job
      );
>>>>>>> e3dcf63 (Fix API call for job application)

      alert(response.data.message);

      setJob({
        title: "",
        company: "",
        location: "",
        salary: "",
        description: ""
      });

    } catch (error) {

      console.error("Apply Job Error:", error);

<<<<<<< HEAD
      alert("Failed To Apply. Please try again.");
    } finally {
      setIsLoading(false);
=======
      alert("Failed to Add Job");
>>>>>>> e3dcf63 (Fix API call for job application)
    }
  };

  return (
    <>
      <Navbar />

      <div className="add-job-container">

        <div className="add-job-box">

          <h2>Add New Job</h2>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="title"
              placeholder="Job Title"
              value={job.title}
              onChange={handleChange}
              required
            />

<<<<<<< HEAD
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Application"}
=======
            <input
              type="text"
              name="company"
              placeholder="Company Name"
              value={job.company}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="location"
              placeholder="Location"
              value={job.location}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="salary"
              placeholder="Salary"
              value={job.salary}
              onChange={handleChange}
              required
            />

            <textarea
              name="description"
              placeholder="Job Description"
              value={job.description}
              onChange={handleChange}
              required
            ></textarea>

            <button type="submit">
              Add Job
>>>>>>> e3dcf63 (Fix API call for job application)
            </button>

          </form>

        </div>

      </div>
    </>
  );
}

<<<<<<< HEAD
export default ApplyJob;
=======
export default AddJob;
>>>>>>> e3dcf63 (Fix API call for job application)

import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./AddJob.css";

// Backend API URL
const API = process.env.REACT_APP_API_URL || "https://job-portal-backend-czgj.onrender.com";

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

  // Restrict Access
  if (
    !user ||
    (
      user.role !== "admin" &&
      user.role !== "recruiter"
    )
  ) {

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

    try {

      const response = await axios.post(
        `${API}/add-job`,
        job
      );

      alert(response.data.message);

      setJob({
        title: "",
        company: "",
        location: "",
        salary: "",
        description: ""
      });

    } catch (error) {

      console.log(error);

      alert("Failed to Add Job");
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
            </button>

          </form>

        </div>

      </div>
    </>
  );
}

export default AddJob;
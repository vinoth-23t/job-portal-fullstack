import { useState } from "react";
import Navbar from "../components/Navbar";
import "./AddJob.css";

function ApplyJob() {

  // Logged User
  const user =
    JSON.parse(localStorage.getItem("user"));

  // Resume State
  const [resume, setResume] =
    useState("");

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

    return (
      <>
        <Navbar />

        <div className="access-denied">

          <h1>Access Denied</h1>

          <p>
            Only Candidates Can Apply
          </p>

        </div>
      </>
    );
  }

  // Handle Submit
  const handleSubmit = (e) => {

    e.preventDefault();

    alert(
      "Application Submitted Successfully"
    );

    setResume("");
  };

  return (
    <>
      <Navbar />

      <div className="add-job-container">

        <div className="add-job-box">

          <h2>Apply For Job</h2>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              placeholder="Enter Resume Link"
              value={resume}
              onChange={(e) =>
                setResume(e.target.value)
              }
              required
            />

            <button type="submit">
              Submit Application
            </button>

          </form>

        </div>

      </div>
    </>
  );
}

export default ApplyJob;
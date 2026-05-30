import { useState } from "react";
import Navbar from "../components/Navbar";
import "./AddJob.css";

// Backend API URL
const API = import.meta.env.VITE_API_URL;

function ApplyJob() {

  // Logged User
  const user =
    JSON.parse(localStorage.getItem("user"));

  // Resume State
  const [resume, setResume] =
    useState("");

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
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!resume.trim()) {
      alert("Please enter a resume link");
      return;
    }

    setIsLoading(true);

    try {

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

      setResume("");

    } catch (error) {

      console.error("Apply Job Error:", error);

      alert("Failed To Apply. Please try again.");
    } finally {
      setIsLoading(false);
    }
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

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Application"}
            </button>

          </form>

        </div>

      </div>
    </>
  );
}

export default ApplyJob;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./Jobs.css";

function Jobs() {

  const navigate = useNavigate();

  // Logged User
  const user =
    JSON.parse(localStorage.getItem("user"));

  // State
  const [jobs, setJobs] = useState([]);
  const [externalJobs, setExternalJobs] =
    useState([]);

  // Load Jobs
  useEffect(() => {

    fetchJobs();
    fetchExternalJobs();

  }, []);

  // Handle Apply Button
  const handleApply = () => {

    // Not Logged In
    if (!user) {

      navigate("/login");
      return;
    }

    // Only Candidates
    if (user.role !== "candidate") {

      alert(
        "Only Candidates Can Apply"
      );

      return;
    }

    // Candidate Access
    navigate("/apply-job");
  };

  // Fetch Portal Jobs
  const fetchJobs = async () => {

    try {

      const response = await axios.get(
        "http://127.0.0.1:5000/jobs"
      );

      setJobs(response.data);

    } catch (error) {

      console.log(error);
    }
  };

  // Fetch External Jobs
  const fetchExternalJobs = async () => {

    try {

      const response = await axios.get(
        "http://127.0.0.1:5000/external-jobs"
      );

      setExternalJobs(response.data);

    } catch (error) {

      console.log(error);
    }
  };

  return (
    <>
      <Navbar />

      <div className="jobs-container">

        <h1>Available Jobs</h1>

        {/* Portal Jobs */}

        <h2>Portal Jobs</h2>

        <div className="jobs-grid">

          {jobs.length > 0 ? (

            jobs.map((job) => (

              <div
                className="job-card"
                key={job.id}
              >

                <div>

                  <h3>{job.title}</h3>

                  <p>
                    <strong>Company:</strong>{" "}
                    {job.company}
                  </p>

                  <p>
                    <strong>Location:</strong>{" "}
                    {job.location}
                  </p>

                  <p>
                    <strong>Salary:</strong>{" "}
                    {job.salary}
                  </p>

                  <p className="description">
                    {job.description}
                  </p>

                </div>

                <button
                  className="apply-btn"
                  onClick={handleApply}
                >
                  Apply Now
                </button>

              </div>

            ))

          ) : (

            <p>No Portal Jobs Available</p>

          )}

        </div>

        {/* External Jobs */}

        <h2>Live Remote Jobs</h2>

        <div className="jobs-grid">

          {externalJobs.length > 0 ? (

            externalJobs
              .slice(0, 20)
              .map((job) => (

                <div
                  className="job-card"
                  key={job.id}
                >

                  <div>

                    <h3>{job.title}</h3>

                    <p>
                      <strong>Company:</strong>{" "}
                      {job.company_name}
                    </p>

                    <p>
                      <strong>Category:</strong>{" "}
                      {job.category}
                    </p>

                    <p>
                      <strong>Location:</strong>{" "}
                      {job.candidate_required_location}
                    </p>

                  </div>

                  <button
                    className="apply-btn"
                    onClick={handleApply}
                  >
                    Apply Now
                  </button>

                </div>

              ))

          ) : (

            <p>No External Jobs Available</p>

          )}

        </div>

      </div>
       {/* FOOTER */}

      <footer className="jobs-footer">

        <h2>JobPortal</h2>

        <p>
          Explore opportunities and build
          your career with us.
        </p>

        <p>
          © 2026 All Rights Reserved
        </p>

      </footer>
    </>
  );
}

export default Jobs;
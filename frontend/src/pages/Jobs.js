import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./Jobs.css";

// Backend API URL
const API = process.env.REACT_APP_API_URL || "https://job-portal-backend-czgj.onrender.com";

function Jobs() {

  const navigate = useNavigate();

  // Logged User
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  // State
  const [jobs, setJobs] = useState([]);
  const [externalJobs, setExternalJobs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

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
        `${API}/jobs`
      );

      console.log(
        "Portal Jobs API:",
        response.data
      );

      // SAFE ARRAY CHECK

      if (
        Array.isArray(response.data)
      ) {

        setJobs(response.data);

      } else if (
        Array.isArray(
          response.data.jobs
        )
      ) {

        setJobs(
          response.data.jobs
        );

      } else {

        setJobs([]);
      }

    } catch (error) {

      console.log(
        "Portal Jobs Error:",
        error
      );

      setJobs([]);

      alert(
        "Failed To Fetch Portal Jobs"
      );

    } finally {

      setLoading(false);
    }
  };

  // Fetch External Jobs
  const fetchExternalJobs = async () => {

    try {

      const response = await axios.get(
        `${API}/external-jobs`
      );

      console.log(
        "External Jobs API:",
        response.data
      );

      // SAFE ARRAY CHECK

      if (
        Array.isArray(response.data)
      ) {

        setExternalJobs(
          response.data
        );

      } else if (
        Array.isArray(
          response.data.jobs
        )
      ) {

        setExternalJobs(
          response.data.jobs
        );

      } else {

        setExternalJobs([]);
      }

    } catch (error) {

      console.log(
        "External Jobs Error:",
        error
      );

      setExternalJobs([]);

      alert(
        "Failed To Fetch External Jobs"
      );
    }
  };

  return (
    <>
      <Navbar />

      <div className="jobs-container">

        <h1>Available Jobs</h1>

        {loading && (
          <p>Loading Jobs...</p>
        )}

        {/* Portal Jobs */}

        <h2>Portal Jobs</h2>

        <div className="jobs-grid">

          {Array.isArray(jobs) &&
          jobs.length > 0 ? (

            jobs.map((job) => (

              <div
                className="job-card"
                key={job.id}
              >

                <div>

                  <h3>
                    {job.title}
                  </h3>

                  <p>
                    <strong>
                      Company:
                    </strong>{" "}
                    {job.company}
                  </p>

                  <p>
                    <strong>
                      Location:
                    </strong>{" "}
                    {job.location}
                  </p>

                  <p>
                    <strong>
                      Salary:
                    </strong>{" "}
                    {job.salary}
                  </p>

                  <p className="description">
                    {job.description}
                  </p>

                </div>

                <button
                  className="apply-btn"
                  onClick={
                    handleApply
                  }
                >
                  Apply Now
                </button>

              </div>

            ))

          ) : (

            <p>
              No Portal Jobs Available
            </p>

          )}

        </div>

        {/* External Jobs */}

        <h2>Live Remote Jobs</h2>

        <div className="jobs-grid">

          {Array.isArray(
            externalJobs
          ) &&
          externalJobs.length >
            0 ? (

            externalJobs
              .slice(0, 20)
              .map((job, index) => (

                <div
                  className="job-card"
                  key={
                    job.id ||
                    index
                  }
                >

                  <div>

                    <h3>
                      {job.title}
                    </h3>

                    <p>
                      <strong>
                        Company:
                      </strong>{" "}
                      {
                        job.company_name
                      }
                    </p>

                    <p>
                      <strong>
                        Category:
                      </strong>{" "}
                      {job.category}
                    </p>

                    <p>
                      <strong>
                        Location:
                      </strong>{" "}
                      {
                        job.candidate_required_location
                      }
                    </p>

                  </div>

                  <button
                    className="apply-btn"
                    onClick={
                      handleApply
                    }
                  >
                    Apply Now
                  </button>

                </div>

              ))

          ) : (

            <p>
              No External Jobs Available
            </p>

          )}

        </div>

      </div>

      {/* FOOTER */}

      <footer className="jobs-footer">

        <h2>JobPortal</h2>

        <p>
          Explore opportunities and
          build your career with us.
        </p>

        <p>
          © 2026 All Rights Reserved
        </p>

      </footer>
    </>
  );
}

export default Jobs;
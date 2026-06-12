import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";

const API = process.env.REACT_APP_API_URL || "https://job-portal-backend-czgj.onrender.com";

function MyApplications() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (user) fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API}/my-applications/${user.id}`);
      setApplications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      alert("Failed to Fetch Applications");
    }
  };

  if (!user) return <h1>Please Login</h1>;

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1>My Applications</h1>
        <div className="jobs-section">
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.length > 0 ? (
                applications.map((app) => (
                  <tr key={app.id}>
                    <td>{app.job.title}</td>
                    <td>{app.job.company}</td>
                    <td>{app.job.location}</td>
                    <td>{app.status}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4">No Applications Yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default MyApplications;

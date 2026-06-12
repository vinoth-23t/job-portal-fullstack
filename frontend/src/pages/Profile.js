import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./AddJob.css";

const API = process.env.REACT_APP_API_URL || "https://job-portal-backend-czgj.onrender.com";

function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [form, setForm] = useState({ name: user?.name || "", password: "" });

  if (!user) return <h1>Please Login</h1>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API}/profile/${user.id}`, form);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      alert("Profile Updated Successfully");
    } catch (error) {
      alert("Failed to Update Profile");
    }
  };

  return (
    <>
      <Navbar />
      <div className="add-job-container">
        <div className="add-job-box">
          <h2>My Profile</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input type="password" placeholder="New Password (leave blank to keep)"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="submit">Update Profile</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Profile;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import AddJob from "./pages/AddJob";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import MyApplications from "./pages/MyApplications";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/add-job" element={<AddJob />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-applications" element={<MyApplications />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

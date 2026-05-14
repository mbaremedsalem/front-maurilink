import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import Navbar from './components/Layout/Navbar';

// Pages
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Login from './pages/Login';
import Register from './pages/Register';
import JobDetail from './pages/JobDetail';
import Profile from './pages/Profile';
import Resumes from './pages/Resumes';
import Applications from './pages/Applications';
import EspaceRecriteur from './pages/EspaceRcriteur';
import RFPs from './pages/RFPs';
import RFPDetail from './pages/RFPDetail';
import MyRFPs from './pages/MyRFPs';
import CreateRFP from './pages/CreateRFP';
import EditRFP from './pages/EditRFP';
import CompanyProposals from './pages/CompanyProposals';
import MyJobs from './pages/MyJobs';
import About from './pages/About';
import Contact from './pages/Contact';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/resumes" element={<Resumes />} />
        <Route path="/employer-space" element={<EspaceRecriteur />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/rfps" element={<RFPs />} />
        <Route path="/rfps/:id" element={<RFPDetail />} />
        <Route path="/my-rfps" element={<MyRFPs />} />
        <Route path="/create-rfp" element={<CreateRFP />} />
        <Route path="/edit-rfp/:id" element={<EditRFP />} />
        <Route path="/company-proposals" element={<CompanyProposals />} />
        <Route path="/my-jobs" element={<MyJobs />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={5000} />
    </div>
  );
}

export default App;
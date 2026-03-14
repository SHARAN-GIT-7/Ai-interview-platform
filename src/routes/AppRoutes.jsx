import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "../pages/landing/LandingPage";

import UserLogin from "../pages/auth/UserLogin";
import UserRegister from "../pages/auth/UserRegister";

import CompanyLogin from "../pages/auth/CompanyLogin";
import CompanyRegister from "../pages/auth/CompanyRegister";

import UserDashboard from "../pages/user/UserDashboard";
import CompanyDashboard from "../pages/company/CompanyDashboard";

import TestPortal from "../pages/test-portal/TestPortal";

import Error404 from "../pages/errors/Error404";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* User Authentication */}
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserRegister />} />

        {/* Company Authentication */}
        <Route path="/company/login" element={<CompanyLogin />} />
        <Route path="/company/register" element={<CompanyRegister />} />

        {/* User Dashboard */}
        <Route path="/user/dashboard" element={<UserDashboard />} />

        {/* Company Dashboard */}
        <Route path="/company/dashboard" element={<CompanyDashboard />} />

        {/* Test Portal */}
        <Route path="/test/:testId" element={<TestPortal />} />

        {/* Error Page */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  );
}
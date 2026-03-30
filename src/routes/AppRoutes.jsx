import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "../pages/landing/LandingPage";

import UserLogin from "../pages/auth/UserLogin";
import UserRegister from "../pages/auth/UserRegister";

import CompanyLogin from "../pages/auth/CompanyLogin";
import CompanyRegister from "../pages/auth/CompanyRegister";

import UserDashboard from "../pages/user/UserDashboard";
import SubmitProfile from "../pages/user/SubmitProfile";
import LiveVerification from "../pages/aadhar-verification/LiveVerification";
import UploadDetails from "../pages/aadhar-verification/UploadDetails";
import CompanyDashboard from "../pages/company/CompanyDashboard";

import ResumeParser from "../pages/test-portal/ResumeParser";
import TestPortal from "../pages/test-portal/TestPortal";
import TestEvaluation from "../pages/test-portal/TestEvaluation";

import StartingTest from "../pages/aptitude-test-portal/StartingTest";
import AptitudeTest from "../pages/aptitude-test-portal/AptitudeTest";
 
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
        <Route path="/user/submit-profile" element={<SubmitProfile />} />
        <Route path="/user/live-verification" element={<LiveVerification />} />
        <Route path="/user/upload-details" element={<UploadDetails />} />

        {/* Company Dashboard */}
        <Route path="/company/dashboard" element={<CompanyDashboard />} />

        {/* Interview Flow */}
        <Route path="/interview/resume-parser" element={<ResumeParser />} />
        <Route path="/interview/test-portal" element={<TestPortal />} />
        <Route path="/interview/evaluation" element={<TestEvaluation />} />

        {/* Test Portal (Legacy) */}
        <Route path="/test/:testId" element={<TestPortal />} />

        {/* Aptitude Test */}
        <Route path="/aptitude/start" element={<StartingTest />} />
        <Route path="/aptitude/test" element={<AptitudeTest />} />

        {/* Error Page */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  );
}
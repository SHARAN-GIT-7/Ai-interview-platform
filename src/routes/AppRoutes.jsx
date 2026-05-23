import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "../pages/landing/LandingPage";

import UserLogin from "../pages/auth/UserLogin";
import UserRegister from "../pages/auth/UserRegister";

import CompanyLogin from "../pages/auth/CompanyLogin";
import CompanyRegister from "../pages/auth/CompanyRegister";

import PricingPage from "../pages/Intervista-pages/PricingPage";
import AboutusPage from "../pages/Intervista-pages/AboutusPage";
import PrivacypolicyPage from "../pages/Intervista-pages/PrivacypolicyPage";
import TermsConditions from "../pages/Intervista-pages/TermsConditions";
import FeaturesPage from "../pages/Intervista-pages/FeaturesPage";
import Contact from "../pages/Intervista-pages/Contact";
import HowItWorks from "../pages/Intervista-pages/HowItWorks";

import UserDashboard from "../pages/user/UserDashboard";
import SubmitProfile from "../pages/user/SubmitProfile";
import LiveVerification from "../pages/aadhar-verification/LiveVerification";
import UploadDetails from "../pages/aadhar-verification/UploadDetails";
import CompanyDashboard from "../pages/company/CompanyDashboard";
import CompanyInfoOnboarding from "../pages/company/CompanyInfoOnboarding";


import ResumeParser from "../pages/test-portal/ResumeParser";
import TestPortal from "../pages/test-portal/TestPortal";
import TestEvaluation from "../pages/test-portal/TestEvaluation";

import StartingTest from "../pages/aptitude-test-portal/StartingTest";
import AptitudeTest from "../pages/aptitude-test-portal/AptitudeTest";

import ScreeningBegin from "../pages/aptitude-screening-test/ScreeningBegin";
import MainScreeningTest from "../pages/aptitude-screening-test/MainScreeningTest";

import InitialProcess from "../pages/interview-module/InitialProcess";
import MainAssessment from "../pages/interview-module/MainAssessment";
import Results from "../pages/interview-module/Results";

import VerbalStartingTest from "../pages/verbal-test/StartingTest";
import SpeakingTest from "../pages/verbal-test/SpeakingTest";
import ListeningTest from "../pages/verbal-test/ListeningTest";
import VerbalResults from "../pages/verbal-test/Results";

import Error404 from "../pages/errors/Error404";



export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutusPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/privacy-policy" element={<PrivacypolicyPage />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/how-it-works" element={<HowItWorks />} />

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

        {/* Company Dashboard & Setup */}
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/company/setup" element={<CompanyInfoOnboarding />} />


        {/* Interview Flow */}
        <Route path="/interview/resume-parser" element={<ResumeParser />} />
        <Route path="/interview/test-portal" element={<TestPortal />} />
        <Route path="/interview/evaluation" element={<TestEvaluation />} />

        {/* Test Portal (Legacy) */}
        <Route path="/test/:testId" element={<TestPortal />} />

        {/* Aptitude Test */}
        <Route path="/aptitude/start" element={<StartingTest />} />
        <Route path="/aptitude/test" element={<AptitudeTest />} />

        {/* Screening Assessment */}
        <Route path="/screening/start" element={<ScreeningBegin />} />
        <Route path="/screening/test" element={<MainScreeningTest />} />

        {/* Coding Assessment Module */}
        <Route path="/coding/instructions" element={<InitialProcess />} />
        <Route path="/coding/assessment"   element={<MainAssessment />} />
        <Route path="/coding/results"      element={<Results />} />

        {/* Verbal Communication Assessment */}
        <Route path="/verbal/start"     element={<VerbalStartingTest />} />
        <Route path="/verbal/speaking"  element={<SpeakingTest />} />
        <Route path="/verbal/listening" element={<ListeningTest />} />
        <Route path="/verbal/results"   element={<VerbalResults />} />

        {/* Error Page */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  );
}
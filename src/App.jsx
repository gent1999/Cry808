import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import News from "./pages/News";
import Interviews from "./pages/Interviews";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SubmitMusic from "./pages/SubmitMusic";
import DMCA from "./pages/DMCA";
import TermsOfUse from "./pages/TermsOfUse";
import Contact from "./pages/Contact";
import ArticleDetail from "./pages/ArticleDetail";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ArticleCreate from "./pages/admin/ArticleCreate";
import ArticleEdit from "./pages/admin/ArticleEdit";
import ArticlesList from "./pages/admin/ArticlesList";
import SubmissionsList from "./pages/admin/SubmissionsList";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black">
        <Routes>
          {/* Public Routes with Navbar */}
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <Home />
              </>
            }
          />
          <Route
            path="/about"
            element={
              <>
                <Navbar />
                <About />
              </>
            }
          />
          <Route
            path="/news"
            element={
              <>
                <Navbar />
                <News />
              </>
            }
          />
          <Route
            path="/interviews"
            element={
              <>
                <Navbar />
                <Interviews />
              </>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <>
                <Navbar />
                <PrivacyPolicy />
              </>
            }
          />
          <Route
            path="/submit-music"
            element={
              <>
                <Navbar />
                <SubmitMusic />
              </>
            }
          />
          <Route
            path="/dmca"
            element={
              <>
                <Navbar />
                <DMCA />
              </>
            }
          />
          <Route
            path="/terms-of-use"
            element={
              <>
                <Navbar />
                <TermsOfUse />
              </>
            }
          />
          <Route
            path="/contact"
            element={
              <>
                <Navbar />
                <Contact />
              </>
            }
          />
          <Route
            path="/article/:id"
            element={
              <>
                <Navbar />
                <ArticleDetail />
              </>
            }
          />

          {/* Admin Routes without Navbar */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/articles" element={<ArticlesList />} />
          <Route path="/admin/articles/create" element={<ArticleCreate />} />
          <Route path="/admin/articles/edit/:id" element={<ArticleEdit />} />
          <Route path="/admin/submissions" element={<SubmissionsList />} />
        </Routes>
      </div>
    </Router>
  );
}

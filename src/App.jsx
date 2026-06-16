import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Navbar from "./components/Navbar";
import { initGA, logPageView } from "./utils/analytics";
import Home from "./pages/Home";
import About from "./pages/About";
import News from "./pages/News";
import Interviews from "./pages/Interviews";
import Reviews from "./pages/Reviews";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SubmitMusic from "./pages/SubmitMusic";
import DMCA from "./pages/DMCA";
import TermsOfUse from "./pages/TermsOfUse";
import Contact from "./pages/Contact";
import ArticleDetail from "./pages/ArticleDetail";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSettings from "./pages/admin/AdminSettings";
import ArticleCreate from "./pages/admin/ArticleCreate";
import ArticleEdit from "./pages/admin/ArticleEdit";
import ArticlesList from "./pages/admin/ArticlesList";
import SubmissionsList from "./pages/admin/SubmissionsList";
import Finance from "./pages/admin/Finance";
import RevenueLog from "./pages/admin/RevenueLog";
import Payouts from "./pages/admin/Payouts";
import Expenses from "./pages/admin/Expenses";
import RevenueSources from "./pages/admin/RevenueSources";
import Cortex from "./pages/admin/Cortex";
import Newsletter from "./pages/admin/Newsletter";
import SpotifyDashboard from "./pages/admin/SpotifyDashboard";
import ArtistPage from "./pages/ArtistPage";
import ArtistsList from "./pages/admin/ArtistsList";
import ArtistCreate from "./pages/admin/ArtistCreate";
import ArtistEdit from "./pages/admin/ArtistEdit";

// Component to track page views
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    logPageView(location.pathname + location.search);
  }, [location]);

  return null;
}

export default function App() {
  useEffect(() => {
    // Initialize Google Analytics on app mount with error handling
    try {
      initGA();
    } catch (error) {
      console.error('Failed to initialize GA:', error);
      // Continue loading app even if analytics fails
    }
  }, []);

  return (
    <HelmetProvider>
      <Router>
        <AnalyticsTracker />
        <div className="min-h-screen bg-black overflow-x-hidden">
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
            path="/reviews"
            element={
              <>
                <Navbar />
                <Reviews />
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
          <Route
            path="/artist/:slug"
            element={
              <>
                <Navbar />
                <ArtistPage />
              </>
            }
          />

          {/* Admin Routes without Navbar */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/articles" element={<ArticlesList />} />
          <Route path="/admin/articles/create" element={<ArticleCreate />} />
          <Route path="/admin/articles/edit/:id" element={<ArticleEdit />} />
          <Route path="/admin/submissions" element={<SubmissionsList />} />
          <Route path="/admin/finance" element={<Finance />} />
          <Route path="/admin/finance/revenue" element={<RevenueLog />} />
          <Route path="/admin/finance/payouts" element={<Payouts />} />
          <Route path="/admin/finance/expenses" element={<Expenses />} />
          <Route path="/admin/finance/sources" element={<RevenueSources />} />
          <Route path="/admin/cortex" element={<Cortex />} />
          <Route path="/admin/newsletter" element={<Newsletter />} />
          <Route path="/admin/spotify" element={<SpotifyDashboard />} />
          <Route path="/admin/artists" element={<ArtistsList />} />
          <Route path="/admin/artists/create" element={<ArtistCreate />} />
          <Route path="/admin/artists/edit/:id" element={<ArtistEdit />} />
        </Routes>

      </div>
    </Router>
    </HelmetProvider>
  );
}

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ArticleCreate from "./pages/ArticleCreate";
import ArticlesList from "./pages/ArticlesList";

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

          {/* Admin Routes without Navbar */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/articles" element={<ArticlesList />} />
          <Route path="/admin/articles/create" element={<ArticleCreate />} />
        </Routes>
      </div>
    </Router>
  );
}

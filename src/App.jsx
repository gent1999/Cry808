import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import ArticleDetail from "./pages/ArticleDetail";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ArticleCreate from "./pages/admin/ArticleCreate";
import ArticleEdit from "./pages/admin/ArticleEdit";
import ArticlesList from "./pages/admin/ArticlesList";

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
        </Routes>
      </div>
    </Router>
  );
}

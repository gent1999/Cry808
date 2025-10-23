import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/cry808_logo.png";

export default function Navbar() {
  return (
    <nav className="bg-black border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center hover:opacity-80 transition -my-8">
            <img src={logo} alt="CRY808" className="h-28" />
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-white/70 hover:text-white transition">
              Home
            </Link>
            <Link to="/news" className="text-white/70 hover:text-white transition">
              News
            </Link>
            <Link to="/reviews" className="text-white/70 hover:text-white transition">
              Reviews
            </Link>
            <Link to="/videos" className="text-white/70 hover:text-white transition">
              Videos
            </Link>
            <Link to="/interviews" className="text-white/70 hover:text-white transition">
              Interviews
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

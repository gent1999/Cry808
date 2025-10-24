import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/cry808_logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Links */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mb-6">
          <Link to="/about" className="text-white/70 hover:text-white text-sm transition-colors">
            About
          </Link>
          <Link to="/privacy-policy" className="text-white/70 hover:text-white text-sm transition-colors">
            Privacy Policy
          </Link>
          <Link to="/submit-music" className="text-white/70 hover:text-white text-sm transition-colors">
            Submit Music
          </Link>
          <Link to="/dmca" className="text-white/70 hover:text-white text-sm transition-colors">
            DMCA
          </Link>
          <Link to="/terms-of-use" className="text-white/70 hover:text-white text-sm transition-colors">
            Terms of Use
          </Link>
        </div>

        {/* Copyright and Logo */}
        <div className="border-t border-white/20 pt-6 flex items-center justify-between">
          <p className="text-white/50 text-sm">
            © {currentYear} Cry808. All rights reserved.
          </p>
          <img src={logo} alt="CRY808" className="h-12" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;

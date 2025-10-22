import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Links */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mb-6">
          <Link to="/" className="text-white/70 hover:text-white text-sm transition-colors">
            About
          </Link>
          <Link to="/" className="text-white/70 hover:text-white text-sm transition-colors">
            Advertise
          </Link>
          <Link to="/" className="text-white/70 hover:text-white text-sm transition-colors">
            Privacy & Policy
          </Link>
          <Link to="/" className="text-white/70 hover:text-white text-sm transition-colors">
            Submit Music
          </Link>
          <Link to="/" className="text-white/70 hover:text-white text-sm transition-colors">
            Contact
          </Link>
          <Link to="/" className="text-white/70 hover:text-white text-sm transition-colors">
            DMCA
          </Link>
          <Link to="/" className="text-white/70 hover:text-white text-sm transition-colors">
            Terms of Use
          </Link>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 pt-6">
          <p className="text-white/50 text-sm">
            © {currentYear} Cry808. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

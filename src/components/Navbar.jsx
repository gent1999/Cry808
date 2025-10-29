import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/cry808_logo.png";

const API_URL = import.meta.env.VITE_API_URL;

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Detect scroll for navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setShowSearchResults(false);
    setSearchQuery('');
  }, [location]);

  // Search functionality
  useEffect(() => {
    const searchArticles = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/articles`);
        const data = await response.json();

        const filtered = data.articles
          .filter(article =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
          )
          .slice(0, 5);

        setSearchResults(filtered);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Search error:', error);
      }
    };

    const debounce = setTimeout(searchArticles, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const isActive = (path) => location.pathname === path;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      navigate(`/article/${searchResults[0].id}`);
      setShowSearchResults(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-black/95 backdrop-blur-md border-b border-purple-500/20 shadow-lg shadow-purple-500/10'
        : 'bg-black/80 backdrop-blur-sm border-b border-white/10'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src={logo}
              alt="CRY808"
              className="h-16 transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Search Bar & Nav Links */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-4xl mx-8">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                placeholder="Search articles, interviews..."
                className="w-full px-4 py-2 pl-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-gray-900 border border-purple-500/30 rounded-lg shadow-2xl overflow-hidden z-50">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => {
                        navigate(`/article/${result.id}`);
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                      className="px-4 py-3 hover:bg-purple-600/20 cursor-pointer border-b border-white/5 last:border-0 transition-colors"
                    >
                      <div className="font-medium text-white line-clamp-1">{result.title}</div>
                      <div className="text-xs text-white/50 mt-1">
                        {result.category === 'interview' ? '🎤 Interview' : '📰 Article'} • By {result.author}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showSearchResults && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="absolute top-full mt-2 w-full bg-gray-900 border border-purple-500/30 rounded-lg shadow-2xl p-4 text-center text-white/50 text-sm z-50">
                  No results found for "{searchQuery}"
                </div>
              )}
            </form>

            {/* Nav Links */}
            <div className="flex items-center space-x-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive('/')
                    ? 'text-white bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                Home
              </Link>
              <Link
                to="/news"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive('/news')
                    ? 'text-white bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                News
              </Link>
              <Link
                to="/interviews"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive('/interviews')
                    ? 'text-white bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                Interviews
              </Link>
              <Link
                to="/about"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive('/about')
                    ? 'text-white bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive('/contact')
                    ? 'text-white bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-all"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${
          isMenuOpen ? 'max-h-64 pb-4' : 'max-h-0'
        }`}>
          <div className="flex flex-col space-y-2 pt-2">
            <Link
              to="/"
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                isActive('/')
                  ? 'text-white bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/news"
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                isActive('/news')
                  ? 'text-white bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              News
            </Link>
            <Link
              to="/interviews"
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                isActive('/interviews')
                  ? 'text-white bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Interviews
            </Link>
            <Link
              to="/about"
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                isActive('/about')
                  ? 'text-white bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                isActive('/contact')
                  ? 'text-white bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

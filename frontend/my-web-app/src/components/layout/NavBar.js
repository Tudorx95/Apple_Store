import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import '../../assets/css/NavBar.css';
import logo from '../../assets/logo_dynamic.gif';
import searchIcon from '../../assets/searchLoop.png';
import personIcon from '../../assets/personIcon.jpg';
import cartIcon from '../../assets/cartIcon.png';
import { useAuth } from '../../models/AuthProvider';

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [authPopupOpen, setAuthPopupOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { token, isTokenExpired, logout } = useAuth();
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    if (mobileSearchOpen) setMobileSearchOpen(false);
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
    if (menuOpen) setMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  const handleAuthClick = () => {
    setAuthPopupOpen(true);
  };

  const closeAuthPopup = () => {
    setAuthPopupOpen(false);
  };
  
  const handleAuthenticate = () => {
    if (token && !isTokenExpired(token)) {
      navigate("dashboard");
    } else {
      logout();
      navigate("login");
    }
    setAuthPopupOpen(false);
  };

  const handleCart = () => {
    navigate('cart');
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
    setAuthPopupOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setAuthPopupOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle clicks outside of the menu to close it on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('.nav-menu') && 
          !event.target.closest('.menu-icon')) {
        setMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    const productType = searchTerm.toLowerCase().includes('macbook')
      ? 'macbook'
      : searchTerm.toLowerCase().includes('ipad')
      ? 'ipad'
      : searchTerm.toLowerCase().includes('iphone')
      ? 'iphone'
      : 'macbook';

    navigate(`/${productType}?model=${searchTerm}`);
    setMobileSearchOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={scrollToTop}>
          <img src={logo} alt="Logo" className="navbar-logo-img" />
        </Link>

        {/* Mobile Menu Icon */}
        <div className="menu-icon" onClick={toggleMenu}>
          <div className={`hamburger ${menuOpen ? 'active' : ''}`}>
            <span className="line"></span>
            <span className="line"></span>
            <span className="line"></span>
          </div>
        </div>

        {/* Menu Items */}
        <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/macbook" className="nav-link" onClick={() => { scrollToTop(); setMenuOpen(false); }}>
            MacBook
          </Link>
          <Link to="/ipad" className="nav-link" onClick={() => { scrollToTop(); setMenuOpen(false); }}>
            iPad
          </Link>
          <Link to="/iphone" className="nav-link" onClick={() => { scrollToTop(); setMenuOpen(false); }}>
            iPhone
          </Link>

          {/* Vertical Bar - Only visible on desktop */}
          <div className="vertical-bar"></div>

          {/* Contact and Service Links */}
          <Link to="/contact" className="nav-link" onClick={() => { scrollToTop(); setMenuOpen(false); }}>Contact</Link>
          <Link to="/about" className="nav-link" onClick={() => { scrollToTop(); setMenuOpen(false); }}>About Us</Link>
          
          {/* Mobile-only action buttons */}
          <div className="mobile-actions">
            <button className="mobile-action-btn search-mobile-btn" onClick={toggleMobileSearch}>
              <img src={searchIcon} alt="Search" />
              <span>Search</span>
            </button>
            <button className="mobile-action-btn" onClick={handleAuthClick}>
              <img src={personIcon} alt="User" />
              <span>Account</span>
            </button>
            <button className="mobile-action-btn" onClick={handleCart}>
              <img src={cartIcon} alt="Cart" />
              <span>Cart</span>
            </button>
          </div>
        </div>

        {/* Desktop Action Buttons */}
        <div className="navbar-actions">
          <SearchBar onSearch={handleSearch} />
          <button className="user-btn" onClick={handleAuthClick}>
            <img src={personIcon} alt="User" className="navbar-user-avatar" />
          </button>
          <button className="cart-btn" onClick={handleCart}>
            <img src={cartIcon} alt="Cart" className="navbar-cart-icon" />
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="mobile-search-container">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">
              <img src={searchIcon} alt="Search" />
            </button>
          </form>
        </div>
      )}

      {/* Authentication Pop-up */}
      {authPopupOpen && (
        <div className="auth-popup-overlay" onClick={closeAuthPopup}>
          <div className="auth-popup" onClick={(e) => e.stopPropagation()}>
            {token && !isTokenExpired(token) ? (
              <>
                <button className="account-btn" onClick={handleAuthenticate}>
                  My Account
                </button>
                <button className="account-btn logout-btn" onClick={handleLogout}>
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button className="auth-btn" onClick={handleAuthenticate}>
                  Authenticate / Register
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
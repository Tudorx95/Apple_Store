import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import '../../assets/css/NavBar.css';
import logo from '../../assets/logo_dynamic.gif'; // Add your logo image path here
//import macbookIcon from '../../assets/images/macbook-icon.png'; // Add MacBook icon path here
//import ipadIcon from '../../assets/images/ipad-icon.png'; // Add iPad icon path here
//import iphoneIcon from '../../assets/images/iphone-icon.png'; // Add iPhone icon path here
import searchIcon from '../../assets/searchLoop.png'; // Add search icon path here
import personIcon from '../../assets/personIcon.jpg'; // Add person icon path here
import cartIcon from '../../assets/cartIcon.png'; // Add cart icon path here

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // State for search term
  const navigate = useNavigate();
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const scrollToTop = () => {
    window.scrollTo(0, 0); // Scroll to the top of the page
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const productType = searchTerm.toLowerCase().includes('macbook')
      ? 'macbook'
      : searchTerm.toLowerCase().includes('ipad')
      ? 'ipad'
      : searchTerm.toLowerCase().includes('iphone')
      ? 'iphone'
      : 'macbook'; // Default to MacBook if no specific type is found

    // Navigate to the product page with model filter as query parameter
    navigate(`/${productType}?model=${searchTerm}`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={scrollToTop}>
          <img src={logo} alt="Logo" className="navbar-logo-img" />
        </Link>

        {/* Menu Items */}
        <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/macbook" className="nav-link" onClick={scrollToTop}>
            MacBook
          </Link>
          <Link to="/ipad" className="nav-link" onClick={scrollToTop}>
            iPad
          </Link>
          <Link to="/iphone" className="nav-link" onClick={scrollToTop}>
            iPhone
          </Link>

          {/* Vertical Bar */}
          <div className="vertical-bar"></div>

          {/* Contact and Service Links */}
          <Link to="/contact" className="nav-link" onClick={scrollToTop}>Contact</Link>
          <Link to="/about" className="nav-link" onClick={scrollToTop}>About Us</Link>
        </div>

        {/* Action Buttons */}
        <div className="navbar-actions">
          <SearchBar onSearch={handleSearch} />
          <button className="user-btn">
            <img src={personIcon} alt="User" className="navbar-user-avatar" />
          </button>
          <button className="cart-btn">
            <img src={cartIcon} alt="Cart" className="navbar-cart-icon" />
          </button>
        </div>

        {/* Mobile Menu Icon */}
        <div className="menu-icon" onClick={toggleMenu}>
          <i className={menuOpen ? 'fas fa-times' : 'fas fa-bars'} />
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

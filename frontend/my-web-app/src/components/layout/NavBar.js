import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="Logo" className="navbar-logo-img" />
        </Link>

        {/* Menu Items */}
        <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/macbook" className="nav-link">
            MacBook
          </Link>
          <Link to="/ipad" className="nav-link">
            iPad
          </Link>
          <Link to="/iphone" className="nav-link">
            iPhone
          </Link>

          {/* Vertical Bar */}
          <div className="vertical-bar"></div>

          {/* Contact and Service Links */}
          <Link to="/contact" className="nav-link">Contact</Link>
          <Link to="/service" className="nav-link">Service</Link>
        </div>

        {/* Action Buttons */}
        <div className="navbar-actions">
          <button className="search-btn">
            <img src={searchIcon} alt="Search" className="navbar-search-icon" />
          </button>
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

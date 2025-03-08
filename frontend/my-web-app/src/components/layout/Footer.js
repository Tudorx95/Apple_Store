// src/components/layout/Footer.js
import React from 'react';
import '../../assets/css/Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} AppleStore. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
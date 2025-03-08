import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/HomePage.css';
import Carousel from '../components/layout/Carousel'; // Assuming you will create a separate carousel component
import MainVideo from '../assets/appleStore_HomePage.mp4';
import WelcomeMessage from '../components/layout/WelcomeMessage';
import History from '../models/History';

const HomePage = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
  });
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Send data to the backend to store in the MySQL database
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData), 
    });

    if (response.ok) {
      alert('You have successfully subscribed!');
    } else {
      alert('User already subscribed!');
    }
  };

  return (
    <div className="home-page">
      {/* Cascading Welcome Message */}

      {/* Video Section */}
      <div className="video-section">
       {/* Add WelcomeMessage component here */}
        <WelcomeMessage />
        <video autoPlay loop muted>
          <source src={MainVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Carousel Section */}
      <div className="carousel-section no-padding">
        <Carousel />
      </div>

      {/* Newsletter Subscription Form */}
      <div className="newsletter-form">
        <h2>Subscribe to Our Newsletter</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="firstname"
            placeholder="First Name"
            value={formData.firstname}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastname"
            placeholder="Last Name"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <button type="submit">Subscribe</button>
        </form>
      </div>

      {/* Footer Section */}
      <div className='bottom-part'>
        <h2>Apple Founders' History</h2>
          <div className='history-videos'>
            <History videoId="CeSAjK2CBEA" width='900'/>
            <History videoId="pJif4i9NRdI" width='900'/>
          </div>
      </div>
      
    </div>
  );
};

export default HomePage;

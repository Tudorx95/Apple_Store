import React, {useState, useEffect} from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import '../assets/css/ContactPage.css';
import { useLocation } from 'react-router-dom';

const ContactPage = () => {
  // Example locations - replace with your actual store locations
  const location = useLocation(); 

  const [locations, setStores] = useState([]);
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/contact`); // Replace with your backend URL
        if (!response.ok) throw new Error('Failed to fetch store data');
        const data = await response.json();
        setStores(data);
      } catch (error) {
        console.error('Error fetching store data:', error);
      }
    };

    fetchStores();
  }, []);
  
  // Map container style
  const mapContainerStyle = {
    width: '100%',
    height: '500px'
  };

  // Default center (you can set this to the center of your country)
  const center = {
    lat: 39.8283,
    lng: -98.5795 // Approximate center of the US
  };

  // Map options
  const options = {
    disableDefaultUI: false,
    zoomControl: true,
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Our Store Locations</h1>
        <p className="contact-description">
          Visit our Apple stores across the country for personalized service and expert advice. 
          Our knowledgeable staff is ready to help you explore and experience the latest products.
          Check the map below to find the store nearest to you.
        </p>
      </div>

      <div className="map-container">
          <GoogleMap
          key={location.pathname}
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={4}
            options={options}
          >
            {locations.map((location, index) => (
              <Marker
                key={index}
                position={location.position}
                title={location.name}
              />
            ))}
          </GoogleMap>
      </div>

      <div className="store-locations">
        <h2>Store Information</h2>
        {locations.map((location, index) => (
          <div className="store-card" key={index}>
            <h3>{location.name}</h3>
            <p><strong>Address:</strong> {location.address}</p>
            <p><strong>Phone:</strong> {location.phone}</p>
            <p><strong>Hours:</strong> {location.hours}</p>
          </div>
        ))}
      </div>
      
      <div className="company-info">
        <h2>Customer Support</h2>
        <div className="info-container">
          <div className="info-item">
            <h3>Phone Support</h3>
            <p>Technical Support: +1 (800) 555-0123</p>
            <p>Customer Service: +1 (800) 555-0124</p>
            <p>Hours: Monday-Friday 8AM-8PM, Saturday 9AM-5PM</p>
          </div>
          
          <div className="info-item">
            <h3>Headquarters</h3>
            <p>Apple Inc.</p>
            <p>One Apple Park Way</p>
            <p>Cupertino, CA 95014</p>
            <p>United States</p>
          </div>
          
          <div className="info-item">
            <h3>Email Support</h3>
            <p>General Inquiries: info@apple.com</p>
            <p>Technical Support: support@apple.com</p>
            <p>Business Inquiries: business@apple.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
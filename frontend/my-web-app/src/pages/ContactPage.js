import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import '../assets/css/ContactPage.css';
import { useLocation } from 'react-router-dom';

const ContactPage = () => {
  const location = useLocation();
  const [locations, setStores] = useState([]);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/contact`);
        if (!response.ok) throw new Error('Failed to fetch store data');
        const data = await response.json();
        setStores(data);
      } catch (error) {
        console.error('Error fetching store data:', error);
      }
    };

    fetchStores();
  }, []);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (map && locations.length > 0 && window.google) {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));
      setMarkers([]);

      const bounds = new window.google.maps.LatLngBounds();
      const newMarkers = [];

      locations.forEach((location) => {
        const position = new window.google.maps.LatLng(
          location.position.lat,
          location.position.lng
        );

        // Create marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';
        markerElement.innerHTML = `
          <div class="marker-pin"></div>
          <div class="marker-label">${location.name}</div>
        `;

        // Create advanced marker
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          map,
          position,
          title: location.name,
          content: markerElement
        });

        // Add click listener using the correct event
        marker.addListener('gmp-click', () => {
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div class="info-window">
                <h3>${location.name}</h3>
                <p><strong>Address:</strong> ${location.address}</p>
                <p><strong>Phone:</strong> ${location.phone}</p>
                <p><strong>Hours:</strong> ${location.hours}</p>
              </div>
            `
          });
          infoWindow.open(map, marker);
        });

        bounds.extend(position);
        newMarkers.push(marker);
      });

      setMarkers(newMarkers);
      map.fitBounds(bounds);
    }
  }, [map, locations]);

  const mapContainerStyle = {
    width: '100%',
    height: '500px'
  };

  const center = {
    lat: 39.8283,
    lng: -98.5795
  };

  const options = {
    disableDefaultUI: false,
    zoomControl: true,
    mapId: process.env.REACT_APP_GOOGLE_MAPS_ID
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
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={4}
          options={options}
          onLoad={onLoad}
          onUnmount={onUnmount}
        />
      </div>

      <div className="store-locations">
        <h2>Store Information</h2>
        {locations.map((location, index) => (
          <div
            className="store-card"
            key={index}
            onClick={() => {
              if (map) {
                const position = new window.google.maps.LatLng(
                  location.position.lat,
                  location.position.lng
                );
                map.panTo(position);
                map.setZoom(15);
              }
            }}
          >
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
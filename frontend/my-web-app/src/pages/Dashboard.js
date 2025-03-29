// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../models/AuthProvider';
import '../assets/css/Dashboard.css';
import ModifyPersonalData from '../components/layout/PersonalData';
import AddressManagement from '../components/layout/AddressMng';

const Dashboard = () => {
  const { token, userId, logout } = useAuth(); // Get token and userId from context
  const [user, setUserData] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
        navigate("/login"); // Redirect if not logged in
        return;
    }

    // Fetch user details from backend
    const fetchUserData = async () => {
        const response = await fetch(`/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            const data = await response.json();
            setUserData(data);
           // console.log(data);
        } else {
            logout(); // Logout if unauthorized
            navigate("/login");
        }
    };

    fetchUserData();
}, [token, userId, navigate, logout]);

  

  const renderSection = () => {
    switch(activeSection) {
      case 'recent-orders':
        return (
          <div className="section-content">
            <h2>Comenzi recente</h2>
            <div className="empty-state">
              <p>Nu ai plasat nicio comandă.</p>
              <a href="/" className="go-to-home">Go to Home Page &gt;</a>
            </div>
          </div>
        );
      case 'personal-data':
        return (
          <ModifyPersonalData user={user}/>
        );
      case 'address':
        return (
         <AddressManagement user={user}/>
        );
      case 'my-orders':
        return (
          <div className="section-content">
            <h2>Comenzile mele</h2>
            <p>Urmărește și gestionează comenzile tale.</p>
          </div>
        );
      default:
        return null;
    }
  };

  const renderAdminDashboard = () => (
    <div className="dashboard-content">
      <h2>Admin Panel</h2>
      <button>Add New Product</button>
      <button>Manage Stock</button>
      {/* Simulate phpMyAdmin-like interface */}
    </div>
  );

  if (!user) {
    return <div>Loading...</div>; // You can display a loading indicator while user data is being fetched
  }

  return (
    <div className="control-panel">
      <div className="dashboard-container">
      <div className="user-header">
        <div className="user-circle">{user.firstname[0]}{user.lastname[0]}</div>
        <div className="user-info">
          <h1>{user.lastname} {user.firstname}</h1>
          <p>{user.email}</p>
        </div>
      </div>
        <div className="sidebar">
          <ul>
            <li 
              className={activeSection === 'recent-orders' ? 'active' : ''}
              onClick={() => setActiveSection('recent-orders')}
            >
              Recent orders
            </li>
            <li 
              className={activeSection === 'personal-data' ? 'active' : ''}
              onClick={() => setActiveSection('personal-data')}
            >
              Personal data
            </li>
            <li 
              className={activeSection === 'address' ? 'active' : ''}
              onClick={() => setActiveSection('address')}
            >
              Address
            </li>
            <li 
              className={activeSection === 'my-orders' ? 'active' : ''}
              onClick={() => setActiveSection('my-orders')}
            >
              My orders
            </li>
          </ul>
        </div>
        <div className="main-content">
          <div className="centered-content">
              {renderSection()}
          </div>
        </div>
      </div>
    </div>

  );
};

export default Dashboard;
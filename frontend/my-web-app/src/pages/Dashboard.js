// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../models/AuthProvider';
import '../assets/css/Dashboard.css';
import ModifyPersonalData from '../components/layout/PersonalData';
import AddressManagement from '../components/layout/AddressMng';
import MyOrders from '../components/layout/MyOrders';
import RecentOrders from '../components/layout/RecentOrders';
import AdminDashboard from '../components/layout/AdminDashboard';

const Dashboard = () => {
  const { token, userId, logout } = useAuth(); // Get token and userId from context
  const [user, setUserData] = useState(null);
  const [activeSection, setActiveSection] = useState('recent-orders');
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
    if (user?.user_type === 2) { // Check if user is admin
      return <AdminDashboard />;
    }

    switch (activeSection) {
      case 'recent-orders':
        return <RecentOrders />;
      case 'personal-data':
        return <ModifyPersonalData user={user} />;
      case 'address':
        return <AddressManagement user={user} />;
      case 'my-orders':
        return <MyOrders />;
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

  // Return AdminDashboard directly for admin users

  if (user.user_type === 2) {
    return <AdminDashboard />;
  }

  return (
    <div className="dashboard-page">
      {/* Combined sidebar container */}
      <div className="dashboard-sidebar">
        {/* User header section */}
        <div className="dashboard-user-header">
          <div className="dashboard-user-circle">{user.firstname[0]}{user.lastname[0]}</div>
          <div className="dashboard-user-info">
            <h1>{user.lastname} {user.firstname}</h1>
            <p>{user.email}</p>
          </div>
        </div>

        {/* Navigation options */}
        <nav className="dashboard-nav">
          <ul>
            <li className={activeSection === 'recent-orders' ? 'active' : ''}
              onClick={() => setActiveSection('recent-orders')}>
              Recent orders
            </li>
            <li className={activeSection === 'personal-data' ? 'active' : ''}
              onClick={() => setActiveSection('personal-data')}>
              Personal data
            </li>
            <li className={activeSection === 'address' ? 'active' : ''}
              onClick={() => setActiveSection('address')}>
              Address
            </li>
            <li className={activeSection === 'my-orders' ? 'active' : ''}
              onClick={() => setActiveSection('my-orders')}>
              My orders
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content area */}
      <div className="dashboard-main">
        <div className="dashboard-centered-content">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
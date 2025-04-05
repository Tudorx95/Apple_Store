import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/NavBar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import Loading from './components/layout/Loading';
import './assets/css/App.css';
import { LoadScript } from '@react-google-maps/api';
import ProductsPage from './pages/ProductsPage';
import ProductDetails from './pages/ProductDetails';
import { ProductProvider } from './models/ProductContext';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './models/AuthProvider';
import Cart from './pages/Cart';
import TransactionPage from './pages/TransactionPage';

// Define libraries array outside component to keep it static
const libraries = ['places', 'marker'];

function App() {
  const [loading, setLoading] = useState(true);
  const [envError, setEnvError] = useState(null);

  useEffect(() => {
    // Check environment variables when component mounts
    console.log('Checking environment variables...');
    console.log('GOOGLE_MAPS_API_KEY:', process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? 'Defined' : 'Undefined');

    if (!process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
      setEnvError('Google Maps API key is not defined in environment variables');
      console.error('Google Maps API key is not defined in environment variables');
    }

    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  if (envError) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Environment Error</h2>
        <p>{envError}</p>
        <p>Please ensure your .env file is properly configured and the application has been restarted.</p>
      </div>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
      onLoad={() => console.log('Google Maps script loaded successfully')}
      onError={(error) => console.error('Error loading Google Maps script:', error)}
    >
      <Router>
        <div className="app-container">
          {loading ? (
            <Loading />
          ) : (
            <>
              <AuthProvider>
                <Navbar />
                <main className="main-content">
                  <ProductProvider>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/macbook" element={<ProductsPage />} />
                      <Route path="/ipad" element={<ProductsPage />} />
                      <Route path="/iphone" element={<ProductsPage />} />
                      <Route path='/cart' element={<Cart />} />
                      <Route path="/service" element={<div>Service Page (Coming Soon)</div>} />
                      <Route path="/product/:deviceType/:productId" element={<ProductDetails />} />
                      <Route path='/order-confirmation' element={<TransactionPage />} />
                    </Routes>
                  </ProductProvider>
                </main>
                <Footer />
              </AuthProvider>
            </>
          )}
        </div>
      </Router>
    </LoadScript>
  );
}

export default App;
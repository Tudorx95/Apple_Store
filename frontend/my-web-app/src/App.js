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
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './models/AuthProvider';
import Cart from './pages/Cart';
import TransactionPage from './pages/TransactionPage';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading process (e.g., fetch data or initialize app)
    setTimeout(() => {
      setLoading(false);
    }, 2000); // Set the time according to your needs (in ms)
  }, []);

  return (

    <Router>
      <div className="app-container">
      {loading ? (
          <Loading /> // Show Loading component while loading
        ) : (
          <>
          <AuthProvider>
          <Navbar />
          <LoadScript googleMapsApiKey="AIzaSyDF2NfsIYJbLAaBBvXj7dGD9vMOR1y53W0">
            <main className="main-content">
            <ProductProvider>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} /> {/* Add the new route */}
                {/* Add other routes for MacBook, iPad, iPhone, and Service pages */}
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
            </LoadScript>
          </AuthProvider>
          </>
        )}
      </div>
    </Router>
    
  );
}

export default App;
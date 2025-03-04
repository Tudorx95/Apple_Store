import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/NavBar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import Loading from './components/layout/Loading';
import './assets/css/App.css';

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
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
              </Routes>
            </main>
            <Footer />
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
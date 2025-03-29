import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/css/LoginPage.css'
import { useAuth } from '../models/AuthProvider';

const LoginPage = () => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState({ success: false, message: '' });
  const [showResetForm, setShowResetForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState(new URLSearchParams(window.location.search).get('token'));
  const {login} = useAuth();
  const navigate = useNavigate();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleForgotPassword = async () => {
    const response = await fetch('/send-reset-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetEmail }),
    });
  
    const result = await response.json();
    if (response.ok) {
      console.log(result.message);
      setResetStatus({ success: true, message: result.message });
      setShowResetForm(true);  // Show the new password fields
    } else {
      console.error(result.message);
      setResetStatus({ success: false, message: result.message });
    }
  };
  


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.identifier || !formData.password) {
      setErrors({
          identifier: !formData.identifier ? 'Email or phone is required' : '',
          password: !formData.password ? 'Password is required' : ''
      });
      return;
  }
   
   try{

     const response = await fetch('/login', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        login(result.token, result.id); // Store in React Context
        navigate('/dashboard');
      } else {
        alert(result.message);
      }
    }catch(error){
      console.error("Login error:", error);
    } 
  };

  const handleRegister=()=>{
    navigate('/register');
  };

  // Handle reset password form submission
const handleResetPassword = async (e) => {
    e.preventDefault();
  
    if (newPassword !== confirmPassword) {
      setResetStatus({ success: false, message: 'Passwords do not match' });
      return;
    }
  
    const response = await fetch('/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetToken, newPassword }),
    });
  
    const result = await response.json();
    if (response.ok) {
      //console.log(result.message);
      setResetStatus({ success: true, message: result.message });
    } else {
      //console.error(result.message);
      setResetStatus({ success: false, message: result.message });
    }
  };

useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setForgotPasswordOpen(false); // Close the search bar
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);
  
  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Login</h2>

        {errors.form && <div className="error-message">{errors.form}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email or Phone</label>
            <input
              type="text"
              name="identifier"
              placeholder="Enter your email or phone"
              value={formData.identifier}
              onChange={handleChange}
              className={errors.identifier ? 'input-error' : ''}
            />
            {errors.identifier && <p className="error-text">{errors.identifier}</p>}
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <button type="button" className="forgot-password" onClick={() => setForgotPasswordOpen(true)}>
            Forgot Password?
          </button>

          <button type="submit" className="login-button">Log In</button>

          <p className="register-text">
            Don't have an account?
            <button className="register-button" onClick={handleRegister}>Register</button>
          </p>
        </form>
      </div>
      
      {forgotPasswordOpen && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>{showResetForm ? 'Reset Your Password' : 'Reset Password'}</h3>
      <p>{showResetForm ? 'Enter your new password below.' : 'Enter your email to receive a temporary password.'}</p>

      {/* Email Input */}
      {!showResetForm && (
        <>
          <input
            type="email"
            placeholder="your@email.com"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
          {resetStatus.message && (
            <p className={resetStatus.success ? 'success-message' : 'error-message'}>
              {resetStatus.message}
            </p>
          )}
        </>
      )}

      {/* New Password Fields */}
      {showResetForm && (
        <>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {resetStatus.message && (
            <p className={resetStatus.success ? 'success-message' : 'error-message'}>
              {resetStatus.message}
            </p>
          )}
        </>
      )}

      <div className="modal-buttons">
        <button onClick={() => setForgotPasswordOpen(false)}>Cancel</button>
        {!showResetForm ? (
          <button onClick={handleForgotPassword}>Send</button>
        ) : (
          <button onClick={handleResetPassword}>Reset Password</button>
        )}
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default LoginPage;

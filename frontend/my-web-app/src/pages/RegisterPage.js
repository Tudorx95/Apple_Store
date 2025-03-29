import React, { useState } from 'react';
import '../assets/css/RegisterPage.css'; // Import CSS file

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    user_type: 1, // Default user type
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigateTo = (path) => {
    window.location.href = path;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstname.trim()) newErrors.firstname = 'First name is required';
    if (!formData.lastname.trim()) newErrors.lastname = 'Last name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (formData.phone && !/^\+?[0-9]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { confirmPassword, ...dataToSend } = formData; // Remove confirmPassword from the data
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        alert('Registration successful! Please log in.');
        navigateTo('/login');
      } else {
        const errorData = await response.json();
        setErrors({ form: errorData.message || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ form: 'An error occurred. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>Create an Account</h2>

        {errors.form && <div className="error-message">{errors.form}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              className={`input-field ${errors.firstname ? 'input-error' : ''}`}
              type="text"
              name="firstname"
              placeholder="First Name *"
              value={formData.firstname}
              onChange={handleChange}
            />
            {errors.firstname && <p className="error-message">{errors.firstname}</p>}
          </div>

          <div className="input-group">
            <input
              className={`input-field ${errors.lastname ? 'input-error' : ''}`}
              type="text"
              name="lastname"
              placeholder="Last Name *"
              value={formData.lastname}
              onChange={handleChange}
            />
            {errors.lastname && <p className="error-message">{errors.lastname}</p>}
          </div>

          <div className="input-group">
            <input
              className={`input-field ${errors.email ? 'input-error' : ''}`}
              type="email"
              name="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          <div className="input-group">
            <input
              className={`input-field ${errors.password ? 'input-error' : ''}`}
              type="password"
              name="password"
              placeholder="Password *"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>

          <div className="input-group">
            <input
              className={`input-field ${errors.confirmPassword ? 'input-error' : ''}`}
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password *"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
          </div>

          <div className="input-group">
            <input
              className={`input-field ${errors.phone ? 'input-error' : ''}`}
              type="tel"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
            />
            {errors.phone && <p className="error-message">{errors.phone}</p>}
          </div>

          <div className="input-group">
            <textarea
              className="input-field"
              name="address"
              placeholder="Address"
              rows="3"
              value={formData.address}
              onChange={handleChange}
            ></textarea>
          </div>

          <button className="register-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Register'}
          </button>

          <div className="login-redirect">
            <p>
              Already have an account?{' '}
              <button type="button" onClick={() => navigateTo('/login')}>
                Log In
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;

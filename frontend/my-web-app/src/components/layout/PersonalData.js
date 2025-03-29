import React, { useState } from 'react';
import '../../assets/css/ModifyPersonalData.css';
import { useNavigate } from 'react-router-dom';

const ModifyPersonalData = ({user}) => {
    const [firstName, setFirstName] = useState(user.firstname || '');
    const [lastName, setLastName] = useState(user.lastname || '');
    const [email, setEmail] = useState(user.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();


    const validateForm = () => {
      const newErrors = {};
      
      if (!newPassword) {
          newErrors.newPassword = 'Password is required';
      } else if (newPassword.length < 8) {
          newErrors.newPassword = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(newPassword)) {
          newErrors.newPassword = 'Password must contain uppercase, lowercase, number, and special character';
      }

      return newErrors;
  };

    const handleSave = async (e) => {
        e.preventDefault();
      
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Create an object with the data to be updated
        const updatedUserData = {
          firstName,
          lastName,
          email,
          currentPassword,
          newPassword,
        };
      
        try {
          // Send POST request to the backend to update the user data
          const response = await fetch('/api/updateUser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUserData),
          });
      
          if (!response.ok) {
            throw new Error('Failed to update user data');
          }
      
          const result = await response.json();
          alert('Your data has been successfully updated!');
          // then refresh the page for the new credentials
          window.location.reload();
        } catch (error) {
          alert('An error occurred while updating your data.');
        }
      };
      

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
          'Are you sure you want to delete your account? This action cannot be undone.'
        );
      
        if (confirmed) {
          try {
            // Send POST request to delete the account
            const response = await fetch('/api/deleteAccount', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId: user.id }), // Assuming `user.id` is available
            });
      
            if (!response.ok) {
              throw new Error('Failed to delete account');
            }
      
            const result = await response.json();
            alert('Your account has been deleted!');
            // Optionally, log the user out or redirect to a different page
            navigate('/login');
          } catch (error) {
            alert('An error occurred while deleting the account.');
          }
        }
      };
      

  return (
    <div className="modify-personal-data">
      <div className="personal-info-section">
        <h2>Personal Data</h2>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label>Firstname</label>
              <input 
                type="text" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>Lastname</label>
              <input 
                type="text" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
              />
            </div>
          </div>
        </form>
      </div>

      <div className="password-change-section">
        <h2>Change password</h2>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="tudorlepadatu@yahoo.com"
              disabled
            />
          </div>
          
          <div className="form-group password-input">
            <label>Current Password</label>
            <input 
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
            />
            <button 
              type="button" 
              className="toggle-password"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? '👁️' : '👁️'}
            </button>
          </div>
          
          <div className="form-group password-input">
            <label>New Password</label>
            <input 
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
            />
            <button 
              type="button" 
              className="toggle-password"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? '👁️' : '👁️'}
            </button>
            {errors.newPassword && <p className="error-text">{errors.newPassword}</p>}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-save">Save Changes</button>
          </div>
        </form>
      </div>

      <div className="delete-account-section">
        <h2>Delete account</h2>
        <p>Your account will be permanently deleted. Once deleted, it cannot be recovered. Are you sure?</p>
        <button 
          className="btn-delete-account"
          onClick={handleDeleteAccount}
        >
          Delete My account
        </button>
      </div>
    </div>
  );
};

export default ModifyPersonalData;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../assets/css/AddressMng.css';

const AddressForm = ({ user, setShowForm, editingAddress, setEditingAddress, setAddresses, counties, allCities, addresses }) => {
  axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
  const [userType, setUserType] = useState(editingAddress?.type || 'normal_person');
  const [defaultType, setDefaultType] = useState(
    editingAddress?.is_default_delivery ? 'delivery' : 
    editingAddress?.is_default_billing ? 'billing' : null
  );
  const [formData, setFormData] = useState({
    county: editingAddress?.county || '',
    city: editingAddress?.city || '',
    full_address: editingAddress?.full_address || '',
    phone_number: editingAddress?.phone_number || ''
  });
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addressLimitReached, setAddressLimitReached] = useState(false);
  const [existingAddresses, setExistingAddresses] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Replace the current error state with:
const [formErrors, setFormErrors] = useState({});


  useEffect(() => {
    if (editingAddress?.county) {
      handleCountyChange(editingAddress.county, true);
    }
  }, [editingAddress]);

  const handleCountyChange = async (county, isInitial = false) => {
    const countyId = counties.find(c => c.name === county)?.id;
    const filterCities = allCities.filter(city => city.county_id === countyId);
    setCities(filterCities);
    if (!isInitial) {
      setFormData(prev => ({ ...prev, county, city: '' }));
    }   
    setFormErrors(prev => ({ ...prev, county: '' }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.county) errors.county = 'County is required';
    if (!formData.city) errors.city = 'City is required';
    if (!formData.full_address) errors.full_address = 'Full address is required';
    if (!formData.phone_number) {
      errors.phone_number = 'Phone number is required';
    } else if (!/\+407\d{8}/.test(formData.phone_number)) {
      errors.phone_number = 'Phone must be in format +407xxxxxxxx';
    }
    if (!defaultType) errors.defaultType = 'Please select delivery or billing type';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createNewAddress = async (address) => { 
    setLoading(true);
    setError(null);
    
    try {
      const isDefaultDelivery = defaultType === 'delivery';
      const isDefaultBilling = defaultType === 'billing';
      
      let response;
      if (editingAddress || address) {
        // Update existing address
        const addressID= (editingAddress ? editingAddress.id : address.id);
        response = await axios.put(`/api/addresses/update-default/${addressID}`, {
          ...formData,
          userType
          
        });
      } else {
        // Create new address
        response = await axios.post('/api/addresses', {
          ...formData,
          user_id: user.id,
          userType
          
        });
        
      }

      // Handle delivery types
      const addressId = editingAddress?.id || (await axios.get(`/api/addresses/last-inserted/${user.id}`)).data;
      const addressType = defaultType ? `default_${defaultType}` : 'delivery';
      
      // Clear existing delivery types if editing
    //   if (editingAddress) {
    //     await axios.delete(`/api/address-delivery/${addressId}`);
    //   }
      
      // Add new delivery type
      if (defaultType) {
        const deliveryTypeResponse = await axios.get(`/api/delivery-types/${addressType}`);
        
        await axios.post('/api/address-delivery', {
          address_id: addressId,
          delivery_type_id: deliveryTypeResponse.data
        });
      }

      // Refresh addresses
      const updatedAddresses = await axios.get(`/api/addresses/${user.id}`);
      setAddresses(updatedAddresses.data);
      
      // Reset form
      setFormData({ county: '', city: '', full_address: '', phone_number: '' });
      setShowForm(false);
      setEditingAddress(null);
    } catch (error) {
      console.error('Error saving address', error);
      setError(`Failed to save address: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!defaultType) {
        setError('Please select either Default Delivery or Default Billing');
        return;
    }
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
       // adding a new address considering a limit
      if (!editingAddress) {
        // Check address limit for new addresses
        const limitCheck = await axios.get(`/api/addresses/check-limit/${user.id}/${userType}`);
        if (limitCheck.data.hasReachedLimit) {
          const existingResponse = await axios.get(`/api/addresses/${user.id}`);
          const sameTypeAddresses = existingResponse.data.filter(addr => addr.type === userType);
          setExistingAddresses(sameTypeAddresses);
          setAddressLimitReached(true);
          setShowConfirmation(true);
          return;
        }
      }
      
      await createNewAddress();
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to process address');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExisting = async (address) => {
    try {
      setLoading(true);      
      await createNewAddress(address);
    } catch (error) {
      console.error('Error updating address', error);
      setError('Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="address-form">
      <h2>{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
      <div className="address-type-selector">
        <button 
          className={userType === 'normal_person' ? 'active' : ''} 
          onClick={() => setUserType('normal_person')}
        >
          Normal Person
        </button>
        <button 
          className={userType === 'legal_person' ? 'active' : ''} 
          onClick={() => setUserType('legal_person')}
        >
          Legal Person
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <select 
            name="county" 
            value={formData.county} 
            onChange={(e) => handleCountyChange(e.target.value)} 
            required
          >
            <option value="">Select County</option>
            {counties.map(county => (
              <option key={county.id} value={county.name}>{county.name}</option>
            ))}
          </select>
          <select 
            name="city" 
            value={formData.city} 
            onChange={handleInputChange} 
            required 
            disabled={!formData.county}
          >
            <option value="">Select City</option>
            {cities.map(city => (
              <option key={city.id} value={city.name}>{city.name}</option>
            ))}
          </select>
          {formErrors.county && <span className="error-message">{formErrors.county}</span>}
        </div>
        
        <div className="form-row">
          <input 
            type="text" 
            name="full_address" 
            value={formData.full_address} 
            onChange={handleInputChange} 
            placeholder="Full Address" 
            required 
          />
          <input 
            type="tel" 
            name="phone_number" 
            value={formData.phone_number} 
            onChange={handleInputChange} 
            placeholder="ex: +407xxxxxxxx" 
            pattern="\+407\d{8}" 
            required 
          />
        </div>
        
        <div className="form-row">
          <button
            type="button"
            className={`square-btn ${defaultType === 'delivery' ? 'active' : ''}`}
            onClick={() => setDefaultType(defaultType === 'delivery' ? null : 'delivery')}
          >
            Default Delivery
          </button>
          <button
            type="button"
            className={`square-btn ${defaultType === 'billing' ? 'active' : ''}`}
            onClick={() => setDefaultType(defaultType === 'billing' ? null : 'billing')}
          >
            Default Billing
          </button>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="back-btn" 
            onClick={() => {
              setShowForm(false);
              setEditingAddress(null);
            }}
          >
            Back
          </button>
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save Address'}
          </button>
        </div>
      </form>

      {showConfirmation && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <h3>Address Limit Reached</h3>
            <p>
              You've reached the maximum number of addresses ({existingAddresses.length}) 
              for {userType === 'normal_person' ? 'Normal Person' : 'Legal Person'} type.
            </p>
            <p>Would you like to update one of your existing addresses instead?</p>
            
            <div className="existing-addresses">
              {existingAddresses.map(addr => (
                <div key={addr.id} className="address-option">
                  <p>{addr.full_address}, {addr.city}, {addr.county}</p>
                  <button 
                    onClick={() => handleUpdateExisting(addr)}
                    className="update-btn"
                  >
                    Update This Address
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => setShowConfirmation(false)}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default AddressForm;
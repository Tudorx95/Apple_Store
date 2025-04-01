import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../assets/css/AddressMng.css';
import AddressForm from './AddressForm';

const AddressManagement = ({ user }) => {
  axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [counties, setCounties] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Enhanced address data fetching
  const fetchAddresses = async () => {
    try {
      const response = await axios.get(`/api/addresses/${user.id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }finally {
      setLoading(false);
    }
  };

  // Enhanced delivery types fetching
  const fetchDeliveryTypes = async (addressId) => {
    try {
      const response = await axios.get(`/api/address-delivery/${addressId}`);
      if (response.data.length > 0) {
        const typeResponse = await axios.get(
          `/api/delivery-types/${response.data[0].delivery_type_id}`
        );
        return typeResponse.data?.map(t => t.name).filter(Boolean) || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching delivery types:', error);
      return [];
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  // Fetch data on component mount
  useEffect(() => {
    if (!user) return;
    
    const fetchInitialData = async () => {
      try {
        const [countiesResponse, cityResp] = await Promise.all([
          axios.get('/api/counties'),
          axios.get('/api/cities')
        ]);
        
        setAllCities(cityResp.data);
        setCounties(countiesResponse.data);
        
        // Fetch addresses with their delivery types
        const addressesData = await fetchAddresses();
        const addressesWithTypes = await Promise.all(
          addressesData.map(async (addr) => {
            const deliveryTypes = await fetchDeliveryTypes(addr.id);
            return {
              ...addr,
              deliveryTypes,
              // Ensure boolean values for default flags
              is_default_delivery: Boolean(addr.is_default_delivery),
              is_default_billing: Boolean(addr.is_default_billing)
            };
          })
        );
        
        setAddresses(addressesWithTypes);
        // Find default addresses and ensure UI state matches database state
        const defaultDelivery = addressesWithTypes.find(addr => addr.default_delivery);
        const defaultBilling = addressesWithTypes.find(addr => addr.default_billing);
        
        // If there's a default delivery address, update the UI state
        if (defaultDelivery) {
          setAddresses(prevAddresses => 
            prevAddresses.map(addr => ({
              ...addr,
              is_default_delivery: addr.id === defaultDelivery.id,
              deliveryTypes: addr.id === defaultDelivery.id 
                ? [...(addr.deliveryTypes || []), 'default_delivery'].filter((v, i, a) => a.indexOf(v) === i)
                : (addr.deliveryTypes || []).filter(type => type !== 'default_delivery')
            }))
          );
        }
        
        // If there's a default billing address, update the UI state
        if (defaultBilling) {
          setAddresses(prevAddresses => 
            prevAddresses.map(addr => ({
              ...addr,
              is_default_billing: addr.id === defaultBilling.id,
              deliveryTypes: addr.id === defaultBilling.id 
                ? [...(addr.deliveryTypes || []), 'default_billing'].filter((v, i, a) => a.indexOf(v) === i)
                : (addr.deliveryTypes || []).filter(type => type !== 'default_billing')
            }))
          );
        }
        
        setShowForm(addressesWithTypes.length === 0);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [user]);

  // Set default address with proper state updates
  const setDefaultAddress = async (addressId, addressType) => {
    try {
      setLoading(true);
      await axios.put(`/api/addresses/${addressId}/default`, { addressType });
      
      // Update addresses state immutably
      setAddresses(prevAddresses => 
        prevAddresses.map(addr => {
          const isCurrent = addr.id === addressId;
          return {
            ...addr,
            is_default_delivery: addressType === 'delivery' ? isCurrent : addr.is_default_delivery,
            is_default_billing: addressType === 'billing' ? isCurrent : addr.is_default_billing,
            deliveryTypes: isCurrent 
              ? [...(addr.deliveryTypes || []), `default_${addressType}`].filter((v, i, a) => a.indexOf(v) === i)
              : addr.deliveryTypes?.filter(type => type !== `default_${addressType}`) || []
          };
        })
      );
    } catch (error) {
      console.error('Error setting default address:', error);
      setError(error.response?.data?.message || 'Failed to update default address');
    } finally {
      setLoading(false);
    }
  };

  // Delete address with proper state updates
  const handleDeleteAddress = async (addressId) => {
    try {
      setLoading(true);
      await axios.delete(`/api/addresses/${addressId}`);
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
    } catch (error) {
      console.error('Error deleting address:', error);
      setError('Failed to delete address');
    } finally {
      setLoading(false);
    }
  };

  // Render address cards with proper state indicators
  const renderAddressCards = () => {
    return addresses.map(addr => {
      // Determine if address is default for delivery/billing
      console.log(addr)
      const isDelivery = addr.is_default_delivery || addr.deliveryTypes?.includes('default_delivery');
      const isBilling = addr.is_default_billing || addr.deliveryTypes?.includes('default_billing');

      return (
        <div 
          key={addr.id} 
          className={`address-card 
            ${isDelivery ? 'default-delivery' : ''} 
            ${isBilling ? 'default-billing' : ''}`}
        >
          <div className="address-header">
            <h4>
              {isDelivery && <span className="delivery-badge">DELIVERY</span>}
              {isBilling && <span className="billing-badge">BILLING</span>}
            </h4>
          </div>
          <div className="address-details">
            <p><strong>{addr.full_address}</strong></p>
            <p>{addr.city}, {addr.county}</p>
            <p>P: {user.phone}</p>
          </div>
          <div className="address-actions">
            {!isDelivery && (
              <button 
                className="set-delivery-btn"
                onClick={() => setDefaultAddress(addr.id, 'delivery')}
              >
                Set delivery address
              </button>
            )}
            {!isBilling && (
              <button 
                className="set-billing-btn"
                onClick={() => setDefaultAddress(addr.id, 'billing')}
              >
                Set billing address
              </button>
            )}
            <button 
              className="edit-btn"
              onClick={() => handleEditAddress(addr)}
            >
              Modify
            </button>
            <button 
              className="delete-btn"
              onClick={() => handleDeleteAddress(addr.id)}
            >
              Delete
            </button>
          </div>
        </div>
      );
    });
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="address-management">
      {showForm ? (
        <AddressForm 
          user={user} 
          setShowForm={setShowForm} 
          editingAddress={editingAddress}
          setEditingAddress={setEditingAddress}
          setAddresses={setAddresses}
          counties={counties}
          allCities={allCities}
        />
      ) : (
        <>
          <div className="addresses-container">
            {renderAddressCards()}
          </div>
          <button 
            className="add-address-btn" 
            onClick={() => {
              setEditingAddress(null);
              setShowForm(true);
            }}
            disabled={loading}
          >
            + Add new address
          </button>
        </>
      )}
    </div>
  );
};

export default AddressManagement;
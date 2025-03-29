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
  const [deliveryTypes, setDeliveryTypes] = useState({});

  // Fetch data on component mount
  useEffect(() => {
    if (!user) return;
    const fetchInitialData = async () => {
      try {
        const [countiesResponse, addressesResponse, cityResp] = await Promise.all([
          axios.get('/api/counties'),
          axios.get(`/api/addresses/${user.id}`),
          axios.get('/api/cities')
        ]);
        setAllCities(cityResp.data);
        setCounties(countiesResponse.data);
         // Fetch delivery types for each address
         const addressesWithTypes = await Promise.all(
          addressesResponse.data.map(async (addr) => {
            try{
              const deliveryResponse  = await axios.get(`/api/address-delivery/${addr.id}`);
              
              if (deliveryResponse .data.length > 0) {
                const typeResponse = await axios.get(`/api/delivery-types/${deliveryResponse.data[0].delivery_type_id}`);
                const deliveryTypes = typeResponse.data && Array.isArray(typeResponse.data) 
                ? typeResponse.data.map(t => t.name).filter(Boolean)
                : [];
              
                return {
                  ...addr,
                  deliveryTypes
                };
              }
              return addr;
            } catch (error) {
              console.error('Error fetching delivery type:', error);
              return addr;
            }
          })
        );
        
        setAddresses(addressesWithTypes);
        setShowForm(addressesWithTypes.length === 0);
      } catch (error) {
        console.error('Error fetching initial data', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [user]);

  // Set default address
  const setDefaultAddress = async (addressId, addressType) => {
    try {
      
      await axios.put(`/api/addresses/${addressId}/default`, { addressType });
      setAddresses(addresses.map(addr => ({
        ...addr,
        is_default_delivery: addressType === 'delivery' ? addr.id === addressId : addr.is_default_delivery,
        is_default_billing: addressType === 'billing' ? addr.id === addressId : addr.is_default_billing
      })));
    } catch (error) {
      console.error('Error setting default address', error);
      setError('Failed to update default address');
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId) => {
    try {
      await axios.delete(`/api/addresses/${addressId}`);
      setAddresses(addresses.filter(addr => addr.id !== addressId));
    } catch (error) {
      console.error('Error deleting address', error);
      setError('Failed to delete address');
    }
  };

  // Start editing an address
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  // Render address cards
  const renderAddressCards = () => {
    return addresses.map(addr => (
      <div key={addr.id} className={`address-card ${addr.is_default_delivery ? 'default-delivery' : ''} ${addr.is_default_billing ? 'default-billing' : ''}`}>
        <div className="address-header">
          <h4>
            {addr.is_default_delivery && <span className="default-badge">Delivery</span>}
            {addr.is_default_billing && <span className="default-badge">Billing</span>}
          </h4>
        </div>
        <div className="address-details">
          <p><strong>{addr.first_name} {addr.last_name}</strong></p>
          <p>{addr.full_address}</p>
          <p>{addr.county}, {addr.city}</p>
          <p>P: {user.phone}</p>
        </div>
        <div className="address-actions">
          {!addr.is_default_delivery && (
            <button 
              className="set-default-btn"
              onClick={() => setDefaultAddress(addr.id, 'delivery')}
            >
              Set delivery address
            </button>
          )}
          {!addr.is_default_billing && (
            <button 
              className="set-default-btn"
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
    ));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

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
          >
            + Adaugă adresă nouă
          </button>
        </>
      )}
    </div>
  );
};

export default AddressManagement;
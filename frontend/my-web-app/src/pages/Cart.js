import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/css/Cart.css';

const Cart = ({ user }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  
  // Fetch cart items
  useEffect(() => {
    if (!user) return;
    
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API endpoint to fetch cart items
        // const response = await axios.get(`/api/cart/${user.id}`);
        // setCartItems(response.data);
        
        // Mock data for development - replace with actual API call
        setCartItems([
          {
            id: 1,
            device_id: 1,
            name: 'iPhone 14 128GB Midnight',
            sku: 'MPUF3RX/A',
            price: 2999.99,
            quantity: 1,
            image: '/images/iphone14.jpg' // Path to image
          }
        ]);
        
        // Calculate total
        calculateTotal();
      } catch (err) {
        console.error("Error fetching cart items:", err);
        setError("Failed to load your cart. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCartItems();
  }, [user]);
  
  // Calculate cart total
  const calculateTotal = () => {
    // TODO: Replace with actual calculation from cart items
    setTotal(2999.99);
  };
  
  // Update item quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      // TODO: Implement API call to update quantity
      // await axios.put(`/api/cart/item/${itemId}`, { quantity: newQuantity });
      
      // Update local state
      const updatedItems = cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      
      setCartItems(updatedItems);
      calculateTotal();
    } catch (err) {
      console.error("Error updating quantity:", err);
      setError("Failed to update quantity. Please try again.");
    }
  };
  
  // Remove item from cart
  const removeItem = async (itemId) => {
    try {
      // TODO: Implement API call to remove item
      // await axios.delete(`/api/cart/item/${itemId}`);
      
      // Update local state
      const updatedItems = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedItems);
      calculateTotal();
    } catch (err) {
      console.error("Error removing item:", err);
      setError("Failed to remove item. Please try again.");
    }
  };
  
  // Handle checkout
  const handleCheckout = () => {
    // TODO: Implement checkout logic - redirect to checkout page or process order
    console.log("Proceeding to checkout");
  };

  if (loading) return <div className="loading-spinner">Loading your cart...</div>;
  if (error) return <div className="error-message">{error}</div>;
  
  return (
    <div className="cart-container">
      <h1>Shopping Cart</h1>
      
      <div className="cart-summary-top">
        <h2>Total coș cumpărături {total.toLocaleString('ro-RO')} Lei</h2>
        
        <div className="shipping-info">
          <span className="free-shipping">
            <i className="check-icon"></i> Transport GRATUIT
          </span>
        </div>
        
        <button className="checkout-button" onClick={handleCheckout}>
          Finalizare comandă
        </button>
      </div>
      
      <div className="cart-divider"></div>
      
      <div className="cart-items">
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty.</p>
          </div>
        ) : (
          cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-image">
                {/* TODO: Replace with actual image */}
                <img src={item.image || "https://placeholder.com/150"} alt={item.name} />
              </div>
              
              <div className="item-details">
                <h3>{item.name}</h3>
                <p className="item-sku">{item.sku}</p>
              </div>
              
              <div className="item-quantity">
                <button 
                  className="quantity-btn minus"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <input 
                  type="text" 
                  value={item.quantity} 
                  readOnly 
                />
                <button 
                  className="quantity-btn plus"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              
              <div className="item-price">
                {(item.price * item.quantity).toLocaleString('ro-RO')} Lei
              </div>
              
              <button 
                className="remove-item" 
                onClick={() => removeItem(item.id)}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
      
      <div className="cart-actions">
        <button className="update-cart-button">
          Actualizează coșul de cumpărături
        </button>
      </div>
      
      <div className="cart-summary-box">
        <h3>Sumarul coșului de cumpărături</h3>
        
        <div className="coupon-section">
          <p>Dacă beneficiezi de un cupon de reducere, introdu codul aici.</p>
          {/* TODO: Implement coupon functionality */}
        </div>
        
        <div className="cart-total">
          <div className="total-row">
            <span>Total cu TVA</span>
            <span className="price">{total.toLocaleString('ro-RO')} Lei</span>
          </div>
        </div>
        
        <button className="checkout-button" onClick={handleCheckout}>
          Finalizare comandă
        </button>
      </div>
    </div>
  );
};

export default Cart;
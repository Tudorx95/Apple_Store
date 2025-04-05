import React, { useState, useEffect } from 'react';
import { useAuth } from '../models/AuthProvider';
import { useNavigate } from 'react-router-dom';
import '../assets/css/Cart.css'

const CartPage = () => {
  const { token, userId, isTokenExpired } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [freeShipping, setFreeShipping] = useState(true);

  // Fetch cart items from the database
  const fetchCartItems = async () => {
    try {
      setLoading(true);

      if (!userId || isTokenExpired(token)) {
        if (!localStorage.getItem("loggedOut")) {
          alert("User is not logged in or token is expired!");
          localStorage.setItem("loggedOut", "true"); // Prevent duplicate alerts
          navigate('/login');
        }
        return;
      }
      localStorage.removeItem("loggedOut");

      const orderId = localStorage.getItem("orderId");
      if (!orderId) {
        
        return;
      }

      // Get the pending orders for the current user
      const response = await fetch(`/api/products/${userId}/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          alert("Session expired or invalid token!");
          navigate('/login');
          return;
        }
        else if (response.status === 404)
            {
              //console.log(response.message);
              localStorage.removeItem("orderId");
              return;
            }
          //throw new Error('Failed to fetch cart items');
      }

      const data = await response.json();
      console.log("Data:", data);

      // Setează array-ul corect din data.data
      const items = data.data || [];
      setCartItems(items);

      // Calculează totalul folosind items
      const total = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
      setTotalPrice(total);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    // eliminate any coupon used earlier
    localStorage.removeItem("couponId");

    if (userId && token) {
      fetchCartItems();
    } else {
      navigate('/login');
    }
  }, [userId, token, navigate, isTokenExpired]);

  // Update quantity of an item
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    try {
      const orderId = localStorage.getItem('orderId');
      const response = await fetch(`/api/products/Quantity/${userId}/${orderId}/${itemId}`, {
        method: 'PATCH',  
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      // Update local state
      const updatedItems = cartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );

      setCartItems(updatedItems);

      // Recalculate total
      const total = updatedItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
      setTotalPrice(total);

    } catch (err) {
      setError(err.message);
    }
  };

  // Remove item from cart
  const removeItem = async (itemId) => {
    try {
      const orderId = localStorage.getItem('orderId');
      const response = await fetch(`/api/products/RemoveItem/${userId}/${orderId}/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }
      console.log(cartItems.length);
      fetchCartItems();
      if(cartItems.length === 0)
      {
        localStorage.removeItem("orderId");
      }
      // Update local state
      const updatedItems = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedItems);

      // Recalculate total
      const total = updatedItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
      setTotalPrice(total);

    } catch (err) {
      setError(err.message);
    }
  };

  
 // Handle coupon code
const handleCouponSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const exists_coupon = localStorage.getItem('couponId');
    if(exists_coupon)
    {
      alert("A coupon was already used!");
      return;
    }

    const response = await fetch('/api/products/coupon/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ code: couponCode }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Invalid coupon code');
    }

    const data = await response.json();
    console.log(data);
    
    // Calculate the discount amount
    let discountAmount = 0;

    if (data.discountType === 'percentage') {
      discountAmount = (totalPrice * data.discountValue) / 100;

      // Ensure it does not exceed max discount allowed
      if (data.maxDiscount && discountAmount > data.maxDiscount) {
        discountAmount = data.maxDiscount;
      }
    } else if (data.discountType === 'fixed_amount') {
      discountAmount = data.discountValue;
    }

    // Ensure minimum purchase requirement is met
    if (totalPrice < data.minPurchase) {
      alert(`Coupon requires a minimum purchase of $${data.minPurchase}`);
      return;
    }
    localStorage.setItem("couponId",couponCode);
    // Calculate the new total price after applying the discount
    const newTotal = totalPrice - discountAmount;

    // Update total price state
    setTotalPrice(newTotal);

    alert(`Coupon applied! You saved $${discountAmount}!`);

  } catch (err) {
    setError(err.message);
    setTimeout(() => setError(null), 3000);
  }
};

  // Finalize order
  const finalizeOrder = async () => {
    // modify status in order_details, and the price
    try {
      const nb_orders = cartItems.length;
      if(nb_orders<1)
      {
        return;
      }
      const response = await fetch(`/api/address-delivery/${userId}/${nb_orders}`,{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Error retrieving address ID');
      }
      
      const data = await response.json();
      const orderDetailsId = data.orderId;
      

      // const orderDetailsResponse = await fetch('/api/order-details', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({
      //     user_id: userId,
      //     nb_orders: cartItems.length,
      //     address_delivery_id: 1, // Default address ID for now
      //   }),
      // });

      // if (!orderDetailsResponse.ok) {
      //   throw new Error('Failed to create order details');
      // }

      //const orderDetails = await orderDetailsResponse.json();

      const updateOrdersResponse = await fetch('/api/products/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          order_id: orderDetailsId,
          status: 'shipped',
        }),
      });

      if (!updateOrdersResponse.ok) {
        throw new Error('Failed to finalize order');
      }

      navigate('/order-confirmation', {
        state: {
          orderId: orderDetailsId,
          totalAmount: totalPrice,
        },
      });

    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center p-4">Loading your cart...</div>;

  return (
    <div className="cart-page-container">
      <h1 className="cart-title">Total shopping cart {totalPrice.toFixed(2)} $</h1>

      <div className="free-shipping-notice">
        <div className="free-shipping-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span>Free shipping</span>
      </div>

      <div className="finalize-order-top">
        <button onClick={finalizeOrder} className="btn-finalize">
        Order completion
        </button>
      </div>

      <div className="cart-divider"></div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="empty-cart-message">
          <p>Your shopping cart is empty.</p>
        </div>
      ) : (
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-details">
                <img
                  src={"./images/" + item.image_url || '/placeholder-device.jpg'}
                  alt={item.model}
                  className="item-image"
                />
                <div className="item-info">
                  <h3>{item.model}</h3>
                  <p>Stock: {item.in_stock ? "In Stock" : "Ask stock"}</p>
                </div>
              </div>

              <div className="item-actions">
                <div className="quantity-selector">
                  <button
                    onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                    className="btn-decrease"
                  >
                    -
                  </button>
                  <span className="quantity-display">{item.quantity || 1}</span>
                  <button
                    onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                    className="btn-increase"
                  >
                    +
                  </button>
                </div>

                <div className="item-price">
                  <p>{(item.price * (item.quantity || 1)).toFixed(2)} $</p>
                </div>

                <button onClick={() => removeItem(item.id)} className="btn-remove">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <button className="btn-update-cart">
        Update shopping cart
        </button>
      </div>

      <div className="cart-summary">
        <h2 className="summary-title">Shopping cart summary</h2>

        <div className="coupon-section">
          <p className="coupon-text">If you have a discount coupon, enter the code here.</p>
          <form onSubmit={handleCouponSubmit} className="coupon-form">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="coupon-input"
              placeholder="Cod cupon"
            />
            <button type="submit" className="btn-apply-coupon">
            Apply
            </button>
          </form>
        </div>

        <div className="total-section">
          <span className="total-label">Total with VAT</span>
          <span className="total-amount">{totalPrice.toFixed(2)} $</span>
        </div>

        <div>
          <button onClick={finalizeOrder} className="btn-finalize-bottom">
          Order completion
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
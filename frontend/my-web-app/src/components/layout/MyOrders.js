import React, { useState, useEffect } from 'react';
import { useAuth } from '../../models/AuthProvider';
import '../../assets/css/MyOrders.css';

const MyOrders = () => {
  const { token, userId } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderIds, setExpandedOrderIds] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // Fetch all order_details for the current user
        const response = await fetch(`/api/products/order_details/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const { data: orderDetails } = await response.json();
        
        // For each order_detail, fetch the associated orders
        const allOrders = await Promise.all(
          orderDetails.map(async (orderDetail) => {
            const orderId = orderDetail.id;
            const status = orderDetail.status;
  
            const itemsResponse = await fetch(`/api/products/${userId}/${orderId}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
  
            if (!itemsResponse.ok) {
              throw new Error(`Failed to fetch devices for order ${orderId}`);
            }
  
            const { data: orderItems } = await itemsResponse.json();
  
            // Calculate total price for the order
            const totalPrice = orderItems.reduce(
              (sum, item) => sum + parseFloat(item.price) * item.quantity,
              0
            );
  
            return {
              orderId,
              status,
              items: orderItems,
              totalPrice
            };
          })
        );
        
        setOrders(allOrders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId && token) {
      fetchOrders();
    }
  }, [userId, token]);

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrderIds(prevIds => 
      prevIds.includes(orderId)
        ? prevIds.filter(id => id !== orderId)
        : [...prevIds, orderId]
    );
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'order-status pending';
      case 'shipped':
        return 'order-status shipped';
      case 'delivered':
        return 'order-status delivered';
      case 'cancelled':
        return 'order-status cancelled';
      default:
        return 'order-status default';
    }
  };

  if (loading) {
    return (
      <div className="section-content">
        <h2>My Orders</h2>
        <div className="orders-loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-content">
        <h2>My Orders</h2>
        <div className="orders-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section-content">
      <h2>My Orders</h2>
      <p className="section-description">Track and manage your orders.</p>
  
      {orders.length === 0 ? (
        <div className="empty-state">
          <p>You have no orders registered.</p>
          <a href="/products" className="go-to-home">Start shopping &gt;</a>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.orderId} className="order-card">
              <div 
                className="order-header"
                onClick={() => toggleOrderExpansion(order.orderId)}
              >
                <div className="order-title">
                  <p>Order #{order.orderId}</p>
                </div>
  
                <div className="order-summary">
                  <span className={getStatusClass(order.status)}>
                    {order.status}
                  </span>
  
                  <span className="order-price">{order.totalPrice.toFixed(2)} $</span>
  
                  <div 
                    className={`expand-icon ${expandedOrderIds.includes(order.orderId) ? 'expanded' : ''}`}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>
  
              {expandedOrderIds.includes(order.orderId) && (
                <div className="order-details">
                  <table className="order-items-table">
                    <thead>
                      <tr>
                        <th className="table-product">Product</th>
                        <th className="table-quantity">Quantity</th>
                        <th className="table-price">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="product-cell">
                            <div className="product-info">
                              {item.image_url ? (
                                <div className="product-image">
                                  <img 
                                    src={`/images/${item.image_url}`} 
                                    alt={item.model} 
                                  />
                                </div>
                              ) : (
                                <div className="product-image placeholder">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <path d="M21 15l-5-5L5 21" />
                                  </svg>
                                </div>
                              )}
                              <span className="product-name">{item.model}</span>
                            </div>
                          </td>
                          <td className="quantity-cell">{item.quantity}</td>
                          <td className="price-cell">{(parseFloat(item.price) * item.quantity).toFixed(2)} $</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="2" className="total-label">Total:</td>
                        <td className="total-value">{order.totalPrice.toFixed(2)} $</td>
                      </tr>
                    </tfoot>
                  </table>
  
                  <div className="order-actions">
                    {order.status === 'pending' && (
                      <button className="btn-cancel">
                        Cancel order
                      </button>
                    )}
                    <button className="btn-details">
                      Order details
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );  
};

export default MyOrders;
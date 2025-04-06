import React, { useState, useEffect } from 'react';
import { useAuth } from '../../models/AuthProvider';
import Modal from 'react-modal';
import '../../assets/css/MyOrders.css';

// Make sure to bind modal to your appElement
Modal.setAppElement('#root');

const MyOrders = () => {
  const { token, userId } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderIds, setExpandedOrderIds] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalIsOpen, setIsOpen] = useState(false);

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

            const itemsResponse = await fetch(`/api/products/${userId}/${orderId}?status=${status}`, {
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
        if (err.message.includes('No orders found') || err.message === 'Failed to fetch orders') {
          setOrders([]);
          setError('no_orders');
        } else {
          // Other errors
          setError(err.message);
        }
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

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/products/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: userId,
          order_id: orderId,
          status: 'cancelled'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      // Update the local state to reflect the cancelled status
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.orderId === orderId
            ? { ...order, status: 'cancelled' }
            : order
        )
      );

      // Remove the order from expanded state
      setExpandedOrderIds(prevIds => prevIds.filter(id => id !== orderId));
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleModal = (order) => {
    if (modalIsOpen && selectedOrder?.orderId === order.orderId) {
      setIsOpen(false);
      setSelectedOrder(null);
    } else {
      setSelectedOrder(order);
      setIsOpen(true);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'my-orders-status pending';
      case 'shipped':
        return 'my-orders-status shipped';
      case 'delivered':
        return 'my-orders-status delivered';
      case 'cancelled':
        return 'my-orders-status cancelled';
      default:
        return 'my-orders-status default';
    }
  };

  if (loading) {
    return (
      <div className="my-orders-section-content">
        <h2>My Orders</h2>
        <div className="my-orders-loading">
          <div className="my-orders-loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error && error !== 'no_orders') {
    return (
      <div className="my-orders-section-content">
        <h2>My Orders</h2>
        <div className="my-orders-error">
          <p>An error occurred: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-section-content">
      <h2>My Orders</h2>
      <p className="my-orders-section-description">Track and manage your orders.</p>

      {orders.length === 0 ? (
        <div className="my-orders-empty-state">
          <p>You have no orders registered.</p>
          <a href="/products" className="my-orders-go-to-home">Start shopping &gt;</a>
        </div>
      ) : (
        <div className="my-orders-list">
          {orders.map((order) => (
            <div key={order.orderId} className="my-orders-card">
              <div
                className="my-orders-header"
                onClick={() => toggleOrderExpansion(order.orderId)}
              >
                <div className="my-orders-title">
                  <p>Order #{order.orderId}</p>
                </div>

                <div className="my-orders-summary">
                  <span className={getStatusClass(order.status)}>
                    {order.status}
                  </span>

                  <span className="my-orders-price">{order.totalPrice.toFixed(2)} $</span>

                  <div
                    className={`my-orders-expand-icon ${expandedOrderIds.includes(order.orderId) ? 'expanded' : ''}`}
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
                <div className="my-orders-details">
                  <table className="my-orders-items-table">
                    <thead>
                      <tr>
                        <th className="my-orders-table-product">Product</th>
                        <th className="my-orders-table-quantity">Quantity</th>
                        <th className="my-orders-table-price">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="my-orders-product-cell">
                            <div className="my-orders-product-info">
                              {item.image_url ? (
                                <div className="my-orders-product-image">
                                  <img
                                    src={`/images/${item.image_url}`}
                                    alt={item.model}
                                  />
                                </div>
                              ) : (
                                <div className="my-orders-product-image placeholder">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <path d="M21 15l-5-5L5 21" />
                                  </svg>
                                </div>
                              )}
                              <span className="my-orders-product-name">{item.model}</span>
                            </div>
                          </td>
                          <td className="my-orders-quantity-cell">{item.quantity}</td>
                          <td className="my-orders-price-cell">{(parseFloat(item.price) * item.quantity).toFixed(2)} $</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="2" className="my-orders-total-label">Total:</td>
                        <td className="my-orders-total-value">{order.totalPrice.toFixed(2)} $</td>
                      </tr>
                    </tfoot>
                  </table>

                  <div className="my-orders-actions">
                    {order.status === 'pending' && (
                      <button
                        className="my-orders-btn-cancel"
                        onClick={() => handleCancelOrder(order.orderId)}
                      >
                        Cancel order
                      </button>
                    )}
                    <button
                      className={`my-orders-btn-details ${modalIsOpen && selectedOrder?.orderId === order.orderId ? 'active' : ''}`}
                      onClick={() => toggleModal(order)}
                    >
                      {modalIsOpen && selectedOrder?.orderId === order.orderId ? 'Hide Details' : 'Order Details'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setIsOpen(false)}
        className="my-orders-modal-content"
        overlayClassName="my-orders-modal-overlay"
        contentLabel="Order Details"
      >
        {selectedOrder && (
          <div className="my-orders-modal-details">
            <div className="my-orders-modal-section">
              <h4>Order Information</h4>
              <p><strong>Order ID:</strong> #{selectedOrder.orderId}</p>
              <p><strong>Status:</strong> <span className={getStatusClass(selectedOrder.status)}>{selectedOrder.status}</span></p>
              <p><strong>Order Date:</strong> {new Date().toLocaleDateString()}</p>
            </div>

            <div className="my-orders-modal-section">
              <h4>Order Summary</h4>
              <p><strong>Total Amount:</strong> {selectedOrder.totalPrice.toFixed(2)} $</p>
              <p><strong>Number of Items:</strong> {selectedOrder.items.length}</p>
            </div>

            <div className="my-orders-modal-section">
              <h4>Items</h4>
              <div className="my-orders-modal-items">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="my-orders-modal-item">
                    <div className="my-orders-modal-item-image">
                      {item.image_url ? (
                        <img
                          src={`/images/${item.image_url}`}
                          alt={item.model}
                        />
                      ) : (
                        <div className="my-orders-product-image placeholder">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="my-orders-modal-item-details">
                      <p className="my-orders-modal-item-name">{item.model}</p>
                      <p className="my-orders-modal-item-quantity">Quantity: {item.quantity}</p>
                      <p className="my-orders-modal-item-price">{(parseFloat(item.price) * item.quantity).toFixed(2)} $</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyOrders;
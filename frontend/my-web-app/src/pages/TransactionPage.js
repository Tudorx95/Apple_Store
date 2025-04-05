import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../assets/css/TransactionPage.css';

const TransactionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, totalAmount } = location.state || {};
  const [showPayment, setShowPayment] = useState(!orderId);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Here you would typically integrate with a payment gateway like Stripe
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful payment
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...paymentDetails,
          amount: totalAmount,
          status: 'pending' // Initial status
        })
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      const data = await response.json();
      setPaymentStatus(data.status);

      // After successful payment, update the state
      setShowPayment(false);
    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReturnHome = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/dashboard');
  };

  if (showPayment) {
    return (
      <div className="transaction-container">
        <div className="payment-portal">
          <h2 className="payment-title">Complete Your Payment</h2>
          <form className="payment-form" onSubmit={handlePaymentSubmit}>
            <input
              type="text"
              name="cardName"
              placeholder="Cardholder Name"
              className="payment-input"
              value={paymentDetails.cardName}
              onChange={handlePaymentChange}
              required
            />
            <input
              type="text"
              name="cardNumber"
              placeholder="Card Number"
              className="payment-input"
              value={paymentDetails.cardNumber}
              onChange={handlePaymentChange}
              required
            />
            <div className="payment-row">
              <input
                type="text"
                name="expiryDate"
                placeholder="MM/YY"
                className="payment-input"
                value={paymentDetails.expiryDate}
                onChange={handlePaymentChange}
                required
              />
              <input
                type="text"
                name="cvv"
                placeholder="CVV"
                className="payment-input"
                value={paymentDetails.cvv}
                onChange={handlePaymentChange}
                required
              />
            </div>
            <div className="transaction-details">
              <div className="transaction-detail-item">
                <span className="transaction-detail-label">Total Amount:</span>
                <span className="transaction-detail-value">${totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            <button
              type="submit"
              className="payment-button"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Pay Now'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-container">
      <div className="transaction-card">
        <div className="transaction-success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h1 className="transaction-title">
          {paymentStatus === 'failed' ? 'Payment Failed' : 'Payment Successful!'}
        </h1>
        <div className="transaction-details">
          <div className="transaction-detail-item">
            <span className="transaction-detail-label">Order ID:</span>
            <span className="transaction-detail-value">{orderId}</span>
          </div>
          <div className="transaction-detail-item">
            <span className="transaction-detail-label">Total Amount:</span>
            <span className="transaction-detail-value">${totalAmount?.toFixed(2)}</span>
          </div>
          <div className="transaction-detail-item">
            <span className="transaction-detail-label">Status:</span>
            <span className="transaction-detail-value" style={{
              color: paymentStatus === 'failed' ? '#e53e3e' : '#48bb78',
              fontWeight: '600'
            }}>
              {paymentStatus || 'pending'}
            </span>
          </div>
        </div>
        <div className="transaction-actions">
          <button
            className="transaction-button transaction-button-primary"
            onClick={handleViewOrders}
          >
            View Orders
          </button>
          <button
            className="transaction-button transaction-button-secondary"
            onClick={handleReturnHome}
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionPage;

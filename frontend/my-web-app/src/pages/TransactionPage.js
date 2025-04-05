import { useLocation } from 'react-router-dom';

const TransactionPage = () => {
  const location = useLocation();
  const { orderId, totalAmount } = location.state || {};

  return (
    <div>
      <h1>Transaction Successful</h1>
      <p>Order ID: {orderId}</p>
      <p>Total Amount: ${totalAmount.toFixed(2)}</p>
      <button onClick={() => window.location.href = "/"}>Return to Home</button>
    </div>
  );
};

export default TransactionPage;

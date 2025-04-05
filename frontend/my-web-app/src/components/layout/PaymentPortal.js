import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../models/AuthProvider';
import '../../assets/css/PaymentPortal.css';

const PaymentPortal = ({ orderId, totalAmount, onPaymentComplete }) => {
    const navigate = useNavigate();
    const { token, userId } = useAuth();
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
        billingAddress: ''
    });
    const [errors, setErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const response = await fetch(`/api/products/address-delivery/${userId}/1`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch addresses');
                }

                const { data } = await response.json();
                if (data && Array.isArray(data)) {
                    setAddresses(data);

                    // Find and set the default delivery address
                    const defaultAddress = data.find(addr => addr.default_delivery === 1);
                    if (defaultAddress) {
                        setSelectedAddress(defaultAddress);
                        setFormData(prev => ({
                            ...prev,
                            billingAddress: formatAddress(defaultAddress)
                        }));
                    }
                } else {
                    throw new Error('Invalid addresses data format');
                }
            } catch (err) {
                console.error('Error fetching addresses:', err);
                setErrors(prev => ({
                    ...prev,
                    address: 'Failed to load addresses'
                }));
            } finally {
                setLoading(false);
            }
        };

        if (userId && token) {
            fetchAddresses();
        }
    }, [userId, token]);

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.full_address}, ${address.city}, ${address.county}`;
    };

    const handleAddressChange = (e) => {
        const addressId = parseInt(e.target.value);
        const selected = addresses.find(addr => addr.id === addressId);
        setSelectedAddress(selected);
        setFormData(prev => ({
            ...prev,
            billingAddress: selected ? formatAddress(selected) : ''
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Card number validation (16 digits)
        if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
            newErrors.cardNumber = 'Please enter a valid 16-digit card number';
        }

        // Card name validation
        if (!formData.cardName.trim()) {
            newErrors.cardName = 'Please enter the name on card';
        }

        // Expiry date validation (MM/YY format)
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
            newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
        }

        // CVV validation (3 or 4 digits)
        if (!/^\d{3,4}$/.test(formData.cvv)) {
            newErrors.cvv = 'Please enter a valid CVV';
        }

        // Billing address validation
        if (!selectedAddress) {
            newErrors.billingAddress = 'Please select a billing address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsProcessing(true);

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Call the onPaymentComplete callback with payment details
            onPaymentComplete({
                orderId,
                totalAmount,
                paymentDetails: {
                    cardNumber: formData.cardNumber,
                    cardName: formData.cardName,
                    expiryDate: formData.expiryDate,
                    cvv: formData.cvv,
                    billingAddress: selectedAddress
                }
            });

            // Navigate to order confirmation
            navigate('/order-confirmation', {
                state: {
                    orderId,
                    totalAmount
                }
            });
        } catch (error) {
            console.error('Payment processing failed:', error);
            setErrors(prev => ({
                ...prev,
                payment: 'Payment processing failed. Please try again.'
            }));
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="payment-portal">
                <div className="payment-loading">
                    <div className="payment-loading-spinner"></div>
                    <p>Loading addresses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-portal">
            <div className="payment-header">
                <h2>Payment Information</h2>
                <p className="payment-amount">Total Amount: ${totalAmount.toFixed(2)}</p>
            </div>

            <form onSubmit={handleSubmit} className="payment-form">
                <div className="form-group">
                    <label htmlFor="cardNumber">Card Number</label>
                    <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className={errors.cardNumber ? 'error' : ''}
                    />
                    {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="cardName">Name on Card</label>
                    <input
                        type="text"
                        id="cardName"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={errors.cardName ? 'error' : ''}
                    />
                    {errors.cardName && <span className="error-message">{errors.cardName}</span>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="expiryDate">Expiry Date</label>
                        <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            placeholder="MM/YY"
                            maxLength="5"
                            className={errors.expiryDate ? 'error' : ''}
                        />
                        {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="cvv">CVV</label>
                        <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleChange}
                            placeholder="123"
                            maxLength="4"
                            className={errors.cvv ? 'error' : ''}
                        />
                        {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="billingAddress">Billing Address</label>
                    <select
                        id="billingAddress"
                        name="billingAddress"
                        value={selectedAddress?.id || ''}
                        onChange={handleAddressChange}
                        className={errors.billingAddress ? 'error' : ''}
                    >
                        <option value="">Select a billing address</option>
                        {Array.isArray(addresses) && addresses.map(address => (
                            <option key={address.id} value={address.id}>
                                {formatAddress(address)}
                                {address.default_delivery === 1 ? ' (Default)' : ''}
                            </option>
                        ))}
                    </select>
                    {errors.billingAddress && <span className="error-message">{errors.billingAddress}</span>}
                </div>

                {errors.payment && (
                    <div className="payment-error">
                        <span className="error-message">{errors.payment}</span>
                    </div>
                )}

                <div className="payment-actions">
                    <button
                        type="submit"
                        className="payment-submit"
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Processing...' : 'Complete Payment'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentPortal; 
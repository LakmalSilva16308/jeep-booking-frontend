import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import '../styles/App.css';

console.log('REACT_APP_STRIPE_PUBLISHABLE_KEY:', process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : null;

const CheckoutForm = ({ bookingId, totalPrice, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('payhere');

  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token for payment request:', token);
        if (!token) {
          throw new Error('Please log in to proceed with payment');
        }
        console.log('Fetching client secret for booking:', { bookingId, totalPrice, paymentMethod });
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const cleanApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
        const response = await axios.post(`${cleanApiUrl}/api/payments/create-intent`, {
          bookingId,
          paymentMethod
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Payment intent response:', response.data);
        if (paymentMethod === 'stripe') {
          setClientSecret(response.data.clientSecret);
        } else if (paymentMethod === 'payhere') {
          const payHereForm = document.createElement('form');
          payHereForm.method = 'POST';
          payHereForm.action = 'https://sandbox.payhere.lk/pay/checkout';
          Object.entries(response.data.payHereData).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            payHereForm.appendChild(input);
          });
          document.body.appendChild(payHereForm);
          console.log('Submitting PayHere form:', response.data.payHereData);
          payHereForm.submit();
        }
      } catch (err) {
        console.error('Error fetching client secret:', err.response?.data || err.message);
        const errorMessage = err.response?.status === 403
          ? 'Access denied: Please log in as a tourist to make a payment'
          : err.response?.status === 404
          ? 'Payment endpoint not found. Please check backend configuration.'
          : err.response?.data?.error || 'Failed to initialize payment. Please try again.';
        setError(errorMessage);
      }
    };
    if (bookingId) {
      fetchClientSecret();
    } else {
      setError('Invalid booking ID');
    }
  }, [bookingId, paymentMethod]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (paymentMethod !== 'stripe') return;

    if (!stripe || !elements) {
      setError('Stripe.js has not loaded. Please refresh the page.');
      setProcessing(false);
      return;
    }

    if (!clientSecret) {
      setError('Payment initialization failed. Please try again.');
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: 'Customer' }
        }
      });

      if (stripeError) {
        console.error('Payment error:', stripeError.message);
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent.id);
        onSuccess();
      }
    } catch (err) {
      console.error('Error confirming payment:', err.message);
      setError('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <h3>Complete Your Payment</h3>
      <div className="payment-details">
        <p>Total Amount: <span>{paymentMethod === 'payhere' ? 'LKR' : '$'}{totalPrice.toFixed(2)}</span></p>
      </div>
      <div className="form-group">
        <label>Payment Method</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="payment-method-select"
        >
          <option value="payhere">PayHere (Sri Lanka)</option>
          <option value="stripe">Stripe (International)</option>
        </select>
      </div>
      {paymentMethod === 'stripe' && (
        <div className="card-element-container">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#333',
                '::placeholder': { color: '#999' },
                padding: '12px',
              },
              invalid: { color: '#d32f2f' }
            }
          }} />
        </div>
      )}
      <button
        type="submit"
        disabled={processing || (paymentMethod === 'stripe' && (!stripe || !clientSecret))}
        className="payment-button"
      >
        {processing ? 'Processing...' : `Pay ${paymentMethod === 'payhere' ? 'LKR' : '$'}${totalPrice.toFixed(2)}`}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

const PaymentForm = ({ bookingId, totalPrice, onSuccess }) => {
  if (!stripePromise) {
    return <div className="error">Stripe configuration error: Publishable key not found</div>;
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm bookingId={bookingId} totalPrice={totalPrice} onSuccess={onSuccess} />
    </Elements>
  );
};

export default PaymentForm;
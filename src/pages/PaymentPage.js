import React from 'react';
import { useLocation } from 'react-router-dom';
import PaymentForm from '../components/PaymentForm';
import '../styles/App.css';

const PaymentPage = () => {
  const { state } = useLocation();
  const { bookingId, totalPrice } = state || {};

  if (!bookingId || !totalPrice) {
    return <div className="container error">Invalid booking or payment details</div>;
  }

  const handlePaymentSuccess = () => {
    console.log('Payment completed successfully for booking:', bookingId);
    // Redirect or show success message
    window.location.href = '/bookings'; // Adjust as needed
  };

  return (
    <div className="payment-form-container">
      <PaymentForm
        bookingId={bookingId}
        totalPrice={totalPrice}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default PaymentPage;
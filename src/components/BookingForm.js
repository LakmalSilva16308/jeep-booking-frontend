import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/App.css';

const BookingForm = ({ providerId, price }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    adults: 1,
    children: 0,
    specialNotes: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const calculateTotalPrice = () => {
      const adultsCount = parseInt(formData.adults) || 0;
      const childrenCount = parseInt(formData.children) || 0;
      const childDiscount = 0.5; // 50% for children
      const validatedPrice = Number.isFinite(price) && price > 0 ? price : 0;
      const calculatedPrice = (adultsCount * validatedPrice) + (childrenCount * validatedPrice * childDiscount);
      console.log('Price calculation:', {
        providerId,
        providerPrice: validatedPrice,
        adults: adultsCount,
        children: childrenCount,
        childDiscount,
        totalPrice: calculatedPrice
      });
      setTotalPrice(calculatedPrice);
    };
    calculateTotalPrice();
  }, [formData.adults, formData.children, price, providerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to make a booking');
      }

      if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
        throw new Error('Invalid total price');
      }

      const bookingData = {
        providerId,
        date: formData.date,
        time: formData.time,
        adults: parseInt(formData.adults),
        children: parseInt(formData.children),
        totalPrice,
        specialNotes: formData.specialNotes
      };
      console.log('Submitting booking:', bookingData);

      const response = await axios.post('http://localhost:5000/api/bookings', bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Booking created:', response.data);

      navigate('/payment', {
        state: { totalPrice, bookingId: response.data.booking._id }
      });
    } catch (err) {
      console.error('Error creating booking:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form-container">
      <h2>Book Your Adventure</h2>
      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="time">Time</label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="adults">Adults</label>
          <input
            type="number"
            id="adults"
            name="adults"
            min="1"
            value={formData.adults}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="children">Children</label>
          <input
            type="number"
            id="children"
            name="children"
            min="0"
            value={formData.children}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="specialNotes">Special Notes</label>
          <textarea
            id="specialNotes"
            name="specialNotes"
            value={formData.specialNotes}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <p className="total-price">Total Price: <strong>LKR {totalPrice.toFixed(2)}</strong></p>
        </div>
        <button type="submit" disabled={loading} className="cta-button">
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default BookingForm;
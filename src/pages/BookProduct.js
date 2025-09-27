import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import '../styles/App.css';

const PRICING_STRUCTURE = {
  'Jeep Safari': [
    { min: 1, max: 1, price: 38 },
    { min: 2, max: 5, price: 25 },
    { min: 6, max: 10, price: 20 }
  ],
  'Catamaran Boat Ride': [
    { min: 1, max: 1, price: 9.8 },
    { min: 2, max: Infinity, price: 7 }
  ],
  'Village Cooking Experience': [
    { min: 1, max: 5, price: 15 },
    { min: 6, max: 10, price: 13 },
    { min: 11, max: 20, price: 11 },
    { min: 21, max: 50, price: 10 }
  ],
  'Bullock Cart Ride': [
    { min: 1, max: 5, price: 9.9 },
    { min: 6, max: 20, price: 5 },
    { min: 21, max: 50, price: 4 }
  ],
  'Village Tour': [
    { min: 1, max: 5, price: 19.9 },
    { min: 6, max: 10, price: 18.2 },
    { min: 11, max: 20, price: 17.3 },
    { min: 21, max: 30, price: 16.3 },
    { min: 31, max: 50, price: 15 }
  ],
  'Traditional Village Lunch': [
    { min: 1, max: Infinity, price: 15 }
  ],
  'Sundowners Cocktail': null,
  'High Tea': null,
  'Tuk Tuk Adventures': null,
  'Bicycle Tour': null,
  'Sigiriya Lion Rock': null,
  'Pidurangala Rock': null,
  'Polonnaruwa City Tour': null,
  'Motor Bikes Rent': [
    { min: 1, max: Infinity, price: 17 }
  ],
  'Village Walk Tour': [
    { min: 1, max: Infinity, price: 5 }
  ],
  'Hiriwadunna Village Tour and Jeep Safari One Day Tour': [
    { min: 1, max: Infinity, price: 45 }
  ],
  'Village Tour and Jeep Safari Sigiriya Tour Dambulla Temple': [
    { min: 1, max: Infinity, price: 78 }
  ]
};

function BookProduct() {
  const { productType } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    adults: 1,
    children: 0,
    specialNotes: '',
    contact: { name: '', email: '', message: '' }
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isBookable, setIsBookable] = useState(true);
  const token = localStorage.getItem('token');
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const cleanApiUrl = apiUrl.replace(/\/+$/, '').replace(/\/api$/, ''); // Remove trailing slashes and any /api suffix
  const bookingEndpoint = `${cleanApiUrl}/api/bookings/product`;

  console.log('BookProduct: API configuration:', { apiUrl, cleanApiUrl, bookingEndpoint });

  useEffect(() => {
    if (!token) {
      setError('Please log in to book.');
      navigate('/login');
      return;
    }
    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error('BookProduct: Error decoding token:', err.message);
      setError('Invalid token. Please log in again.');
      navigate('/login');
      return;
    }
    if (decoded.role !== 'tourist') {
      setError('Only tourists can book.');
      navigate('/login');
      return;
    }
    setFormData(prev => ({
      ...prev,
      contact: { ...prev.contact, email: decoded.email || '' }
    }));
    const productName = decodeURIComponent(productType).replace(/\s+/g, ' ').trim();
    if (PRICING_STRUCTURE[productName] === null) {
      setIsBookable(false);
      setError('This product cannot be booked online. Please contact support.');
    } else {
      setIsBookable(true);
    }
  }, [token, navigate, productType]);

  useEffect(() => {
    if (!isBookable) return;
    const productName = decodeURIComponent(productType).replace(/\s+/g, ' ').trim();
    const pricing = PRICING_STRUCTURE[productName];
    const adults = parseInt(formData.adults) || 1;
    const children = parseInt(formData.children) || 0;
    const totalPersons = adults + children;
    const childDiscount = 0.5; // 50% discount for children

    console.log(`BookProduct: Calculating price for productName="${productName}", adults=${adults}, children=${children}, totalPersons=${totalPersons}`);
    console.log(`BookProduct: Pricing for ${productName}=`, pricing);

    if (pricing) {
      const tier = pricing.find(
        tier => totalPersons >= tier.min && totalPersons <= tier.max
      );
      console.log(`BookProduct: Selected tier for ${totalPersons} persons=`, tier);

      if (tier) {
        const adultPrice = adults * tier.price;
        const childPrice = children * tier.price * childDiscount;
        const calculatedPrice = (adultPrice + childPrice).toFixed(2);
        console.log(`BookProduct: Calculated totalPrice=${calculatedPrice} (adults: ${adults} x $${tier.price}, children: ${children} x $${tier.price} x ${childDiscount})`);
        setTotalPrice(calculatedPrice);
        setError(null);
      } else {
        console.log(`BookProduct: No tier found for ${totalPersons} persons, setting totalPrice=0`);
        setTotalPrice(0);
        setError(`No pricing available for ${totalPersons} persons. Please contact support.`);
      }
    }
  }, [formData.adults, formData.children, productType, isBookable]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`BookProduct: handleChange name=${name}, value=${value}`);
    if (name.startsWith('contact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contact: { ...prev.contact, [field]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'adults' || name === 'children' ? (parseInt(value) >= 0 ? parseInt(value) : prev[name]) : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isBookable) return;
    setLoading(true);
    setError(null);
    console.log(`BookProduct: Submitting booking to ${bookingEndpoint} with totalPrice=${totalPrice}`);
    if (!Number.isFinite(parseFloat(totalPrice)) || parseFloat(totalPrice) <= 0) {
      setError('Invalid total price. Please check your selection.');
      setLoading(false);
      return;
    }
    try {
      const decoded = jwtDecode(token);
      const bookingData = {
        productType: decodeURIComponent(productType),
        date: formData.date,
        time: formData.time,
        adults: parseInt(formData.adults),
        children: parseInt(formData.children),
        totalPrice: parseFloat(totalPrice),
        specialNotes: formData.specialNotes,
        touristId: decoded.id,
        contact: formData.contact
      };
      console.log('BookProduct: Booking data:', bookingData);
      const response = await axios.post(bookingEndpoint, bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('BookProduct: Booking submitted, response=', response.data);
      alert('Booking submitted successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('BookProduct: Error submitting booking:', err.response?.data || err.message);
      const errorMessage = err.response?.status === 404
        ? 'Booking endpoint not found. Please check the API URL configuration.'
        : err.response?.data?.error || 'Failed to submit booking. Please try again.';
      setError(errorMessage);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h2>Book {decodeURIComponent(productType)}</h2>
      {!isBookable ? (
        <p className="error">This product cannot be booked online. Please contact support.</p>
      ) : (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>Contact Details</h3>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="contact.name"
              value={formData.contact.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="contact.email"
              value={formData.contact.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea
              name="contact.message"
              value={formData.contact.message}
              onChange={handleChange}
              required
            />
          </div>
          <h3>Booking Details</h3>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Adults</label>
            <input
              type="number"
              name="adults"
              value={formData.adults}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
          <div className="form-group">
            <label>Children</label>
            <input
              type="number"
              name="children"
              value={formData.children}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Total Price (USD)</label>
            <input
              type="number"
              step="0.01"
              name="totalPrice"
              value={totalPrice}
              readOnly
            />
          </div>
          <div className="form-group">
            <label>Special Notes</label>
            <textarea
              name="specialNotes"
              value={formData.specialNotes}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="cta-button" disabled={loading}>
            {loading ? 'Submitting...' : 'Book Now'}
          </button>
          {error && <div className="error">{error}</div>}
        </form>
      )}
    </div>
  );
}

export default BookProduct;
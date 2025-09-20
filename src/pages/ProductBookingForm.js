import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { COMPANY_PRODUCTS } from '../data/products.js';
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
  ]
};

const ProductBookingForm = () => {
  const { productName } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    adults: 1,
    children: 0,
    specialNotes: '',
    contact: { name: '', email: '', message: '', phone: '' }
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [product, setProduct] = useState(null);
  const [isBookable, setIsBookable] = useState(true);
  const token = localStorage.getItem('token');
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const cleanApiUrl = apiUrl.replace(/\/+$/, '');

  useEffect(() => {
    if (!token) {
      setError('Please log in to make a booking');
      setLoading(false);
      navigate('/login');
      return;
    }
    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error('ProductBookingForm: Error decoding token:', err.message);
      setError('Invalid token. Please log in again.');
      navigate('/login');
      return;
    }
    if (decoded.role !== 'tourist') {
      setError('Only tourists can book.');
      navigate('/login');
      return;
    }
    const foundProduct = COMPANY_PRODUCTS.find(p => p.name.toLowerCase() === decodeURIComponent(productName).toLowerCase());
    if (!foundProduct) {
      setError('Product not found');
      return;
    }
    setProduct(foundProduct);
    setFormData(prev => ({
      ...prev,
      contact: { ...prev.contact, email: decoded.email || '' }
    }));
    const productNameClean = decodeURIComponent(productName).replace(/\s+/g, ' ').trim();
    if (PRICING_STRUCTURE[productNameClean] === null) {
      setIsBookable(false);
      setError('This product cannot be booked online. Please contact support.');
    } else {
      setIsBookable(true);
    }
  }, [productName, token, navigate]);

  useEffect(() => {
    if (!product || !isBookable) return;
    const productNameClean = decodeURIComponent(productName).replace(/\s+/g, ' ').trim();
    const pricing = PRICING_STRUCTURE[productNameClean];
    const totalPersons = parseInt(formData.adults || 1) + parseInt(formData.children || 0);

    console.log(`ProductBookingForm: productName=${productNameClean}, adults=${formData.adults}, children=${formData.children}, totalPersons=${totalPersons}`);
    console.log(`ProductBookingForm: PRICING_STRUCTURE for Jeep Safari=`, JSON.stringify(PRICING_STRUCTURE['Jeep Safari'], null, 2));
    console.log(`ProductBookingForm: pricing=`, JSON.stringify(pricing, null, 2));

    if (pricing) {
      const tier = pricing.find(tier => totalPersons >= tier.min && totalPersons <= tier.max);
      console.log(`ProductBookingForm: selected tier=`, JSON.stringify(tier, null, 2));
      if (tier) {
        const calculatedPrice = (totalPersons * tier.price).toFixed(2);
        console.log(`ProductBookingForm: calculated totalPrice=${calculatedPrice} (${totalPersons} x $${tier.price})`);
        setTotalPrice(calculatedPrice);
        setError(null);
      } else {
        console.log(`ProductBookingForm: no tier found for ${totalPersons} persons`);
        setTotalPrice(0);
        setError(`No pricing available for ${totalPersons} persons. Please contact support.`);
      }
    }
  }, [formData.adults, formData.children, productName, product, isBookable]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`ProductBookingForm: handleChange name=${name}, value=${value}`);
    if (name.startsWith('contact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contact: { ...prev.contact, [field]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'adults' || name === 'children' ? parseInt(value) >= 0 ? parseInt(value) : prev[name] : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isBookable) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!formData.date || !formData.time || !formData.adults || !formData.contact.name || !formData.contact.email || !formData.contact.message || !formData.contact.phone) {
      setError('All required fields (date, time, adults, name, email, message, phone) must be filled.');
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const bookingData = {
        productType: decodeURIComponent(productName),
        date: formData.date,
        time: formData.time,
        adults: parseInt(formData.adults),
        children: parseInt(formData.children || 0),
        totalPrice: parseFloat(totalPrice),
        specialNotes: formData.specialNotes,
        touristId: decoded.id,
        contact: formData.contact
      };
      console.log('ProductBookingForm: Sending booking data:', JSON.stringify(bookingData, null, 2));
      // FIX: Removed the redundant '/api' from the endpoint path.
      // The `cleanApiUrl` already includes it.
      const response = await axios.post(`${cleanApiUrl}/bookings/product`, bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('ProductBookingForm: Booking created:', JSON.stringify(response.data, null, 2));
      setSuccess('Booking created successfully! Awaiting admin approval.');
      setTimeout(() => navigate('/tourist-dashboard'), 2000);
    } catch (err) {
      console.error('ProductBookingForm: Error creating booking:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!product) return <div className="container error">Product not found</div>;

  return (
    <div className="form-container container">
      <h2>Book {product.name}</h2>
      {!isBookable ? (
        <p className="error">This product cannot be booked online. Please contact support.</p>
      ) : (
        <form onSubmit={handleSubmit}>
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
            <label>Phone</label>
            <input
              type="tel"
              name="contact.phone"
              value={formData.contact.phone}
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
            <label>Special Notes</label>
            <textarea
              name="specialNotes"
              value={formData.specialNotes}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <p className="total-price">Total Price: USD {totalPrice}</p>
          </div>
          <div className="form-group">
            <button type="submit" disabled={loading} className="cta-button">
              {loading ? 'Booking...' : 'Book Now'}
            </button>
          </div>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </form>
      )}
    </div>
  );
};

export default ProductBookingForm;

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
  ],
  'Hiriwadunna Village Tour and Jeep Safari One Day Tour': [
    { min: 1, max: Infinity, price: 45 }
  ],
  'Village Tour and Jeep Safari Sigiriya Tour Dambulla Temple': [
    { min: 1, max: Infinity, price: 78 }
  ]
};

const ProductBookingForm = () => {
  const { productName } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    adults: '',
    children: '',
    specialNotes: '',
    contact: { name: '', email: '', message: '', phone: '' }
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [product, setProduct] = useState(null);
  const [adultsError, setAdultsError] = useState(null);
  const [childrenError, setChildrenError] = useState(null);
  const [isBookable, setIsBookable] = useState(true);
  const token = localStorage.getItem('token');
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const cleanApiUrl = apiUrl.replace(/\/+$/, '').replace(/\/api$/, '');
  const bookingEndpoint = `${cleanApiUrl}/api/bookings/product`;

  console.log('ProductBookingForm: API configuration:', { apiUrl, cleanApiUrl, bookingEndpoint });

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
    const productNameClean = decodeURIComponent(productName).replace(/\s+/g, ' ').trim();
    const foundProduct = COMPANY_PRODUCTS.find(p => p.name.toLowerCase() === productNameClean.toLowerCase());
    if (!foundProduct) {
      setError('Product not found');
      return;
    }
    setProduct(foundProduct);
    setFormData(prev => ({
      ...prev,
      contact: { ...prev.contact, email: decoded.email || '' }
    }));
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
    const adults = formData.adults === '' || isNaN(parseInt(formData.adults)) ? 0 : parseInt(formData.adults);
    const children = formData.children === '' || isNaN(parseInt(formData.children)) ? 0 : parseInt(formData.children);
    const totalPersons = adults + children;
    const childDiscount = 0.5;

    console.log(`ProductBookingForm: Calculating price for productName=${productNameClean}, adults=${adults}, children=${children}, totalPersons=${totalPersons}`);
    console.log(`ProductBookingForm: Pricing for ${productNameClean}=`, pricing);

    if (pricing) {
      const tier = pricing.find(tier => totalPersons >= tier.min && totalPersons <= tier.max);
      console.log(`ProductBookingForm: Selected tier=`, tier);
      if (tier && totalPersons > 0) {
        const adultPrice = adults * tier.price;
        const childPrice = children * tier.price * childDiscount;
        const calculatedPrice = (adultPrice + childPrice).toFixed(2);
        console.log(`ProductBookingForm: Calculated totalPrice=${calculatedPrice} (adults: ${adults} x $${tier.price}, children: ${children} x $${tier.price} x ${childDiscount})`);
        setTotalPrice(calculatedPrice);
        setError(null);
      } else {
        console.log(`ProductBookingForm: No tier found for ${totalPersons} persons`);
        setTotalPrice(0);
        setError(totalPersons === 0 ? 'Please enter the number of adults and children.' : `No pricing available for ${totalPersons} persons. Please contact support.`);
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
        [name]: value
      }));
      if (name === 'adults' && (value === '' || parseInt(value) === 0)) {
        setAdultsError('At least 1 adult is required.');
      } else {
        setAdultsError(null);
      }
      if (name === 'children' && value === '0') {
        setChildrenError('Number of children cannot be 0.');
      } else {
        setChildrenError(null);
      }
    }
  };

  const handleInput = (e) => {
    handleChange(e);
  };

  const handleFocus = (e) => {
    if (e.target.value === '' || e.target.value === '0') {
      e.target.value = '';
    }
    e.target.select();
  };

  const handleIncrement = (field) => {
    const currentValue = parseInt(formData[field] || '0');
    const newValue = String(currentValue + 1);
    setFormData(prev => ({
      ...prev,
      [field]: newValue
    }));
    if (field === 'adults') setAdultsError(null);
    if (field === 'children') setChildrenError(null);
    console.log(`ProductBookingForm: Incremented ${field} to ${newValue}`);
  };

  const handleDecrement = (field) => {
    const currentValue = parseInt(formData[field] || '0');
    if (currentValue <= (field === 'adults' ? 1 : 0)) return;
    const newValue = String(currentValue - 1);
    setFormData(prev => ({
      ...prev,
      [field]: newValue
    }));
    if (field === 'adults' && newValue === '0') {
      setAdultsError('At least 1 adult is required.');
    } else if (field === 'adults') {
      setAdultsError(null);
    }
    if (field === 'children' && newValue === '0') {
      setChildrenError('Number of children cannot be 0.');
    } else if (field === 'children') {
      setChildrenError(null);
    }
    console.log(`ProductBookingForm: Decremented ${field} to ${newValue}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isBookable) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    const adults = formData.adults === '' || isNaN(parseInt(formData.adults)) ? 0 : parseInt(formData.adults);
    const children = formData.children === '' || isNaN(parseInt(formData.children)) ? 0 : parseInt(formData.children);

    if (!formData.date || !formData.time || adults === 0 || !formData.contact.name || !formData.contact.email || !formData.contact.message || !formData.contact.phone) {
      setError('All required fields (date, time, adults, name, email, message, phone) must be filled.');
      setAdultsError(adults === 0 ? 'At least 1 adult is required.' : null);
      setLoading(false);
      return;
    }
    if (children === 0) {
      setChildrenError('Number of children cannot be 0.');
      setLoading(false);
      return;
    }
    if (!Number.isFinite(parseFloat(totalPrice)) || parseFloat(totalPrice) <= 0) {
      setError('Invalid total price. Please check your selection.');
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const bookingData = {
        productType: decodeURIComponent(productName),
        date: formData.date,
        time: formData.time,
        adults,
        children,
        totalPrice: parseFloat(totalPrice),
        specialNotes: formData.specialNotes,
        touristId: decoded.id,
        contact: formData.contact
      };
      console.log('ProductBookingForm: Sending booking data:', bookingData);
      const response = await axios.post(bookingEndpoint, bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('ProductBookingForm: Booking created:', response.data);
      setSuccess('Booking created successfully! Awaiting admin approval.');
      setTimeout(() => navigate('/tourist-dashboard'), 2000);
    } catch (err) {
      console.error('ProductBookingForm: Error creating booking:', err.response?.data || err.message);
      const errorMessage = err.response?.status === 404
        ? 'Booking endpoint not found. Please check the API URL configuration.'
        : err.response?.data?.error || 'Failed to create booking. Please try again.';
      setError(errorMessage);
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
          <div className="form-group number-input-group">
            <label>Adults</label>
            <div className="number-input-wrapper">
              <button
                type="button"
                className="number-button decrement"
                onClick={() => handleDecrement('adults')}
                disabled={parseInt(formData.adults || '0') <= 1}
              >
                −
              </button>
              <input
                type="number"
                name="adults"
                value={formData.adults}
                onChange={handleChange}
                onInput={handleInput}
                onFocus={handleFocus}
                placeholder="Enter number"
                min="0"
                required
                className="number-input"
              />
              <button
                type="button"
                className="number-button increment"
                onClick={() => handleIncrement('adults')}
              >
                ^
              </button>
            </div>
            {adultsError && <div className="field-error">{adultsError}</div>}
          </div>
          <div className="form-group number-input-group">
            <label>Children</label>
            <div className="number-input-wrapper">
              <button
                type="button"
                className="number-button decrement"
                onClick={() => handleDecrement('children')}
                disabled={parseInt(formData.children || '0') <= 0}
              >
                −
              </button>
              <input
                type="number"
                name="children"
                value={formData.children}
                onChange={handleChange}
                onInput={handleInput}
                onFocus={handleFocus}
                placeholder="Enter number"
                min="0"
                className="number-input"
              />
              <button
                type="button"
                className="number-button increment"
                onClick={() => handleIncrement('children')}
              >
                ^
              </button>
            </div>
            {childrenError && <div className="field-error">{childrenError}</div>}
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
            <button type="submit" disabled={loading || adultsError || childrenError} className="cta-button">
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
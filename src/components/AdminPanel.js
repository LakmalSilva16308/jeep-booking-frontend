import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminPanel.css';
import { jwtDecode } from 'jwt-decode';

// ErrorBoundary component to catch rendering errors
class ErrorBoundary extends React.Component {
  state = { error: null, providerId: null };
  static getDerivedStateFromError(error) {
    return { error, providerId: null };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error for provider ID:', this.props.providerId || 'unknown', error, errorInfo);
  }
  render() {
    if (this.state.error) {
      console.error(`ErrorBoundary: Error rendering provider ID=${this.props.providerId || 'unknown'}`, this.state.error);
      return <div className="error">Error rendering provider: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

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
    { min: 1, max: Infinity, price: 9 }
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

function AdminPanel() {
  const navigate = useNavigate();
  const [pendingProviders, setPendingProviders] = useState([]);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tourists, setTourists] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddProviderForm, setShowAddProviderForm] = useState(false);
  const [showAddTouristForm, setShowAddTouristForm] = useState(false);
  const [showAddBookingForm, setShowAddBookingForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [providerFormData, setProviderFormData] = useState({
    serviceName: '',
    fullName: '',
    email: '',
    contact: '',
    category: '',
    location: '',
    price: '',
    description: '',
    password: '',
    profilePicture: null,
    photos: []
  });
  const [touristFormData, setTouristFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    country: ''
  });
  const [bookingFormData, setBookingFormData] = useState({
    providerId: '',
    touristId: '',
    productType: '',
    date: '',
    time: '',
    adults: 1,
    children: 0,
    totalPrice: '',
    status: 'pending',
    specialNotes: ''
  });
  const token = localStorage.getItem('token');

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const cleanApiUrl = apiUrl.replace(/\/+$/, '');

  const categories = [
    'Jeep Safari', 'Tuk Tuk Ride', 'Catamaran Boat Ride', 'Bullock Cart Ride', 'Village Lunch'
  ];

  const productTypes = [
    'Jeep Safari', 'Tuk Tuk Adventures', 'Catamaran Boat Ride', 'Village Cooking Experience',
    'Traditional Village Lunch', 'Sundowners Cocktail', 'High Tea', 'Bullock Cart Ride',
    'Budget Village Tour', 'Village Tour', 'Bicycle Tour', 'Sigiriya Lion Rock',
    'Pidurangala Rock', 'Polonnaruwa City Tour', 'Motor Bikes Rent', 'Village Walk Tour',
    'Hiriwadunna Village Tour and Jeep Safari One Day Tour',
    'Sigiriya Tour,Dambulla Temple, Village Tour and Jeep Safari'
  ];

  // Normalize provider data
  const normalizeProvider = useCallback((provider) => {
    if (!provider || typeof provider !== 'object') {
      console.error('AdminPanel: Invalid provider object', provider);
      return null;
    }
    console.log(`AdminPanel: Normalizing provider ID=${provider._id || 'unknown'}`, JSON.stringify(provider, null, 2));
    let serviceName = provider.serviceName;
    // Handle nested serviceName or malformed data
    let depth = 0;
    const maxDepth = 10; // Prevent infinite loops
    while (serviceName && typeof serviceName === 'object' && depth < maxDepth) {
      console.warn(`AdminPanel: Found nested serviceName at depth ${depth} for provider ID=${provider._id || 'unknown'}`, serviceName);
      serviceName = serviceName.serviceName || serviceName.name || undefined;
      depth++;
    }
    if (depth >= maxDepth) {
      console.error(`AdminPanel: Maximum nesting depth reached for provider ID=${provider._id || 'unknown'}`);
      serviceName = 'Unknown Service';
    }
    if (typeof serviceName !== 'string' || !serviceName) {
      console.error(`AdminPanel: Invalid serviceName for provider ID=${provider._id || 'unknown'}`, serviceName);
      serviceName = provider.name || 'Unknown Service';
    }
    // Normalize profilePicture path
    let profilePicture = provider.profilePicture || '';
    if (profilePicture && profilePicture.startsWith('/')) {
      profilePicture = profilePicture.replace(/^\/+/, '');
    }
    const normalized = {
      ...provider,
      serviceName,
      category: typeof provider.category === 'string' ? provider.category : 'Unknown',
      price: typeof provider.price === 'number' ? provider.price : 0,
      approved: !!provider.approved,
      profilePicture
    };
    console.log(`AdminPanel: Normalized provider ID=${provider._id || 'unknown'}`, JSON.stringify(normalized, null, 2));
    return normalized;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('No token found. Please log in as an admin.');
        setLoading(false);
        navigate('/login');
        return;
      }
      try {
        console.log('AdminPanel: Fetching admin data...');
        const [pendingProvidersRes, providersRes, bookingsRes, touristsRes, reviewsRes, contactMessagesRes] = await Promise.all([
          axios.get(`${cleanApiUrl}/admin/pending-providers`, { headers: { Authorization: `Bearer ${token}` } }).catch(err => {
            console.error('Pending providers fetch failed:', err.response?.data || err.message);
            return { data: [] };
          }),
          axios.get(`${cleanApiUrl}/admin/providers`, { headers: { Authorization: `Bearer ${token}` } }).catch(err => {
            console.error('Providers fetch failed:', err.response?.data || err.message);
            return { data: [] };
          }),
          axios.get(`${cleanApiUrl}/bookings/admin`, { headers: { Authorization: `Bearer ${token}` } }).catch(err => {
            console.error('Bookings fetch failed:', err.response?.data || err.message);
            return { data: [] };
          }),
          axios.get(`${cleanApiUrl}/admin/tourists`, { headers: { Authorization: `Bearer ${token}` } }).catch(err => {
            console.error('Tourists fetch failed:', err.response?.data || err.message);
            return { data: [] };
          }),
          axios.get(`${cleanApiUrl}/admin/reviews`, { headers: { Authorization: `Bearer ${token}` } }).catch(err => {
            console.error('Reviews fetch failed:', err.response?.data || err.message);
            return { data: [] };
          }),
          axios.get(`${cleanApiUrl}/admin/contact-messages`, { headers: { Authorization: `Bearer ${token}` } }).catch(err => {
            console.error('Contact messages fetch failed:', err.response?.data || err.message);
            return { data: [] };
          })
        ]);
        console.log('AdminPanel: Fetched data:', {
          pendingProviders: pendingProvidersRes.data.length,
          providers: providersRes.data.length,
          bookings: bookingsRes.data.length,
          tourists: touristsRes.data.length,
          reviews: reviewsRes.data.length,
          contactMessages: contactMessagesRes.data.length
        });
        console.log('AdminPanel: Raw providers response:', JSON.stringify(providersRes.data, null, 2));
        console.log('AdminPanel: Raw pending providers response:', JSON.stringify(pendingProvidersRes.data, null, 2));
        const normalizedProviders = providersRes.data
          .map(provider => normalizeProvider(provider))
          .filter(p => p !== null);
        const normalizedPendingProviders = pendingProvidersRes.data
          .map(provider => normalizeProvider(provider))
          .filter(p => p !== null);
        normalizedProviders.forEach((provider, index) => {
          console.log(`AdminPanel: Normalized Provider ${index} - ID: ${provider._id}, Data:`, JSON.stringify(provider, null, 2));
        });
        normalizedPendingProviders.forEach((provider, index) => {
          console.log(`AdminPanel: Normalized Pending Provider ${index} - ID: ${provider._id}, Data:`, JSON.stringify(provider, null, 2));
        });
        setPendingProviders(normalizedPendingProviders);
        setProviders(normalizedProviders);
        console.log('AdminPanel: Updated providers state:', JSON.stringify(normalizedProviders, null, 2));
        console.log('AdminPanel: Updated pending providers state:', JSON.stringify(normalizedPendingProviders, null, 2));
        setBookings(bookingsRes.data || []);
        setTourists(touristsRes.data || []);
        setReviews(reviewsRes.data || []);
        setContactMessages(contactMessagesRes.data || []);
        setAnalytics({
          totalBookings: bookingsRes.data.length,
          totalRevenue: bookingsRes.data.reduce((sum, b) => sum + ((b.totalPrice || 0) / 300), 0), // Convert LKR to USD
          totalProviders: providersRes.data.length,
          totalTourists: touristsRes.data.length,
          topCategory: bookingsRes.data.length > 0 ?
            Object.entries(bookingsRes.data.reduce((acc, b) => {
              const cat = b.providerId?.category || b.productType || 'Unknown';
              acc[cat] = (acc[cat] || 0) + 1;
              return acc;
            }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] : 'N/A'
        });
      } catch (err) {
        console.error('AdminPanel: Error fetching admin data:', err.response?.data || err.message);
        setError('Failed to load admin data. Please try again.');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          setError('Session expired. Please log in again.');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, navigate, cleanApiUrl, normalizeProvider]);

  const handleProviderFormChange = (e) => {
    const { name, value, files } = e.target;
    setProviderFormData(prev => ({
      ...prev,
      [name]: files ? (name === 'photos' ? Array.from(files) : files[0]) : value
    }));
  };

  const handleTouristFormChange = (e) => {
    const { name, value } = e.target;
    setTouristFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookingFormChange = (e) => {
    const { name, value } = e.target;
    console.log(`AdminPanel: handleBookingFormChange name=${name}, value=${value}`);
    setBookingFormData(prev => ({
      ...prev,
      [name]: name === 'adults' || name === 'children' ? parseInt(value) >= 0 ? parseInt(value) : prev[name] : value
    }));
  };

  const calculateBookingPrice = useCallback(() => {
    const { productType, adults, children } = bookingFormData;
    const totalPersons = parseInt(adults || 1) + parseInt(children || 0);
    console.log(`AdminPanel: calculateBookingPrice productType=${productType}, totalPersons=${totalPersons}`);
    const pricing = PRICING_STRUCTURE[productType];
    if (!pricing) {
      console.log(`AdminPanel: No pricing for ${productType}`);
      return 0;
    }
    const tier = pricing.find(tier => totalPersons >= tier.min && totalPersons <= tier.max);
    if (tier) {
      const price = (totalPersons * tier.price).toFixed(2);
      console.log(`AdminPanel: Selected tier=${JSON.stringify(tier)}, price=${price}`);
      return price;
    }
    console.log(`AdminPanel: No tier found for ${totalPersons} persons`);
    return 0;
  }, [bookingFormData.productType, bookingFormData.adults, bookingFormData.children]);

  useEffect(() => {
    if (bookingFormData.productType && (bookingFormData.adults || bookingFormData.children)) {
      const price = calculateBookingPrice();
      setBookingFormData(prev => ({ ...prev, totalPrice: price }));
    }
  }, [bookingFormData.productType, bookingFormData.adults, bookingFormData.children, calculateBookingPrice]);

  const handleAddProvider = async () => {
    try {
      const formData = new FormData();
      Object.keys(providerFormData).forEach(key => {
        if (key === 'photos') {
          providerFormData.photos.forEach(photo => formData.append('photos', photo));
        } else if (providerFormData[key]) {
          formData.append(key, providerFormData[key]);
        }
      });
      const { data: { provider } } = await axios.post(`${cleanApiUrl}/admin/providers`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      console.log(`AdminPanel: Adding provider ID=${provider._id}`, JSON.stringify(provider, null, 2));
      const normalizedProvider = normalizeProvider(provider);
      if (normalizedProvider) {
        setProviders(prev => {
          const newProviders = [...prev, normalizedProvider];
          console.log('AdminPanel: Providers state after adding:', JSON.stringify(newProviders, null, 2));
          return newProviders;
        });
        setPendingProviders(prev => {
          const newPending = prev.filter(p => p._id !== provider._id);
          console.log('AdminPanel: Pending providers state after adding:', JSON.stringify(newPending, null, 2));
          return newPending;
        });
      }
      setProviderFormData({
        serviceName: '',
        fullName: '',
        email: '',
        contact: '',
        category: '',
        location: '',
        price: '',
        description: '',
        password: '',
        profilePicture: null,
        photos: []
      });
      setShowAddProviderForm(false);
      alert('Provider added successfully!');
    } catch (err) {
      console.error('AdminPanel: Error adding provider:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to add provider');
    }
  };

  const handleAddTourist = async () => {
    try {
      const { data: { tourist } } = await axios.post(`${cleanApiUrl}/admin/tourists`, touristFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTourists(prev => [...prev, tourist]);
      setTouristFormData({ fullName: '', email: '', password: '', country: '' });
      setShowAddTouristForm(false);
      alert('Tourist added successfully!');
    } catch (err) {
      console.error('AdminPanel: Error adding tourist:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to add tourist');
    }
  };

  const handleAddBooking = async () => {
    try {
      const { data: { booking } } = await axios.post(
        `${cleanApiUrl}/bookings/admin`,
        {
          ...bookingFormData,
          totalPrice: parseFloat(bookingFormData.totalPrice) || 0
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(prev => [...prev, booking]);
      setBookingFormData({
        providerId: '',
        touristId: '',
        productType: '',
        date: '',
        time: '',
        adults: 1,
        children: 0,
        totalPrice: '',
        status: 'pending',
        specialNotes: ''
      });
      setShowAddBookingForm(false);
      alert('Booking added successfully!');
    } catch (err) {
      console.error('AdminPanel: Error adding booking:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to add booking');
    }
  };

  const handleApproveProvider = async (id) => {
    try {
      const { data: { provider } } = await axios.put(
        `${cleanApiUrl}/admin/providers/${id}/approve`,
        { approved: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(`AdminPanel: Approving provider ID=${provider._id}`, JSON.stringify(provider, null, 2));
      const normalizedProvider = normalizeProvider(provider);
      if (normalizedProvider) {
        setPendingProviders(prev => {
          const newPending = prev.filter(p => p._id !== id);
          console.log('AdminPanel: Pending providers state after approving:', JSON.stringify(newPending, null, 2));
          return newPending;
        });
        setProviders(prev => {
          const newProviders = [...prev, normalizedProvider];
          console.log('AdminPanel: Providers state after approving:', JSON.stringify(newProviders, null, 2));
          return newProviders;
        });
      }
      alert('Provider approved successfully!');
    } catch (err) {
      console.error('AdminPanel: Error approving provider:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to approve provider');
    }
  };

  const handleDeleteProvider = async (id) => {
    try {
      await axios.delete(`${cleanApiUrl}/admin/providers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProviders(prev => {
        const newProviders = prev.filter(p => p._id !== id);
        console.log('AdminPanel: Providers state after deleting:', JSON.stringify(newProviders, null, 2));
        return newProviders;
      });
      setPendingProviders(prev => {
        const newPending = prev.filter(p => p._id !== id);
        console.log('AdminPanel: Pending providers state after deleting:', JSON.stringify(newPending, null, 2));
        return newPending;
      });
      alert('Provider deleted successfully!');
    } catch (err) {
      console.error('AdminPanel: Error deleting provider:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to delete provider');
    }
  };

  const handleDeleteTourist = async (id) => {
    try {
      await axios.delete(`${cleanApiUrl}/admin/tourists/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTourists(prev => prev.filter(t => t._id !== id));
      alert('Tourist deleted successfully!');
    } catch (err) {
      console.error('AdminPanel: Error deleting tourist:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to delete tourist');
    }
  };

  const handleApproveBooking = async (id) => {
    try {
      const { data: { booking } } = await axios.put(
        `${cleanApiUrl}/bookings/admin/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(prev => prev.map(b => (b._id === id ? booking : b)));
      alert('Booking approved successfully!');
    } catch (err) {
      console.error('AdminPanel: Error approving booking:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to approve booking');
    }
  };

  const handleDeleteBooking = async (id) => {
    try {
      await axios.delete(`${cleanApiUrl}/bookings/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(prev => prev.filter(b => b._id !== id));
      alert('Booking deleted successfully!');
    } catch (err) {
      console.error('AdminPanel: Error deleting booking:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to delete booking');
    }
  };

  const handleApproveReview = async (id) => {
    try {
      const { data: { review } } = await axios.put(
        `${cleanApiUrl}/admin/reviews/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews(prev => prev.map(r => (r._id === id ? review : r)));
      alert('Review approved successfully!');
    } catch (err) {
      console.error('AdminPanel: Error approving review:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to approve review');
    }
  };

  const handleDeleteReview = async (id) => {
    try {
      await axios.delete(`${cleanApiUrl}/admin/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(prev => prev.filter(r => r._id !== id));
      alert('Review deleted successfully!');
    } catch (err) {
      console.error('AdminPanel: Error deleting review:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to delete review');
    }
  };

  const handleDeleteContactMessage = async (id) => {
    try {
      console.log(`AdminPanel: Attempting to delete contact message ID=${id}`);
      await axios.delete(`${cleanApiUrl}/admin/contact-messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContactMessages(prev => prev.filter(m => m._id !== id));
      console.log(`AdminPanel: Contact message deleted ID=${id}`);
      alert('Contact message deleted successfully!');
    } catch (err) {
      console.error('AdminPanel: Error deleting contact message:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to delete contact message');
    }
  };

  const handleBookingClick = (booking) => {
    console.log(`AdminPanel: Booking clicked, ID=${booking._id}, Total Price=${(booking.totalPrice / 300).toFixed(2)} USD (original: ${booking.totalPrice} LKR), Product=${booking.productType || booking.providerId?.serviceName || 'N/A'}`);
    setSelectedBooking(booking);
  };

  const closeModal = () => {
    setSelectedBooking(null);
  };

  if (loading) return <div className="container">Loading admin panel...</div>;
  if (error) return <div className="container error">{error}</div>;

  return (
    <ErrorBoundary providerId="root">
      <div className="admin-panel">
        <h2>Admin Dashboard</h2>
        <div className="admin-grid">
          <div className="admin-card">
            <h3>Analytics</h3>
            <p>Total Bookings: {analytics.totalBookings || 0}</p>
            <p>Total Revenue: USD {(analytics.totalRevenue || 0).toFixed(2)}</p>
            <p>Total Providers: {analytics.totalProviders || 0}</p>
            <p>Total Tourists: {analytics.totalTourists || 0}</p>
            <p>Top Category: {analytics.topCategory || 'N/A'}</p>
          </div>

          <div className="admin-card">
            <h3>Pending Providers ({pendingProviders.length})</h3>
            <ul className="admin-list">
              {pendingProviders.map(provider => (
                provider && provider._id ? (
                  <ErrorBoundary key={provider._id} providerId={provider._id}>
                    <li>
                      <span>
                        {typeof provider.serviceName === 'string' ? provider.serviceName : (
                          console.warn(`Invalid serviceName for provider ID=${provider._id}`, provider.serviceName),
                          'Unknown Service'
                        )} - 
                        {typeof provider.category === 'string' ? provider.category.replace('-', ' ') : 'Unknown'} - 
                        USD {typeof provider.price === 'number' ? provider.price.toFixed(2) : '0.00'}
                      </span>
                      <img
                        src={provider.profilePicture ? `${cleanApiUrl}/${provider.profilePicture}` : '/images/placeholder.jpg'}
                        alt={typeof provider.serviceName === 'string' ? provider.serviceName : 'Provider'}
                        className="provider-image"
                        onError={(e) => {
                          console.error(`Failed to load image for provider ID=${provider._id}: ${cleanApiUrl}/${provider.profilePicture}`);
                          e.target.src = '/images/placeholder.jpg';
                        }}
                      />
                      <div>
                        <button className="admin-button approve" onClick={() => handleApproveProvider(provider._id)}>Approve</button>
                        <button className="admin-button danger" onClick={() => handleDeleteProvider(provider._id)}>Delete</button>
                      </div>
                    </li>
                  </ErrorBoundary>
                ) : (
                  console.warn('Skipping invalid provider:', provider),
                  null
                )
              ))}
            </ul>
            <button className="admin-button cta-button" onClick={() => setShowAddProviderForm(true)}>Add Provider</button>
          </div>

          <div className="admin-card">
            <h3>All Providers ({providers.length})</h3>
            <ul className="admin-list">
              {providers.map(provider => (
                provider && provider._id ? (
                  <ErrorBoundary key={provider._id} providerId={provider._id}>
                    <li>
                      <span>
                        {typeof provider.serviceName === 'string' ? provider.serviceName : (
                          console.warn(`Invalid serviceName for provider ID=${provider._id}`, provider.serviceName),
                          'Unknown Service'
                        )} - 
                        {typeof provider.category === 'string' ? provider.category.replace('-', ' ') : 'Unknown'} - 
                        {provider.approved ? 'Approved' : 'Pending'} - 
                        USD {typeof provider.price === 'number' ? provider.price.toFixed(2) : '0.00'}
                      </span>
                      <img
                        src={provider.profilePicture ? `${cleanApiUrl}/${provider.profilePicture}` : '/images/placeholder.jpg'}
                        alt={typeof provider.serviceName === 'string' ? provider.serviceName : 'Provider'}
                        className="provider-image"
                        onError={(e) => {
                          console.error(`Failed to load image for provider ID=${provider._id}: ${cleanApiUrl}/${provider.profilePicture}`);
                          e.target.src = '/images/placeholder.jpg';
                        }}
                      />
                      <button className="admin-button danger" onClick={() => handleDeleteProvider(provider._id)}>Delete</button>
                    </li>
                  </ErrorBoundary>
                ) : (
                  console.warn('Skipping invalid provider:', provider),
                  null
                )
              ))}
            </ul>
          </div>

          <div className="admin-card">
            <h3>Manage Bookings ({bookings.length})</h3>
            <div className="bookings-table-container">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Provider/Product</th>
                    <th>Tourist</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking._id} onClick={() => handleBookingClick(booking)}>
                      <td>
                        {(typeof booking.providerId === 'object' && booking.providerId?.serviceName) || booking.productType || 'N/A'}
                      </td>
                      <td>{booking.touristId?.fullName || 'Unknown'}</td>
                      <td>{new Date(booking.date).toLocaleDateString()}</td>
                      <td><span className={`status-badge status-${booking.status}`}>{booking.status}</span></td>
                      <td>
                        {booking.status !== 'confirmed' && (
                          <button className="admin-button approve" onClick={(e) => { e.stopPropagation(); handleApproveBooking(booking._id); }}>
                            Approve
                          </button>
                        )}
                        <button className="admin-button danger" onClick={(e) => { e.stopPropagation(); handleDeleteBooking(booking._id); }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="admin-button cta-button" onClick={() => setShowAddBookingForm(true)}>Add Booking</button>
          </div>

          <div className="admin-card">
            <h3>Manage Tourists ({tourists.length})</h3>
            <ul className="admin-list">
              {tourists.map(tourist => (
                <li key={tourist._id}>
                  <span>{tourist.fullName} - {tourist.email}</span>
                  <button className="admin-button danger" onClick={() => handleDeleteTourist(tourist._id)}>Delete</button>
                </li>
              ))}
            </ul>
            <button className="admin-button cta-button" onClick={() => setShowAddTouristForm(true)}>Add Tourist</button>
          </div>

          <div className="admin-card">
            <h3>Manage Reviews ({reviews.length})</h3>
            <ul className="admin-list">
              {reviews.map(review => (
                <li key={review._id}>
                  <span>
                    {review.reviewType === 'product' ? review.targetId : (review.targetId?.serviceName || review.targetId?.fullName || 'N/A')} 
                    ({review.reviewType}) - Rating: {review.rating} - By: {review.reviewerId?.fullName || review.reviewerId?.serviceName || 'N/A'}
                  </span>
                  <p>{review.comment}</p>
                  <div>
                    {!review.approved && (
                      <button className="admin-button approve" onClick={() => handleApproveReview(review._id)}>Approve</button>
                    )}
                    <button className="admin-button danger" onClick={() => handleDeleteReview(review._id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="admin-card">
            <h3>Contact Messages ({contactMessages.length})</h3>
            {contactMessages.length === 0 ? (
              <p>No contact messages available.</p>
            ) : (
              <div className="bookings-table-container">
                <table className="bookings-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Message</th>
                      <th>Submitted At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contactMessages.map(message => (
                      <tr key={message._id}>
                        <td>{message.name || 'Unknown'}</td>
                        <td>{message.email || 'N/A'}</td>
                        <td>{message.phone || 'N/A'}</td>
                        <td>{message.message?.substring(0, 50) + (message.message?.length > 50 ? '...' : '') || 'None'}</td>
                        <td>{new Date(message.createdAt).toLocaleString()}</td>
                        <td>
                          <button className="admin-button danger" onClick={() => handleDeleteContactMessage(message._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {showAddProviderForm && (
          <div className="modal">
            <div className="modal-content">
              <h3>Add New Provider</h3>
              <div className="form-container">
                <div className="form-group">
                  <label htmlFor="serviceName">Service Name</label>
                  <input
                    type="text"
                    id="serviceName"
                    name="serviceName"
                    value={providerFormData.serviceName}
                    onChange={handleProviderFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={providerFormData.fullName}
                    onChange={handleProviderFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={providerFormData.email}
                    onChange={handleProviderFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact">Contact</label>
                  <input
                    type="text"
                    id="contact"
                    name="contact"
                    value={providerFormData.contact}
                    onChange={handleProviderFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={providerFormData.category}
                    onChange={handleProviderFormChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={providerFormData.location}
                    onChange={handleProviderFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="price">Price (USD)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={providerFormData.price}
                    onChange={handleProviderFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={providerFormData.description}
                    onChange={handleProviderFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={providerFormData.password}
                    onChange={handleProviderFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="profilePicture">Profile Picture</label>
                  <input
                    type="file"
                    id="profilePicture"
                    name="profilePicture"
                    accept="image/jpeg,image/png"
                    onChange={handleProviderFormChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="photos">Additional Photos</label>
                  <input
                    type="file"
                    id="photos"
                    name="photos"
                    accept="image/jpeg,image/png"
                    multiple
                    onChange={handleProviderFormChange}
                  />
                </div>
                <div className="form-group">
                  <button className="admin-button cta-button" onClick={handleAddProvider}>Add Provider</button>
                  <button className="admin-button danger" onClick={() => setShowAddProviderForm(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAddTouristForm && (
          <div className="modal">
            <div className="modal-content">
              <h3>Add New Tourist</h3>
              <div className="form-container">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={touristFormData.fullName}
                    onChange={handleTouristFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={touristFormData.email}
                    onChange={handleTouristFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={touristFormData.password}
                    onChange={handleTouristFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={touristFormData.country}
                    onChange={handleTouristFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <button className="admin-button cta-button" onClick={handleAddTourist}>Add Tourist</button>
                  <button className="admin-button danger" onClick={() => setShowAddTouristForm(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAddBookingForm && (
          <div className="modal">
            <div className="modal-content">
              <h3>Add New Booking</h3>
              <div className="form-container">
                <div className="form-group">
                  <label htmlFor="providerId">Provider (Optional)</label>
                  <select
                    id="providerId"
                    name="providerId"
                    value={bookingFormData.providerId}
                    onChange={handleBookingFormChange}
                  >
                    <option value="">Select Provider</option>
                    {providers
                      .filter(provider => provider && provider._id && typeof provider.serviceName === 'string')
                      .map(provider => (
                        <option key={provider._id} value={provider._id}>
                          {provider.serviceName}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="productType">Product Type (Optional)</label>
                  <select
                    id="productType"
                    name="productType"
                    value={bookingFormData.productType}
                    onChange={handleBookingFormChange}
                  >
                    <option value="">Select Product</option>
                    {productTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="touristId">Tourist</label>
                  <select
                    id="touristId"
                    name="touristId"
                    value={bookingFormData.touristId}
                    onChange={handleBookingFormChange}
                    required
                  >
                    <option value="">Select Tourist</option>
                    {tourists.map(tourist => (
                      <option key={tourist._id} value={tourist._id}>{tourist.fullName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={bookingFormData.date}
                    onChange={handleBookingFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="time">Time</label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={bookingFormData.time}
                    onChange={handleBookingFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="adults">Adults</label>
                  <input
                    type="number"
                    id="adults"
                    name="adults"
                    value={bookingFormData.adults}
                    onChange={handleBookingFormChange}
                    min="1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="children">Children</label>
                  <input
                    type="number"
                    id="children"
                    name="children"
                    value={bookingFormData.children}
                    onChange={handleBookingFormChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="totalPrice">Total Price (USD)</label>
                  <input
                    type="number"
                    id="totalPrice"
                    name="totalPrice"
                    value={bookingFormData.totalPrice}
                    onChange={handleBookingFormChange}
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={bookingFormData.status}
                    onChange={handleBookingFormChange}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="specialNotes">Special Notes</label>
                  <textarea
                    id="specialNotes"
                    name="specialNotes"
                    value={bookingFormData.specialNotes}
                    onChange={handleBookingFormChange}
                  />
                </div>
                <div className="form-group">
                  <button className="admin-button cta-button" onClick={handleAddBooking}>Add Booking</button>
                  <button className="admin-button danger" onClick={() => setShowAddBookingForm(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedBooking && (
          <div className="modal">
            <div className="modal-content">
              <h3>Booking Details</h3>
              <h4>Booking Information</h4>
              <p><strong>Booking ID:</strong> {selectedBooking._id}</p>
              <p><strong>Tourist Name:</strong> {selectedBooking.touristId?.fullName || 'Unknown'}</p>
              <p><strong>Tourist Email:</strong> {selectedBooking.touristId?.email || 'N/A'}</p>
              <p><strong>Tourist Phone:</strong> {selectedBooking.contactId?.phone || 'N/A'}</p>
              <p><strong>Service/Product:</strong> {(typeof selectedBooking.providerId === 'object' && selectedBooking.providerId?.serviceName) || selectedBooking.productType || 'N/A'}</p>
              <p><strong>Total Price:</strong> USD {(selectedBooking.totalPrice / 300).toFixed(2)}</p>
              <p><strong>Date:</strong> {new Date(selectedBooking.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {selectedBooking.time}</p>
              <p><strong>Adults:</strong> {selectedBooking.adults}</p>
              <p><strong>Children:</strong> {selectedBooking.children || 0}</p>
              <p><strong>Status:</strong> {selectedBooking.status}</p>
              <p><strong>Special Notes:</strong> {selectedBooking.specialNotes || 'None'}</p>
              <button className="admin-button cta-button" onClick={closeModal}>Close</button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default AdminPanel;
import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/App.css';

function AdminPanel() {
  const [pendingProviders, setPendingProviders] = useState([]);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tourists, setTourists] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddProviderForm, setShowAddProviderForm] = useState(false);
  const [showAddTouristForm, setShowAddTouristForm] = useState(false);
  const [showAddBookingForm, setShowAddBookingForm] = useState(false);
  const [providerFormData, setProviderFormData] = useState({
    serviceName: '', fullName: '', email: '', contact: '', category: '', location: '', price: '', description: '', password: '', profilePicture: null, photos: []
  });
  const [touristFormData, setTouristFormData] = useState({
    fullName: '', email: '', password: '', country: ''
  });
  const [bookingFormData, setBookingFormData] = useState({
    providerId: '', touristId: '', date: '', time: '', adults: 1, children: 0, status: 'pending'
  });
  const token = localStorage.getItem('token');

  const categories = [
    'Jeep Safari', 'Tuk Tuk Ride', 'Catamaran Boat Ride', 'Bullock Cart Ride', 'Village Lunch'
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('No token found. Please log in as an admin.');
        setLoading(false);
        return;
      }
      try {
        console.log('Fetching admin data...');
        const [pendingProvidersRes, providersRes, bookingsRes, touristsRes, reviewsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/providers/admin/pending', { headers: { Authorization: `Bearer ${token}` } }).catch(err => {
            console.error('Pending providers fetch failed:', err.response?.data || err.message);
            return { data: [] };
          }),
          axios.get('http://localhost:5000/api/providers/admin', { headers: { Authorization: `Bearer ${token}` } }).catch(err => {
            console.error('Providers fetch failed:', err.response?.data || err.message);
            return { data: [] };
          }),
          axios.get('http://localhost:5000/api/bookings/admin', { headers: { Authorization: `Bearer ${token}` } }).catch(err => {
            console.error('Bookings fetch failed:', err.response?.data || err.message);
            return { data: [] };
          }),
          axios.get('http://localhost:5000/api/tourists/admin', { headers: { Authorization: `Bearer ${token}` } }).catch(err => {
            console.error('Tourists fetch failed:', err.response?.data || err.message);
            return { data: [] };
          }),
          axios.get('http://localhost:5000/api/reviews/admin/reviews', { headers: { Authorization: `Bearer ${token}` } }).catch(err => {
            console.error('Reviews fetch failed:', err.response?.data || err.message);
            return { data: [] };
          })
        ]);
        console.log('Pending Providers:', pendingProvidersRes.data);
        console.log('Providers:', providersRes.data);
        console.log('Bookings:', bookingsRes.data);
        console.log('Tourists:', touristsRes.data);
        console.log('Reviews:', reviewsRes.data);
        setPendingProviders(pendingProvidersRes.data || []);
        setProviders(providersRes.data || []);
        setBookings(bookingsRes.data || []);
        setTourists(touristsRes.data || []);
        setReviews(reviewsRes.data || []);
        setAnalytics({
          totalBookings: bookingsRes.data.length,
          totalRevenue: bookingsRes.data.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
          topCategory: bookingsRes.data.length > 0 ? 
            Object.entries(bookingsRes.data.reduce((acc, b) => {
              const cat = b.providerId?.category || 'Unknown';
              acc[cat] = (acc[cat] || 0) + 1;
              return acc;
            }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] : 'N/A'
        });
      } catch (err) {
        console.error('Error fetching admin data:', err.response?.data || err.message);
        setError('Failed to load admin data: ' + (err.response?.data?.error || err.message));
      }
      setLoading(false);
    };
    fetchData();
  }, [token]);

  const handleProviderFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture') {
      setProviderFormData({ ...providerFormData, [name]: files[0] });
    } else if (name === 'photos') {
      setProviderFormData({ ...providerFormData, [name]: Array.from(files) });
    } else {
      setProviderFormData({ ...providerFormData, [name]: value });
    }
  };

  const handleTouristFormChange = (e) => {
    const { name, value } = e.target;
    setTouristFormData({ ...touristFormData, [name]: value });
  };

  const handleBookingFormChange = (e) => {
    const { name, value } = e.target;
    setBookingFormData({ ...bookingFormData, [name]: value });
  };

  const handleAddProvider = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(providerFormData).forEach(key => {
      if (key === 'photos') {
        providerFormData.photos.forEach(photo => data.append('photos', photo));
      } else if (providerFormData[key]) {
        data.append(key, providerFormData[key]);
      }
    });
    try {
      const res = await axios.post('http://localhost:5000/api/providers/admin', data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setProviders(prev => [...prev, res.data.provider]);
      setProviderFormData({ serviceName: '', fullName: '', email: '', contact: '', category: '', location: '', price: '', description: '', password: '', profilePicture: null, photos: [] });
      setShowAddProviderForm(false);
      alert('Provider added!');
    } catch (err) {
      console.error('Error adding provider:', err.response?.data || err.message);
      alert('Error adding provider: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddTourist = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/tourists/admin', touristFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTourists(prev => [...prev, res.data.tourist]);
      setTouristFormData({ fullName: '', email: '', password: '', country: '' });
      setShowAddTouristForm(false);
      alert('Tourist added!');
    } catch (err) {
      console.error('Error adding tourist:', err.response?.data || err.message);
      alert('Error adding tourist: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddBooking = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/bookings/admin', bookingFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(prev => [...prev, res.data.booking]);
      setBookingFormData({ providerId: '', touristId: '', date: '', time: '', adults: 1, children: 0, status: 'pending' });
      setShowAddBookingForm(false);
      alert('Booking added!');
    } catch (err) {
      console.error('Error adding booking:', err.response?.data || err.message);
      alert('Error adding booking: ' + (err.response?.data?.error || err.message));
    }
  };

  const approveProvider = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/providers/admin/${id}/approve`, { approved: true }, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Provider approved:', res.data);
      setPendingProviders(prev => prev.filter(p => p._id !== id));
      setProviders(prev => [...prev, { ...pendingProviders.find(p => p._id === id), approved: true }]);
      alert('Provider approved!');
    } catch (err) {
      console.error('Error approving provider:', err.response?.data || err.message);
      alert('Error approving provider: ' + (err.response?.data?.error || err.message));
    }
  };

  const approveBooking = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/bookings/admin/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Booking approved:', res.data);
      setBookings(prev => prev.map(b => b._id === id ? res.data.booking : b));
      alert('Booking approved!');
    } catch (err) {
      console.error('Error approving booking:', err.response?.data || err.message);
      alert('Error approving booking: ' + (err.response?.data?.error || err.message));
    }
  };

  const deleteProvider = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/providers/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Provider deleted:', res.data);
      setProviders(prev => prev.filter(p => p._id !== id));
      setPendingProviders(prev => prev.filter(p => p._id !== id));
      alert('Provider deleted!');
    } catch (err) {
      console.error('Error deleting provider:', err.response?.data || err.message);
      alert('Error deleting provider: ' + (err.response?.data?.error || err.message));
    }
  };

  const deleteBooking = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/bookings/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Booking deleted:', res.data);
      setBookings(prev => prev.filter(b => b._id !== id));
      alert('Booking deleted!');
    } catch (err) {
      console.error('Error deleting booking:', err.response?.data || err.message);
      alert('Error deleting booking: ' + (err.response?.data?.error || err.message));
    }
  };

  const deleteTourist = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/tourists/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Tourist deleted:', res.data);
      setTourists(prev => prev.filter(t => t._id !== id));
      alert('Tourist deleted!');
    } catch (err) {
      console.error('Error deleting tourist:', err.response?.data || err.message);
      alert('Error deleting tourist: ' + (err.response?.data?.error || err.message));
    }
  };

  const approveReview = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/reviews/admin/reviews/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Review approved:', res.data);
      setReviews(prev => prev.map(r => r._id === id ? { ...r, approved: true } : r));
      alert('Review approved!');
    } catch (err) {
      console.error('Error approving review:', err.response?.data || err.message);
      alert('Error approving review: ' + (err.response?.data?.error || err.message));
    }
  };

  const deleteReview = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/reviews/admin/reviews/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Review deleted:', res.data);
      setReviews(prev => prev.filter(r => r._id !== id));
      alert('Review deleted!');
    } catch (err) {
      console.error('Error deleting review:', err.response?.data || err.message);
      alert('Error deleting review: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <div className="container">Loading admin panel...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  return (
    <div className="admin-panel container">
      <h2>Admin Panel</h2>
      <div className="admin-grid">
        <div className="admin-card">
          <h3>Analytics</h3>
          <p>Total Bookings: {analytics.totalBookings || 0}</p>
          <p>Revenue: ${analytics.totalRevenue || 0}</p>
          <p>Top Category: {analytics.topCategory || 'N/A'}</p>
        </div>
        <div className="admin-card">
          <h3>Pending Providers ({pendingProviders.length})</h3>
          <button className="admin-button cta-button" onClick={() => setShowAddProviderForm(true)}>Add Provider</button>
          <ul className="admin-list">
            {pendingProviders.map(provider => (
              <li key={provider._id}>
                <span>{provider.serviceName} - {provider.category ? provider.category.replace('-', ' ') : 'Unknown'}</span>
                <button className="admin-button cta-button approve" onClick={() => approveProvider(provider._id)}>Approve</button>
                <button className="admin-button cta-button danger" onClick={() => deleteProvider(provider._id)}>Delete</button>
              </li>
            ))}
          </ul>
          {showAddProviderForm && (
            <form onSubmit={handleAddProvider} className="form-container">
              <h3>Add New Provider</h3>
              <div className="form-group">
                <label>Service Name</label>
                <input type="text" name="serviceName" value={providerFormData.serviceName} onChange={handleProviderFormChange} required />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="fullName" value={providerFormData.fullName} onChange={handleProviderFormChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={providerFormData.email} onChange={handleProviderFormChange} required />
              </div>
              <div className="form-group">
                <label>Contact</label>
                <input type="text" name="contact" value={providerFormData.contact} onChange={handleProviderFormChange} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={providerFormData.category} onChange={handleProviderFormChange} required>
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" name="location" value={providerFormData.location} onChange={handleProviderFormChange} required />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input type="number" name="price" value={providerFormData.price} onChange={handleProviderFormChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={providerFormData.description} onChange={handleProviderFormChange} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" value={providerFormData.password} onChange={handleProviderFormChange} required />
              </div>
              <div className="form-group">
                <label>Profile Picture</label>
                <input type="file" name="profilePicture" accept="image/jpeg,image/png" onChange={handleProviderFormChange} required />
              </div>
              <div className="form-group">
                <label>Photos (up to 5)</label>
                <input type="file" name="photos" accept="image/jpeg,image/png" multiple onChange={handleProviderFormChange} required />
              </div>
              <div className="form-group">
                <button type="submit" className="cta-button">Add Provider</button>
                <button type="button" className="cta-button" onClick={() => setShowAddProviderForm(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
        <div className="admin-card">
          <h3>All Providers ({providers.length})</h3>
          <ul className="admin-list">
            {providers.map(provider => (
              <li key={provider._id}>
                <span>{provider.serviceName} - {provider.category ? provider.category.replace('-', ' ') : 'Unknown'} - {provider.approved ? 'Approved' : 'Pending'}</span>
                <button className="admin-button cta-button danger" onClick={() => deleteProvider(provider._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="admin-card">
          <h3>All Bookings ({bookings.length})</h3>
          <button className="admin-button cta-button" onClick={() => setShowAddBookingForm(true)}>Add Booking</button>
          <ul className="admin-list">
            {bookings.map(booking => (
              <li key={booking._id}>
                <span>
                  {booking.touristId?.fullName || 'Unknown'} - 
                  {booking.providerId?.category ? booking.providerId.category.replace('-', ' ') : 'Unknown'} - 
                  ${booking.totalPrice || 0} - 
                  Status: {booking.status}
                </span>
                {booking.status !== 'confirmed' && (
                  <button className="admin-button cta-button approve" onClick={() => approveBooking(booking._id)}>Approve</button>
                )}
                <button className="admin-button cta-button danger" onClick={() => deleteBooking(booking._id)}>Delete</button>
              </li>
            ))}
          </ul>
          {showAddBookingForm && (
            <form onSubmit={handleAddBooking} className="form-container">
              <h3>Add New Booking</h3>
              <div className="form-group">
                <label>Provider</label>
                <select name="providerId" value={bookingFormData.providerId} onChange={handleBookingFormChange} required>
                  <option value="">Select Provider</option>
                  {providers.map(provider => (
                    <option key={provider._id} value={provider._id}>{provider.serviceName}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tourist</label>
                <select name="touristId" value={bookingFormData.touristId} onChange={handleBookingFormChange} required>
                  <option value="">Select Tourist</option>
                  {tourists.map(tourist => (
                    <option key={tourist._id} value={tourist._id}>{tourist.fullName}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" name="date" value={bookingFormData.date} onChange={handleBookingFormChange} required />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input type="time" name="time" value={bookingFormData.time} onChange={handleBookingFormChange} required />
              </div>
              <div className="form-group">
                <label>Adults</label>
                <input type="number" name="adults" value={bookingFormData.adults} onChange={handleBookingFormChange} min="1" required />
              </div>
              <div className="form-group">
                <label>Children</label>
                <input type="number" name="children" value={bookingFormData.children} onChange={handleBookingFormChange} min="0" />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={bookingFormData.status} onChange={handleBookingFormChange}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <button type="submit" className="cta-button">Add Booking</button>
                <button type="button" className="cta-button" onClick={() => setShowAddBookingForm(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
        <div className="admin-card">
          <h3>All Tourists ({tourists.length})</h3>
          <button className="admin-button cta-button" onClick={() => setShowAddTouristForm(true)}>Add Tourist</button>
          <ul className="admin-list">
            {tourists.map(tourist => (
              <li key={tourist._id}>
                <span>{tourist.fullName} - {tourist.email}</span>
                <button className="admin-button cta-button danger" onClick={() => deleteTourist(tourist._id)}>Delete</button>
              </li>
            ))}
          </ul>
          {showAddTouristForm && (
            <form onSubmit={handleAddTourist} className="form-container">
              <h3>Add New Tourist</h3>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="fullName" value={touristFormData.fullName} onChange={handleTouristFormChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={touristFormData.email} onChange={handleTouristFormChange} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" value={touristFormData.password} onChange={handleTouristFormChange} required />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input type="text" name="country" value={touristFormData.country} onChange={handleTouristFormChange} required />
              </div>
              <div className="form-group">
                <button type="submit" className="cta-button">Add Tourist</button>
                <button type="button" className="cta-button" onClick={() => setShowAddTouristForm(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
        <div className="admin-card">
          <h3>All Reviews ({reviews.length})</h3>
          <ul className="admin-list">
            {reviews.map(review => (
              <li key={review._id}>
                <span>
                  {review.reviewType === 'service' ? `Service: ${review.targetId?.serviceName || 'Unknown'}` : `Tourist: ${review.targetId?.fullName || 'Unknown'}`} - 
                  Rating: {review.rating} - 
                  Approved: {review.approved ? 'Yes' : 'No'} - 
                  By: {review.reviewerId?.fullName || review.reviewerId?.serviceName || 'Unknown'}
                </span>
                <p>{review.comment}</p>
                {!review.approved && <button className="admin-button cta-button approve" onClick={() => approveReview(review._id)}>Approve</button>}
                <button className="admin-button cta-button danger" onClick={() => deleteReview(review._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
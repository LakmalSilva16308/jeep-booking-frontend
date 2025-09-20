import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/App.css';
import '../styles/TouristDashboard.css';

function TouristDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) {
        setError('Please log in to view bookings');
        setLoading(false);
        return;
      }
      try {
        console.log('Fetching bookings with token:', token);
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const cleanApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
        const res = await axios.get(`${cleanApiUrl}/api/bookings/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Bookings response:', res.data);
        setBookings(res.data || []);
      } catch (err) {
        console.error('Error fetching bookings:', err.response?.data || err.message);
        setError('Failed to load bookings. Please log in again.');
      }
      setLoading(false);
    };
    fetchBookings();
  }, [token]);

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  return (
    <div className="tourist-dashboard container">
      <h2>My Bookings</h2>
      {bookings.length === 0 ? (
        <p className="no-bookings">No bookings found.</p>
      ) : (
        <div className="booking-grid">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-header">
                <h3>{booking.providerId?.serviceName || 'Unknown'}</h3>
                <span className={`status ${booking.status.toLowerCase()}`}>
                  {booking.status}
                </span>
              </div>
              <div className="booking-details">
                <p><strong>Category:</strong> {booking.providerId?.category?.replace('-', ' ') || 'Unknown'}</p>
                <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {booking.time}</p>
                <p><strong>Adults:</strong> {booking.adults}</p>
                <p><strong>Children:</strong> {booking.children}</p>
                <p><strong>Total Price:</strong> LKR {booking.totalPrice.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <Link to="/services" className="cta-button">Browse Services</Link>
    </div>
  );
}

export default TouristDashboard;
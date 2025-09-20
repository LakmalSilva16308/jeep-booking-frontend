import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/App.css';

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
        const decoded = JSON.parse(atob(token.split('.')[1]));
        console.log('Decoded token:', decoded);
        if (decoded.role !== 'tourist') {
          setError('Access denied: Only tourists can view bookings');
          setLoading(false);
          return;
        }
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/bookings/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Bookings response:', res.data);
        setBookings(res.data || []);
      } catch (err) {
        console.error('Error fetching bookings:', err.response?.data || err.message);
        setError(`Failed to load bookings: ${err.response?.data?.error || err.message}`);
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
        <p>No bookings found.</p>
      ) : (
        <ul className="booking-list">
          {bookings.map((booking) => (
            <li key={booking._id}>
              <p><strong>Service:</strong> {booking.providerId?.serviceName || 'Unknown'}</p>
              <p><strong>Category:</strong> {booking.providerId?.category?.replace('-', ' ') || 'Unknown'}</p>
              <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {booking.time}</p>
              <p><strong>Adults:</strong> {booking.adults}</p>
              <p><strong>Children:</strong> {booking.children}</p>
              <p><strong>Total Price:</strong> ${booking.totalPrice}</p>
              <p><strong>Status:</strong> {booking.status}</p>
            </li>
          ))}
        </ul>
      )}
      <Link to="/services" className="cta-button">Browse Services</Link>
    </div>
  );
}

export default TouristDashboard;
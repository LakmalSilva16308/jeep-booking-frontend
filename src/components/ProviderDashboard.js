import { useState, useEffect } from 'react';
import axios from 'axios';

function ProviderDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/bookings/provider-bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(res.data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        alert('Failed to load bookings. Please log in again.');
      }
      setLoading(false);
    };
    fetchBookings();
  }, [token]);

  if (loading) return <div className="container">Loading your bookings...</div>;

  return (
    <div className="dashboard container">
      <h2>Provider Dashboard</h2>
      <div className="dashboard-card">
        <h3>Your Upcoming Bookings</h3>
        {bookings.length === 0 ? (
          <p>No bookings yet. Wait for approvals!</p>
        ) : (
          <ul className="dashboard-list">
            {bookings.map(booking => (
              <li key={booking._id}>
                <div className="flex justify-between">
                  <span>{booking.touristId.fullName}</span>
                  <span>${booking.totalPrice}</span>
                </div>
                <p>Date: {new Date(booking.date).toLocaleDateString()}</p>
                <p>Status: <span className={`status-${booking.status}`}>{booking.status}</span></p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ProviderDashboard;
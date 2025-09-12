import { useParams } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

function Booking() {
  const { providerId } = useParams();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    adults: 1,
    children: 0,
    specialNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/bookings', { providerId, ...formData }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Booking confirmed!');
      setFormData({ date: '', time: '', adults: 1, children: 0, specialNotes: '' });
    } catch (err) {
      alert('Error booking: ' + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  return (
    <div className="form-container container">
      <h2>Book Your Adventure</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Date</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Time</label>
          <input type="time" name="time" value={formData.time} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Adults</label>
          <input type="number" name="adults" value={formData.adults} onChange={handleChange} min="1" />
        </div>
        <div className="form-group">
          <label>Children</label>
          <input type="number" name="children" value={formData.children} onChange={handleChange} min="0" />
        </div>
        <div className="form-group">
          <label>Special Notes</label>
          <textarea name="specialNotes" value={formData.specialNotes} onChange={handleChange}></textarea>
        </div>
        <div className="form-group">
          <button type="submit" disabled={loading}>{loading ? 'Booking...' : 'Book Now'}</button>
        </div>
      </form>
    </div>
  );
}

export default Booking;
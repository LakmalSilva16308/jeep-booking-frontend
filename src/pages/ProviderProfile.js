import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReviewSlider from '../components/ReviewSlider';
import { USD_TO_LKR_RATE } from '../data/products';
import '../styles/App.css';

function ProviderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    adults: 1,
    children: 0,
    specialNotes: '',
    contact: { name: '', email: '', message: '', phone: '' }
  });
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    targetId: ''
  });
  const [canReviewService, setCanReviewService] = useState(false);
  const [canReviewTourist, setCanReviewTourist] = useState(false);
  const [touristsServed, setTouristsServed] = useState([]);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const token = localStorage.getItem('token');

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const cleanApiUrl = apiUrl.replace(/\/+$/, '');

  useEffect(() => {
    const fetchProviderAndReviews = async () => {
      try {
        console.log('Fetching provider and reviews for ID:', id);
        const [providerRes, reviewsRes] = await Promise.all([
          axios.get(`${cleanApiUrl}/providers/${id}`),
          axios.get(`${cleanApiUrl}/reviews/${id}`).catch(err => {
            console.warn('Reviews fetch failed:', err.response?.data || err.message);
            return { data: [] };
          })
        ]);
        console.log('Provider:', providerRes.data);
        console.log('Reviews:', reviewsRes.data);
        setProvider(providerRes.data);
        setReviews(reviewsRes.data || []);
      } catch (err) {
        console.error('Error fetching provider/reviews:', err.response?.data || err.message);
        setError('Failed to load provider details');
      } finally {
        setLoading(false);
      }
    };

    const checkReviewEligibility = async () => {
      if (!token) {
        console.log('No token found, user not logged in');
        setCanReviewService(false);
        setCanReviewTourist(false);
        return;
      }
      try {
        if (!token.includes('.') || token.split('.').length !== 3) {
          throw new Error('Invalid token format');
        }
        const decoded = JSON.parse(atob(token.split('.')[1]));
        console.log('Decoded token:', decoded);

        if (decoded.role === 'tourist') {
          try {
            console.log('Fetching bookings for tourist:', decoded.id);
            const res = await axios.get(`${cleanApiUrl}/bookings/my-bookings`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log('My bookings:', res.data);
            const hasBooking = res.data.some(booking => {
              const isValid = booking.providerId?._id === id && booking.status === 'confirmed';
              console.log('Booking check:', { bookingId: booking._id, providerId: booking.providerId?._id, status: booking.status, isValid });
              return isValid;
            });
            console.log('Tourist can review service:', hasBooking);
            setCanReviewService(hasBooking);
            setCanReviewTourist(false);
          } catch (err) {
            console.error('Error fetching bookings:', err.response?.data || err.message);
            if (err.response?.status === 401) {
              localStorage.removeItem('token');
              setError('Session expired. Please log in again.');
              navigate('/login');
            } else {
              setError('Failed to check review eligibility');
            }
          }
        } else if (decoded.role === 'provider') {
          try {
            console.log('Fetching bookings for provider:', decoded.id);
            const res = await axios.get(`${cleanApiUrl}/bookings/provider-bookings`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Provider bookings:', res.data);
            const servedTourists = res.data
              .filter(booking => {
                const isValid = booking.status === 'confirmed' && booking.touristId?._id;
                console.log('Booking check:', { bookingId: booking._id, touristId: booking.touristId?._id, status: booking.status, isValid });
                return isValid;
              })
              .map(booking => ({
                id: booking.touristId._id,
                fullName: booking.touristId?.fullName || 'Unknown'
              }))
              .filter((tourist, index, self) => 
                tourist.id && self.findIndex(t => t.id === tourist.id) === index
              );
            console.log('Provider can review tourists:', servedTourists);
            setCanReviewTourist(servedTourists.length > 0);
            setTouristsServed(servedTourists);
            setCanReviewService(false);
          } catch (err) {
            console.error('Error fetching provider bookings:', err.response?.data || err.message);
            if (err.response?.status === 401) {
              localStorage.removeItem('token');
              setError('Session expired. Please log in again.');
              navigate('/login');
            } else {
              setError('Failed to check review eligibility');
            }
          }
        } else {
          console.log('User is neither tourist nor provider:', decoded.role);
          setCanReviewService(false);
          setCanReviewTourist(false);
        }
      } catch (err) {
        console.error('Error decoding token:', err.message);
        localStorage.removeItem('token');
        setError('Invalid session. Please log in again.');
        navigate('/login');
      }
    };

    fetchProviderAndReviews();
    checkReviewEligibility();
  }, [id, token, cleanApiUrl, navigate]);

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('contact.')) {
      const contactField = name.split('.')[1];
      setBookingForm(prev => ({
        ...prev,
        contact: { ...prev.contact, [contactField]: value }
      }));
    } else {
      setBookingForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setBookingError('Please log in to book a service');
      return;
    }
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      if (decoded.role !== 'tourist') {
        setBookingError('Only tourists can book services');
        return;
      }
      const { name, email, message, phone } = bookingForm.contact;
      if (!name || !email || !message || !phone) {
        setBookingError('All contact details (name, email, message, phone) are required');
        return;
      }
      console.log('Submitting booking for user:', decoded);
      const res = await axios.post(`${cleanApiUrl}/bookings`, {
        providerId: id,
        ...bookingForm
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Booking created:', res.data);
      setBookingSuccess(true);
      setBookingError(null);
      alert('Booking created successfully! Awaiting admin approval.');
      setBookingForm({ date: '', time: '', adults: 1, children: 0, specialNotes: '', contact: { name: '', email: '', message: '', phone: '' } });
      setTimeout(() => setBookingSuccess(false), 3000);
    } catch (err) {
      console.error('Error creating booking:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setBookingError('Session expired. Please log in again.');
        navigate('/login');
      } else {
        setBookingError(err.response?.data?.error || 'Failed to create booking');
      }
    }
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({ ...prev, [name]: value }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setReviewError('Please log in to submit a review');
      return;
    }
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const reviewData = {
        targetId: reviewForm.targetId || id,
        rating: parseInt(reviewForm.rating),
        comment: reviewForm.comment,
        reviewType: decoded.role === 'tourist' ? 'service' : 'tourist'
      };
      console.log('Submitting review:', reviewData);
      const res = await axios.post(`${cleanApiUrl}/reviews`, reviewData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Review submitted:', res.data);
      setReviewSuccess('Review submitted successfully');
      setReviewError(null);
      setReviewForm({ rating: 5, comment: '', targetId: '' });
      const reviewsRes = await axios.get(`${cleanApiUrl}/reviews/${id}`);
      setReviews(reviewsRes.data || []);
    } catch (err) {
      console.error('Error submitting review:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setReviewError('Session expired. Please log in again.');
        navigate('/login');
      } else {
        setReviewError(err.response?.data?.error || 'Failed to submit review');
      }
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container error">{error}</div>;
  if (!provider) return <div className="container">Provider not found</div>;

  return (
    <div className="provider-profile container">
      <section className="provider-details">
        <h2>{provider.serviceName}</h2>
        <img
          src={provider.profilePicture || '/images/placeholder.jpg'}
          alt={provider.serviceName}
          className="service-image"
          onError={(e) => {
            console.error(`Failed to load image: ${provider.profilePicture}`);
            e.target.src = '/images/placeholder.jpg';
          }}
        />
        <div className="provider-info">
          <p><strong>Category:</strong> {provider.category?.replace('-', ' ') || 'Unknown'}</p>
          <p><strong>Description:</strong> {provider.description || 'No description available'}</p>
          <p><strong>Price:</strong> USD {(provider.price / USD_TO_LKR_RATE).toFixed(2)} / LKR {provider.price.toFixed(2)}</p>
          <p><strong>Location:</strong> {provider.location || 'Not specified'}</p>
        </div>
      </section>

      <section className="booking-form">
        <h3>Book This Service</h3>
        {!bookingSuccess ? (
          <div className="form-container">
            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label htmlFor="contact.name">Name</label>
                <input
                  type="text"
                  id="contact.name"
                  name="contact.name"
                  value={bookingForm.contact.name}
                  onChange={handleBookingChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact.email">Email</label>
                <input
                  type="email"
                  id="contact.email"
                  name="contact.email"
                  value={bookingForm.contact.email}
                  onChange={handleBookingChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact.phone">Phone</label>
                <input
                  type="tel"
                  id="contact.phone"
                  name="contact.phone"
                  value={bookingForm.contact.phone}
                  onChange={handleBookingChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact.message">Message</label>
                <textarea
                  id="contact.message"
                  name="contact.message"
                  value={bookingForm.contact.message}
                  onChange={handleBookingChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={bookingForm.date}
                  onChange={handleBookingChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="time">Time</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={bookingForm.time}
                  onChange={handleBookingChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="adults">Adults</label>
                <input
                  type="number"
                  id="adults"
                  name="adults"
                  value={bookingForm.adults}
                  onChange={handleBookingChange}
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
                  value={bookingForm.children}
                  onChange={handleBookingChange}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="specialNotes">Special Notes</label>
                <textarea
                  id="specialNotes"
                  name="specialNotes"
                  value={bookingForm.specialNotes}
                  onChange={handleBookingChange}
                />
              </div>
              <button type="submit" className="cta-button">Book Now</button>
            </form>
            {bookingError && <p className="error">{bookingError}</p>}
          </div>
        ) : (
          <div className="success-section">
            <h4>Booking Created Successfully!</h4>
            <p>Awaiting admin approval. You will be notified once approved.</p>
            <button className="cta-button" onClick={() => setBookingSuccess(false)}>Book Another</button>
          </div>
        )}
      </section>

      <section className="review-form">
        {canReviewService || canReviewTourist ? (
          <div className="form-container">
            <h3>{canReviewService ? 'Review This Service' : 'Review a Tourist'}</h3>
            <form onSubmit={handleReviewSubmit}>
              {canReviewTourist && (
                <div className="form-group">
                  <label htmlFor="targetId">Select Tourist</label>
                  <select
                    id="targetId"
                    name="targetId"
                    value={reviewForm.targetId}
                    onChange={handleReviewChange}
                    required
                  >
                    <option value="">Select a tourist</option>
                    {touristsServed.map(tourist => (
                      <option key={tourist.id} value={tourist.id}>{tourist.fullName}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label htmlFor="rating">Rating (1-5)</label>
                <select
                  id="rating"
                  name="rating"
                  value={reviewForm.rating}
                  onChange={handleReviewChange}
                  required
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="comment">Comment</label>
                <textarea
                  id="comment"
                  name="comment"
                  value={reviewForm.comment}
                  onChange={handleReviewChange}
                  required
                />
              </div>
              <button type="submit" className="cta-button">Submit Review</button>
            </form>
            {reviewError && <p className="error">{reviewError}</p>}
            {reviewSuccess && <p className="success">{reviewSuccess}</p>}
          </div>
        ) : (
          <p className="info">You need a confirmed booking to submit a review.</p>
        )}
      </section>

      <section className="reviews-section">
        <h3>Service Reviews</h3>
        <ReviewSlider reviews={reviews} />
      </section>
    </div>
  );
}

export default ProviderProfile;
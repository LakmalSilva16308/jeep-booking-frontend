import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PaymentForm from '../components/PaymentForm';
import ReviewSlider from '../components/ReviewSlider'; // New import
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
    specialNotes: ''
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
  const [bookingId, setBookingId] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProviderAndReviews = async () => {
      try {
        console.log('Fetching provider and reviews for ID:', id);
        const [providerRes, reviewsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/providers/${id}`),
          axios.get(`http://localhost:5000/api/reviews/${id}`).catch(err => {
            console.warn('Reviews fetch failed, returning empty array:', err.response?.data || err.message);
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
        const decoded = JSON.parse(atob(token.split('.')[1]));
        console.log('Decoded token:', decoded);

        if (decoded.role === 'tourist') {
          try {
            console.log('Fetching bookings for tourist:', decoded.id);
            const res = await axios.get('http://localhost:5000/api/bookings/my-bookings', {
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log('My bookings:', res.data);
            const hasBooking = res.data.some(booking => {
              const isValid = booking.providerId?._id === id && booking.status === 'confirmed';
              console.log('Booking check:', { bookingId: booking._id, providerId: booking.providerId?._id, status: booking.status, isValid });
              return isValid;
            });
            console.log('Tourist can review service:', hasBooking, 'Provider ID:', id);
            setCanReviewService(hasBooking);
            setCanReviewTourist(false);
          } catch (err) {
            console.error('Error fetching bookings for review eligibility:', err.response?.data || err.message);
            setCanReviewService(false);
            setError(err.response?.status === 403 ? 'Access denied: Please log in as a tourist' : 'Failed to check review eligibility');
          }
        } else if (decoded.role === 'provider') {
          try {
            console.log('Fetching bookings for provider:', decoded.id);
            const res = await axios.get('http://localhost:5000/api/bookings/provider-bookings', {
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
            setCanReviewTourist(false);
            setError(err.response?.status === 403 ? 'Access denied: Please log in as a provider' : 'Failed to check review eligibility');
          }
        } else {
          console.log('User is neither tourist nor provider:', decoded.role);
          setCanReviewService(false);
          setCanReviewTourist(false);
        }
      } catch (err) {
        console.error('Error decoding token or checking review eligibility:', err.message);
        setCanReviewService(false);
        setCanReviewTourist(false);
        setError('Invalid token or failed to check review eligibility');
      }
    };

    fetchProviderAndReviews();
    checkReviewEligibility();
  }, [id, token]);

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please log in to book a service');
      return;
    }
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      console.log('Submitting booking for user:', decoded);
      const res = await axios.post('http://localhost:5000/api/bookings', {
        providerId: id,
        ...bookingForm
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Booking created:', res.data);
      setBookingId(res.data.booking._id);
      setBookingSuccess(true);
      setError(null);
      alert('Booking created successfully! Proceed to payment.');
    } catch (err) {
      console.error('Error creating booking:', err.response?.data || err.message);
      setError(err.response?.status === 403 ? 'Access denied: Please log in as a tourist' : err.response?.data?.error || 'Failed to create booking');
    }
  };

  const handlePaymentSuccess = () => {
    setBookingSuccess(false);
    alert('Payment successful! Your booking is confirmed.');
    navigate('/tourist-dashboard');
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
      const res = await axios.post('http://localhost:5000/api/reviews', reviewData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Review submitted:', res.data);
      setReviewSuccess('Review submitted successfully');
      setReviewError(null);
      setReviewForm({ rating: 5, comment: '', targetId: '' });
      const reviewsRes = await axios.get(`http://localhost:5000/api/reviews/${id}`);
      setReviews(reviewsRes.data || []);
    } catch (err) {
      console.error('Error submitting review:', err.response?.data || err.message);
      setReviewError(err.response?.status === 403 ? 'Access denied: Please log in with appropriate role' : err.response?.data?.error || 'Failed to submit review');
      setReviewSuccess(null);
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;
  if (!provider) return <div className="container">Provider not found</div>;

  return (
    <div className="provider-profile container">
      <section className="provider-details">
        <h2>{provider.serviceName}</h2>
        <img
          src={provider.profilePicture ? `http://localhost:5000${provider.profilePicture}` : '/images/placeholder.jpg'}
          alt={provider.serviceName}
          className="service-image"
          onError={(e) => {
            console.error(`Failed to load image: http://localhost:5000${provider.profilePicture}`);
            e.target.src = '/images/placeholder.jpg';
          }}
        />
        <div className="provider-info">
          <p><strong>Category:</strong> {provider.category?.replace('-', ' ') || 'Unknown'}</p>
          <p><strong>Description:</strong> {provider.description || 'No description available'}</p>
          <p><strong>Price:</strong> ${provider.price}</p>
          <p><strong>Location:</strong> {provider.location || 'Not specified'}</p>
        </div>
      </section>

      <section className="booking-form">
        <h3>Book This Service</h3>
        {bookingSuccess ? (
          <div className="payment-section">
            <h4>Proceed to Payment</h4>
            <PaymentForm 
              bookingId={bookingId} 
              totalPrice={provider.price * (bookingForm.adults + bookingForm.children * 0.5)} 
              onSuccess={handlePaymentSuccess} 
            />
          </div>
        ) : (
          <div className="form-container">
            <form onSubmit={handleBookingSubmit}>
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
              <button type="submit" className="cta-button">Proceed to Payment</button>
            </form>
            {error && <p className="error">{error}</p>}
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
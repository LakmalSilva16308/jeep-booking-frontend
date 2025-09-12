import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ReviewGridSlider from '../components/ReviewGridSlider';
import '../styles/App.css';

function Home() {
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentServiceSlide, setCurrentServiceSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    targetId: '',
    rating: 5,
    comment: ''
  });
  const [confirmedProviders, setConfirmedProviders] = useState([]);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(null);
  const token = localStorage.getItem('token');
  const [userRole, setUserRole] = useState(null);

  const slides = useMemo(() => [
    {
      src: '/images/img1.jpg',
      alt: 'Jeep Safari Adventure',
      title: 'Discover Amazing Adventures',
      caption: 'Explore Jeep Safaris, Boat Rides, and More!'
    },
    {
      src: '/images/img4.jpg',
      alt: 'Coastal Adventure',
      title: 'Thrilling Coastal Journeys',
      caption: 'Book Your Next Adventure Today!'
    },
    {
      src: '/images/img5.jpg',
      alt: 'Mountain Expedition',
      title: 'Conquer the Mountains',
      caption: 'Experience the Ultimate Adventure!'
    },
    {
      src: '/images/img2.jpg',
      alt: 'Desert Safari',
      title: 'Venture into the Desert',
      caption: 'Unforgettable Safari Experiences Await!'
    }
  ], []); // Empty dependency array since slides is static

  const providersPerPage = 8; // 2 rows x 4 columns
  const totalServiceSlides = Math.ceil(featuredProviders.length / providersPerPage);

  useEffect(() => {
    console.log('Slider initialized. Slides:', slides);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % slides.length;
        console.log(`Auto-sliding hero from ${prev} to ${next}`);
        return next;
      });
    }, 5000);
    return () => {
      console.log('Clearing hero slider interval');
      clearInterval(interval);
    };
  }, [slides]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching featured providers and reviews...');
        const [providersRes, reviewsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/providers', { params: { approved: true, limit: 8 } }),
          axios.get('http://localhost:5000/api/reviews/all').catch(err => {
            console.warn('Reviews fetch failed, returning empty array:', err.response?.data || err.message);
            return { data: [] };
          })
        ]);
        console.log('Featured providers:', providersRes.data);
        console.log('Reviews:', reviewsRes.data);
        setFeaturedProviders(providersRes.data || []);
        setReviews(reviewsRes.data || []);
      } catch (err) {
        console.error('Error fetching data:', err.response?.data || err.message);
        setError(err.message.includes('Network Error') 
          ? 'Cannot connect to the server. Please ensure the server is running.'
          : 'Failed to load providers or reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserRoleAndBookings = async () => {
      if (!token) {
        console.log('No token found, user not logged in');
        setUserRole(null);
        setConfirmedProviders([]);
        return;
      }
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        console.log('Decoded token:', decoded);
        setUserRole(decoded.role);
        if (decoded.role === 'tourist') {
          try {
            console.log('Fetching bookings for tourist:', decoded.id);
            const res = await axios.get('http://localhost:5000/api/bookings/my-bookings', {
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Raw bookings response:', res.data);
            const providers = res.data
              .filter(booking => {
                const isValid = booking.status === 'confirmed' && booking.providerId && booking.providerId._id && booking.providerId.serviceName;
                console.log('Booking filter:', { 
                  bookingId: booking._id, 
                  status: booking.status, 
                  providerId: booking.providerId?._id, 
                  serviceName: booking.providerId?.serviceName, 
                  isValid 
                });
                return isValid;
              })
              .map(booking => ({
                id: booking.providerId._id,
                serviceName: booking.providerId.serviceName
              }))
              .filter((provider, index, self) => 
                provider.id && self.findIndex(p => p.id === provider.id) === index
              );
            console.log('Confirmed providers:', providers);
            setConfirmedProviders(providers);
          } catch (err) {
            console.error('Error fetching bookings:', err.response?.data || err.message);
            setConfirmedProviders([]);
          }
        } else {
          console.log('User is not a tourist:', decoded.role);
        }
      } catch (err) {
        console.error('Error decoding token:', err.message);
        setUserRole(null);
        setConfirmedProviders([]);
      }
    };

    fetchData();
    fetchUserRoleAndBookings();
  }, [token]);

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const next = prev === 0 ? slides.length - 1 : prev - 1;
      console.log(`Manual hero slide: prev ${prev} to ${next}`);
      return next;
    });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const next = (prev + 1) % slides.length;
      console.log(`Manual hero slide: next ${prev} to ${next}`);
      return next;
    });
  };

  const prevServiceSlide = () => {
    setCurrentServiceSlide((prev) => {
      const next = prev === 0 ? totalServiceSlides - 1 : prev - 1;
      console.log(`Manual service slide: prev ${prev} to ${next}`);
      return next;
    });
  };

  const nextServiceSlide = () => {
    setCurrentServiceSlide((prev) => {
      const next = (prev + 1) % totalServiceSlides;
      console.log(`Manual service slide: next ${prev} to ${next}`);
      return next;
    });
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    console.log(`Manual hero slide: go to ${index}`);
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({ ...prev, [name]: value }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setReviewError('Please log in to submit a review');
      console.log('Review submission failed: No token');
      return;
    }
    if (!reviewForm.targetId) {
      setReviewError('Please select a service to review');
      console.log('Review submission failed: No targetId selected');
      return;
    }
    const cleanedTargetId = reviewForm.targetId.trim();
    if (!isValidObjectId(cleanedTargetId)) {
      setReviewError('Invalid service selected');
      console.log('Review submission failed: Invalid targetId format:', cleanedTargetId);
      return;
    }
    try {
      const reviewData = {
        targetId: cleanedTargetId,
        rating: parseInt(reviewForm.rating),
        comment: reviewForm.comment,
        reviewType: 'service'
      };
      console.log('Submitting review:', reviewData);
      const res = await axios.post('http://localhost:5000/api/reviews', reviewData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Review submitted:', res.data);
      setReviewSuccess('Review submitted successfully');
      setReviewError(null);
      setReviewForm({ targetId: '', rating: 5, comment: '' });
      try {
        const reviewsRes = await axios.get('http://localhost:5000/api/reviews/all');
        console.log('Refreshed reviews:', reviewsRes.data);
        setReviews(reviewsRes.data || []);
      } catch (refreshErr) {
        console.error('Error refreshing reviews:', refreshErr.response?.data || refreshErr.message);
        setReviews([]);
      }
    } catch (err) {
      console.error('Error submitting review:', err.response?.data || err.message);
      setReviewError(err.response?.data?.error || 'Failed to submit review. Please try again.');
      setReviewSuccess(null);
    }
  };

  const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  const visibleProviders = featuredProviders.slice(
    currentServiceSlide * providersPerPage,
    (currentServiceSlide + 1) * providersPerPage
  );

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-slider">
          <div className="slider">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`slide ${index === currentSlide ? 'active' : ''}`}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="slide-image"
                  onLoad={() => console.log(`Image loaded: ${slide.src}`)}
                  onError={(e) => {
                    console.error(`Failed to load image: ${slide.src}`);
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
                <div className="hero-content">
                  <h1>{slide.title}</h1>
                  <p>{slide.caption}</p>
                  <Link to="/services" className="cta-button" data-discover="true">
                    Book Your Adventure
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <button className="slider-arrow left-arrow" onClick={prevSlide} aria-label="Previous slide">
            &#10094;
          </button>
          <button className="slider-arrow right-arrow" onClick={nextSlide} aria-label="Next slide">
            &#10095;
          </button>
          <div className="slider-dots">
            {slides.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              ></span>
            ))}
          </div>
        </div>
      </section>

      <section className="services-preview container">
        <h2>Featured Services</h2>
        <div className="services-container">
          <div className="services-grid">
            {visibleProviders.map((provider) => (
              <div key={provider._id} className="service-card">
                <img
                  src={provider.profilePicture ? `http://localhost:5000${provider.profilePicture}` : '/images/placeholder.jpg'}
                  alt={provider.serviceName}
                  className="service-image"
                  onError={(e) => {
                    console.error(`Failed to load image: http://localhost:5000${provider.profilePicture}`);
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
                <h3>{provider.serviceName}</h3>
                <p>{provider.category ? provider.category.replace('-', ' ') : 'Unknown'}</p>
                <p>{provider.description ? provider.description.substring(0, 100) + '...' : 'No description available.'}</p>
                <p className="price">${provider.price}</p>
                <Link to={`/provider/${provider._id}`} className="service-button">View Details</Link>
              </div>
            ))}
          </div>
          {totalServiceSlides > 1 && (
            <>
              <button className="services-arrow services-arrow-left" onClick={prevServiceSlide} aria-label="Previous services">
                &#10094;
              </button>
              <button className="services-arrow services-arrow-right" onClick={nextServiceSlide} aria-label="Next services">
                &#10095;
              </button>
            </>
          )}
        </div>
      </section>

      {userRole === 'tourist' && (
        <section className="submit-review container">
          <h2>Submit a Review</h2>
          {confirmedProviders.length > 0 ? (
            <div className="form-container">
              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label htmlFor="targetId">Select Service</label>
                  <select
                    id="targetId"
                    name="targetId"
                    value={reviewForm.targetId}
                    onChange={handleReviewChange}
                    required
                  >
                    <option value="">Select a service</option>
                    {confirmedProviders.map(provider => (
                      <option key={provider.id} value={provider.id}>{provider.serviceName}</option>
                    ))}
                  </select>
                </div>
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
      )}

      <section className="reviews-section container">
        <h2>Customer Reviews</h2>
        <ReviewGridSlider reviews={reviews.filter(review => review.reviewType === 'service')} />
      </section>
    </div>
  );
}

export default Home;
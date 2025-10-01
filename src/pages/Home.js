import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReviewGridSlider from '../components/ReviewGridSlider';
import CompanyProducts from '../components/CompanyProducts';
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();
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
  const [userRole, setUserRole] = useState(null);
  const token = localStorage.getItem('token');

  const apiUrl = process.env.REACT_APP_API_URL;

  const slides = useMemo(() => [
    {
      src: '/images/jeep_safari.jpg',
      alt: 'Jeep Safari Adventure',
      title: 'Discover Amazing Adventures',
      caption: 'Explore Jeep Safaris, Boat Rides, and More!'
    },
    {
      src: '/images/catamaran_boat_ride.jpg',
      alt: 'Catamaran Boat Ride',
      title: 'Catamaran Birds Watching Tour',
      caption: 'Enjoy a peaceful boat ride on Hiriwadunna Lake!'
    },
    {
      src: '/images/tuk_tuk.jpg',
      alt: 'Tuk Tuk Adventure',
      title: 'Ride Through the Village',
      caption: 'Experience local life with a fun tuk-tuk tour!'
    },
    {
      src: 'images/village_cooking.jpg',
      alt: 'Village Cooking Experience',
      title: 'Cook Like a Local',
      caption: 'Learn authentic Sri Lankan recipes!'
    }
  ], []);

  useEffect(() => {
    console.log('Slider initialized. Slides:', slides);
    slides.forEach(slide => {
      const img = new Image();
      img.src = slide.src;
      img.onerror = () => console.error(`Failed to preload image: ${slide.src}`);
    });

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
          axios.get(`${apiUrl}/providers?approved=true&limit=8`),
          axios.get(`${apiUrl}/reviews/all`).catch(err => {
            console.warn('Reviews fetch failed:', err.response?.data || err.message);
            return { data: [] };
          })
        ]);
        console.log('Featured providers:', providersRes.data);
        console.log('Reviews:', reviewsRes.data);
        setFeaturedProviders(providersRes.data || []);
        setReviews(reviewsRes.data || []);
      } catch (err) {
        console.error('Error fetching data:', err.response?.data || err.message);
        setError('Failed to load providers or reviews. Please try again later.');
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
        if (!token.includes('.') || token.split('.').length !== 3) {
          throw new Error('Invalid token format');
        }
        const decoded = JSON.parse(atob(token.split('.')[1]));
        console.log('Decoded token:', decoded);
        setUserRole(decoded.role);
        if (decoded.role === 'tourist') {
          try {
            console.log('Fetching bookings for tourist:', decoded.id);
            const res = await axios.get(`${apiUrl}/bookings/my-bookings`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Raw bookings response:', res.data);
            const providers = res.data
              .filter(booking => {
                const isValid = booking.status === 'confirmed' &&
                               (booking.providerId?._id || booking.productType);
                console.log('Booking filter:', {
                  bookingId: booking._id,
                  status: booking.status,
                  providerId: booking.providerId?._id,
                  productType: booking.productType,
                  isValid
                });
                return isValid;
              })
              .map(booking => ({
                id: booking.providerId?._id || booking.productType,
                serviceName: booking.providerId?.serviceName || booking.productType,
                type: booking.providerId ? 'service' : 'product'
              }))
              .filter((provider, index, self) =>
                provider.id && self.findIndex(p => p.id === provider.id) === index
              );
            console.log('Confirmed providers/products:', providers);
            setConfirmedProviders(providers);
          } catch (err) {
            console.error('Error fetching bookings:', err.response?.data || err.message);
            if (err.response?.status === 401) {
              localStorage.removeItem('token');
              setError('Session expired. Please log in again.');
              navigate('/login');
            } else {
              setError('Failed to fetch bookings.');
            }
          }
        } else {
          console.log('User is not a tourist:', decoded.role);
        }
      } catch (err) {
        console.error('Error decoding token:', err.message);
        localStorage.removeItem('token');
        setError('Invalid session. Please log in again.');
        navigate('/login');
      }
    };

    Promise.all([fetchData(), fetchUserRoleAndBookings()]).finally(() => setLoading(false));
  }, [token, navigate, apiUrl]);

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

  const goToSlide = (index) => {
    setCurrentSlide(index);
    console.log(`Manual hero slide: go to ${index}`);
  };

  const prevServiceSlide = () => {
    setCurrentServiceSlide((prev) => {
      const next = prev === 0 ? 0 : prev - 1;
      console.log(`Manual service slide: prev ${prev} to ${next}`);
      return next;
    });
  };

  const nextServiceSlide = () => {
    setCurrentServiceSlide((prev) => {
      const maxSlides = Math.ceil(featuredProviders.length / 4);
      const next = prev === maxSlides - 1 ? prev : prev + 1;
      console.log(`Manual service slide: next ${prev} to ${next}`);
      return next;
    });
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({ ...prev, [name]: value }));
  };

  const handleReviewSubmit = async () => {
    if (!token) {
      setReviewError('Please log in to submit a review');
      return;
    }
    if (!reviewForm.targetId) {
      setReviewError('Please select a service or product to review');
      return;
    }
    try {
      const selectedProvider = confirmedProviders.find(p => p.id === reviewForm.targetId);
      const reviewData = {
        targetId: reviewForm.targetId,
        rating: parseInt(reviewForm.rating),
        comment: reviewForm.comment,
        reviewType: selectedProvider?.type || (/^[0-9a-fA-F]{24}$/.test(reviewForm.targetId) ? 'service' : 'product')
      };
      console.log('Submitting review:', reviewData);
      const res = await axios.post(`${apiUrl}/reviews`, reviewData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Review submitted:', res.data);
      setReviewSuccess('Review submitted successfully');
      setReviewError(null);
      setReviewForm({ targetId: '', rating: 5, comment: '' });
      const reviewsRes = await axios.get(`${apiUrl}/reviews/all`);
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

      <section className="gallery-section container">
      <h2>Our Gallery</h2>
      <video
        src="/video/video_1_optimized.mp4"
        type="video/mp4"
        autoPlay
        loop
        muted
        playsInline
        className="gallery-video"
        onError={(e) => {
          console.error('Video failed to load:', {
            message: e.target.error?.message || 'Unknown error',
            code: e.target.error?.code || 'Unknown code',
            src: e.target.currentSrc
          });
        }}
      >
        <img src="/images/placeholder.jpg" alt="Gallery fallback" className="gallery-video" />
      </video>
    </section>

      <CompanyProducts />

      <section className="services-preview container">
        <h2>Featured Services</h2>
        <div className="services-container">
          <div className="services-slider" style={{ transform: `translateX(-${currentServiceSlide * 100}%)` }}>
            {featuredProviders.map((provider) => (
              <div key={provider._id} className="service-card">
                <img
                  src={provider.profilePicture || '/images/placeholder.jpg'}
                  alt={provider.serviceName}
                  className="service-image"
                  onError={(e) => {
                    console.error(`Failed to load image: ${provider.profilePicture}`);
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
                <h3>{provider.serviceName}</h3>
                <p>{provider.category ? provider.category.replace('-', ' ') : 'Unknown'}</p>
                <p>{provider.description ? provider.description.substring(0, 100) + '...' : 'No description available.'}</p>
                <p className="price">USD {provider.price.toFixed(2)}</p>
                <Link to={`/provider/${provider._id}`} className="service-button">View Details</Link>
              </div>
            ))}
          </div>
          {featuredProviders.length > 0 && (
            <>
              <button
                className="services-arrow services-arrow-left"
                onClick={prevServiceSlide}
                disabled={currentServiceSlide === 0}
                aria-label="Previous services"
              >
                &#10094;
              </button>
              <button
                className="services-arrow services-arrow-right"
                onClick={nextServiceSlide}
                disabled={currentServiceSlide === Math.ceil(featuredProviders.length / 4) - 1}
                aria-label="Next services"
              >
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
              <div className="form-group">
                <label htmlFor="targetId">Select Service or Product</label>
                <select
                  id="targetId"
                  name="targetId"
                  value={reviewForm.targetId}
                  onChange={handleReviewChange}
                  required
                >
                  <option value="">Select a service or product</option>
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
              <button className="cta-button" onClick={handleReviewSubmit}>Submit Review</button>
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
        <ReviewGridSlider reviews={reviews.filter(review => review.reviewType === 'service' || review.reviewType === 'product')} />
      </section>
    </div>
  );
}

export default Home;
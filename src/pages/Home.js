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
      alt: 'Yala Jeep Safari Adventure - Sri Lanka Tourism',
      title: 'Discover Yala Jeep Safaris',
      caption: 'Explore thrilling jeep safaris in Yala National Park with SLECO Tour.'
    },
    {
      src: '/images/catamaran_boat_ride.jpg',
      alt: 'Catamaran Boat Ride Hiriwadunna - Eco Tourism Sri Lanka',
      title: 'Hiriwadunna Lake Boat Ride',
      caption: 'Enjoy a serene catamaran boat ride on Hiriwadunna Lake.'
    },
    {
      src: '/images/tuk_tuk.jpg',
      alt: 'Tuk Tuk Village Tour - Sri Lanka Tourism',
      title: 'Tuk Tuk Village Adventures',
      caption: 'Experience Sri Lankan village life with a fun tuk-tuk tour.'
    },
    {
      src: '/images/village_cooking.jpg',
      alt: 'Sri Lankan Village Cooking Class - Eco Tourism',
      title: 'Authentic Village Cooking',
      caption: 'Learn traditional Sri Lankan recipes in a village setting.'
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
        console.log('Fetching featured providers and reviews from:', `${apiUrl}/providers?approved=true&limit=8`);
        const [providersRes, reviewsRes] = await Promise.all([
          axios.get(`${apiUrl}/providers?approved=true&limit=8`).catch(err => {
            console.error('Providers fetch failed:', err.response?.data || err.message);
            return { data: [] };
          }),
          axios.get(`${apiUrl}/reviews/all`).catch(err => {
            console.warn('Reviews fetch failed:', err.response?.data || err.message);
            return { data: [] };
          })
        ]);

        const providersData = Array.isArray(providersRes.data) ? providersRes.data : [];
        const reviewsData = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];

        console.log('Featured providers:', providersData);
        console.log('Reviews:', reviewsData);
        setFeaturedProviders(providersData);
        setReviews(reviewsData);
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
      setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
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
    <>
      <title>SLECO Tour - Best Sri Lanka Tourism Adventures 2025</title>
      <meta name="description" content="Explore Sri Lanka tourism with SLECO Tour: Yala jeep safaris, Hiriwadunna village tours, and Sigiriya Lion Rock climbs for 2025." />
      <meta name="keywords" content="sri lanka tourism, yala jeep safari, hiriwadunna village tour, sigiriya lion rock, eco tourism sri lanka, catamaran boat ride" />
      <meta property="og:title" content="SLECO Tour - Sri Lanka Tourism Adventures 2025" />
      <meta property="og:description" content="Book Yala jeep safaris, Hiriwadunna village tours, and Sigiriya Lion Rock climbs with SLECO Tour." />
      <meta property="og:image" content="https://www.slecotour.com/images/jeep_safari.jpg" />
      <meta property="og:url" content="https://www.slecotour.com/" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="SLECO Tour - Sri Lanka Tourism Adventures" />
      <meta name="twitter:description" content="Book Yala jeep safaris, Hiriwadunna village tours, and Sigiriya Lion Rock climbs for 2025." />
      <meta name="twitter:image" content="https://www.slecotour.com/images/jeep_safari.jpg" />
      <link rel="canonical" href="https://www.slecotour.com/" />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "SLECO Tour",
          "url": "https://www.slecotour.com/",
          "description": "Book eco-friendly Sri Lanka tourism adventures including Yala jeep safaris and Hiriwadunna village tours."
        })}
      </script>

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
                    loading="lazy"
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
          <p>Discover <Link to="/product-description/Hiriwadunna%20Village%20Tour%20and%20Jeep%20Safari%20One%20Day%20Tour">Hiriwadunna village tours</Link> and <Link to="/product-description/Jeep%20Safari">Yala jeep safaris</Link> in our gallery.</p>
          <video
            src="/video/video1.mov"
            autoPlay
            loop
            muted
            controls
            playsInline
            className="gallery-video"
            onError={(e) => console.error('Video failed to load:', e.target.error)}
          />
        </section>

        <CompanyProducts />

        <section className="services-preview container">
          <h2>Featured Sri Lanka Tourism Services</h2>
          <p>Explore our top eco-friendly adventures, including <Link to="/product-description/Sigiriya%20Lion%20Rock">Sigiriya Lion Rock climbs</Link> and <Link to="/product-description/Catamaran%20Boat%20Ride">catamaran boat rides</Link>.</p>
          <div className="services-container">
            <div className="services-slider" style={{ transform: `translateX(-${currentServiceSlide * 100}%)` }}>
              {featuredProviders.length > 0 ? (
                featuredProviders.map((provider) => (
                  <div key={provider._id} className="service-card">
                    <img
                      src={provider.profilePicture || '/images/placeholder.jpg'}
                      alt={`${provider.serviceName} - Sri Lanka Tourism`}
                      className="service-image"
                      loading="lazy"
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
                ))
              ) : (
                <p>No featured providers available.</p>
              )}
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
            <h2>Submit a Review for Your Adventure</h2>
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
          <h2>Customer Reviews for Sri Lanka Tours</h2>
          <ReviewGridSlider reviews={Array.isArray(reviews) ? reviews.filter(review => review.reviewType === 'service' || review.reviewType === 'product') : []} />
        </section>
      </div>
    </>
  );
}

export default Home;
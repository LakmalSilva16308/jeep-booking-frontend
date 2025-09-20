import { useState, useEffect } from 'react';
import axios from 'axios';
import ServiceCard from '../components/ServiceCard';
import CompanyProducts from '../components/CompanyProducts';
import '../styles/Services.css';

function Services() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const cardsPerView = 4;

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/api/providers`, {
          params: { approved: true }
        });
        setProviders(response.data || []);
      } catch (err) {
        console.error('Error fetching providers:', err);
        setProviders([]);
      }
      setLoading(false);
    };
    fetchProviders();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(0, prev - cardsPerView));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(providers.length - cardsPerView, prev + cardsPerView));
  };

  const visibleProviders = isMobile ? providers : providers.slice(
    currentIndex,
    currentIndex + cardsPerView
  );

  console.log('Rendering services:', isMobile ? `All ${providers.length} providers` : `${visibleProviders.length} of ${providers.length}`);

  if (loading) return <div className="services-preview">Loading services...</div>;

  return (
    <div className="services-preview">
      <h2>Our Services</h2>
      <CompanyProducts />
      <h2>Featured Services</h2>
      {providers.length > 0 ? (
        <div className="services-container">
          <div
            className="services-grid"
            style={isMobile ? {} : { transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)` }}
          >
            {visibleProviders.map((provider) => (
              <ServiceCard key={provider._id} provider={provider} />
            ))}
          </div>
          {!isMobile && providers.length > cardsPerView && (
            <>
              <button className="services-arrow services-arrow-left" onClick={prevSlide} aria-label="Previous services">
                &#10094;
              </button>
              <button className="services-arrow services-arrow-right" onClick={nextSlide} aria-label="Next services">
                &#10095;
              </button>
            </>
          )}
        </div>
      ) : (
        <p>No services available yet.</p>
      )}
      
    </div>
  );
}

export default Services;
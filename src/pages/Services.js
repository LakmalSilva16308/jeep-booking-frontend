import { useState, useEffect } from 'react';
import axios from 'axios';
import ServiceCard from '../components/ServiceCard';
import '../styles/App.css';

function Services() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/providers', {
          params: { approved: true }
        });
        setProviders(res.data || []);
      } catch (err) {
        console.error('Error fetching providers:', err);
        setProviders([]);
      }
      setLoading(false);
    };
    fetchProviders();
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 4));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(providers.length - 8, prev + 4));
  };

  if (loading) return <div className="container">Loading services...</div>;

  return (
    <div className="container services-preview">
      <h2>Our Services</h2>
      {providers.length > 0 ? (
        <div className="services-container">
          <div
            className="services-grid"
            style={{ transform: `translateX(-${currentIndex * (100 / 4) }%)` }}
          >
            {providers.map((provider) => (
              <ServiceCard key={provider._id} provider={provider} />
            ))}
          </div>
          {providers.length > 8 && (
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
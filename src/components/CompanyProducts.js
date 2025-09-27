import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CompanyProducts.css';

const COMPANY_PRODUCTS = [
  { 
    name: 'Jeep Safari', 
    price: 38,
    description: 'Explore the wilderness with an exciting jeep safari adventure.', 
    image: '/images/jeep_safari.jpg' 
  },
  { 
    name: 'Tuk Tuk Adventures', 
    price: null,
    description: 'Experience the local culture with a thrilling tuk-tuk ride.', 
    image: '/images/tuk_tuk.jpg' 
  },
  { 
    name: 'Catamaran Boat Ride', 
    price: 9.8,
    description: 'Sail on a traditional catamaran for a serene experience.', 
    image: '/images/catamaran_boat_ride.jpg' 
  },
  { 
    name: 'Village Cooking Experience', 
    price: 15,
    description: 'Learn to cook authentic local dishes with villagers.', 
    image: '/images/village_cooking.jpg' 
  },
  { 
    name: 'Traditional Village Lunch', 
    price: 15,
    description: 'Enjoy a delicious traditional meal in a village setting.', 
    image: '/images/village_lunch.jpg' 
  },
  { 
    name: 'Sundowners Cocktail', 
    price: null,
    description: 'Relax with a cocktail while watching the sunset.', 
    image: '/images/sundowners_cocktail.jpg' 
  },
  { 
    name: 'High Tea', 
    price: null,
    description: 'Indulge in a classic high tea experience.', 
    image: '/images/high_tea.jpg' 
  },
  { 
    name: 'Bullock Cart Ride', 
    price: 9.9,
    description: 'Travel back in time with a traditional bullock cart ride.', 
    image: '/images/bullockcart_ride.jpg' 
  },
  { 
    name: 'Village Tour', 
    price: 19.9,
    description: 'Immerse yourself in the rich culture and traditions of a local village.', 
    image: '/images/tour.jpg' 
  },
  {
    name: 'Bicycle Tour',
    price: null,
    description: 'Cycle through scenic countryside trails and local villages.',
    image: '/images/bicycle.jpeg'
  },
  {
    name: 'Sigiriya Lion Rock',
    price: null,
    description: 'Explore the ancient rock fortress with stunning views.',
    image: '/images/sigiriya.jpeg'
  },
  {
    name: 'Pidurangala Rock',
    price: null,
    description: 'Hike to a historic rock temple with panoramic vistas.',
    image: '/images/pidurangala.webp'
  },
  {
    name: 'Polonnaruwa City Tour',
    price: null,
    description: 'Discover the ruins of an ancient royal capital.',
    image: '/images/polonnaruwa.jpg'
  },
  {
    name: 'Motor Bikes Rent',
    price: 17,
    description: 'Ride through the region on a motorbike adventure.',
    image: '/images/motor.jpg'
  },
  {
    name: 'Village Walk Tour',
    price: 5,
    description: 'Stroll through a village to experience local life.',
    image: '/images/walk.jpg'
  },
  {
    name: 'Hiriwadunna Village Tour and Jeep Safari One Day Tour',
    price: 45,
    description: 'Embark on a full-day adventure combining a cultural village tour in Hiriwadunna with an exhilarating jeep safari through the wilderness.',
    image: '/images/walk.jpg'
  },
  {
    name: 'Village Tour and Jeep Safari Sigiriya Tour Dambulla Temple',
    price: 78,
    description: 'Experience a two-day journey exploring a traditional village, a thrilling jeep safari, the iconic Sigiriya Lion Rock, and the historic Dambulla Cave Temple.',
    image: '/images/motor.jpg'
  }
];

const CompanyProducts = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const cardsPerView = 4; // Match CSS flex: 0 0 25% (100% / 25% = 4 cards)
  const totalSlides = Math.ceil(COMPANY_PRODUCTS.length / cardsPerView); // 17 products / 4 = 5 slides

  const products = useMemo(() => COMPANY_PRODUCTS, []);
  const visibleProducts = useMemo(() => {
    if (isMobile) {
      return products; // Show all products on mobile
    }
    const start = currentIndex * cardsPerView;
    const end = start + cardsPerView;
    const slicedProducts = products.slice(start, end);
    // Pad last slide with empty placeholders to ensure 4 slots
    if (slicedProducts.length < cardsPerView) {
      return [
        ...slicedProducts,
        ...Array(cardsPerView - slicedProducts.length).fill(null)
      ];
    }
    return slicedProducts;
  }, [products, currentIndex, isMobile]);

  // Reset currentIndex if it exceeds totalSlides - 1
  useEffect(() => {
    if (currentIndex >= totalSlides) {
      setCurrentIndex(totalSlides - 1);
      console.log(`CompanyProducts: Reset currentIndex to ${totalSlides - 1} as it exceeded totalSlides (${totalSlides})`);
    }
  }, [currentIndex, totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    console.log('CompanyProducts: Previous slide triggered');
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => Math.min(totalSlides - 1, prev + 1));
    console.log('CompanyProducts: Next slide triggered');
  }, [totalSlides]);

  const handleBook = useCallback((productName) => {
    navigate(`/book-product/${encodeURIComponent(productName)}`);
  }, [navigate]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      console.log(`CompanyProducts: Window resized, isMobile=${window.innerWidth <= 768}`);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isMobile) return; // Disable key navigation on mobile
      if (e.key === 'ArrowLeft') {
        e.preventDefault(); // Prevent page scrolling
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault(); // Prevent page scrolling
        nextSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide, isMobile]);

  console.log(
    'CompanyProducts: Rendering products:',
    isMobile ? `All ${products.length} products` : `${cardsPerView} of ${products.length} (slide ${currentIndex + 1}/${totalSlides})`,
    'Visible:',
    visibleProducts.map(p => p?.name || 'Empty')
  );

  return (
    <section className="company-products-section">
      <h2>Our Signature Company Experiences</h2>
      <div className="company-products-container">
        <div
          className="company-products-slider"
          style={isMobile ? {} : { transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)` }}
        >
          {visibleProducts.map((product, index) => (
            product ? (
              <div key={`${product.name}-${index}`} className="company-product-card">
                <img
                  src={product.image}
                  alt={product.name}
                  className="company-product-image"
                  onLoad={() => console.log(`CompanyProducts: Image loaded: ${product.image}`)}
                  onError={(e) => {
                    console.error(`CompanyProducts: Failed to load image: ${product.image}`);
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
                <div className="company-product-info">
                  <h3>{product.name}</h3>
                  <p className="company-product-description">
                    {product.description.length > 100 
                      ? product.description.substring(0, 100) + '...' 
                      : product.description}
                  </p>
                  {product.price && (
                    <p className="company-product-price">
                      ${product.price.toFixed(1)}{product.name === 'Motor Bikes Rent' ? '/day' : '/person'}
                    </p>
                  )}
                  <button
                    className="cta-button"
                    onClick={() => handleBook(product.name)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ) : (
              <div key={`empty-${index}`} className="company-product-card-empty"></div>
            )
          ))}
        </div>
        {!isMobile && totalSlides > 1 && (
          <>
            <button
              className="company-products-arrow company-products-arrow-left"
              onClick={prevSlide}
              aria-label="Previous products"
              disabled={currentIndex === 0}
            >
              &#10094;
            </button>
            <button
              className="company-products-arrow company-products-arrow-right"
              onClick={nextSlide}
              aria-label="Next products"
              disabled={currentIndex === totalSlides - 1}
            >
              &#10095;
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default CompanyProducts;
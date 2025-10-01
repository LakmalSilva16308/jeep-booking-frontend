import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CompanyProducts.css';

const COMPANY_PRODUCTS = [
  {
    name: 'Hiriwadunna Village Tour and Jeep Safari One Day Tour',
    price: 45,
    description: 'Embark on a full-day adventure combining a cultural village tour in Hiriwadunna with an exhilarating jeep safari through the wilderness.',
    image: '/images/hiriwadunna.png'
  },
  {
    name: 'Sigiriya Tour,Dambulla Temple, Village Tour and Jeep Safari',
    price: 78,
    description: 'Experience a two-day journey exploring a traditional village, a thrilling jeep safari, the iconic Sigiriya Lion Rock, and the historic Dambulla Cave Temple.',
    image: '/images/dambulla.jpg'
  },
  { 
    name: 'Jeep Safari', 
    price: 38,
    description: 'Explore the wilderness with an exciting jeep safari adventure.', 
    image: '/images/jeep_safari.jpg' 
  },
  { 
    name: 'Village Tour', 
    price: 19.9,
    description: 'Immerse yourself in the rich culture and traditions of a local village.', 
    image: '/images/tour.jpg' 
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
    price: 9,
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
    image: '/images/high_tea_1.webp' 
  },
  { 
    name: 'Bullock Cart Ride', 
    price: 9.9,
    description: 'Travel back in time with a traditional bullock cart ride.', 
    image: '/images/bullockcart_ride.jpg' 
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
];

const CompanyProducts = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const cardsPerView = 4;
  const totalSlides = Math.ceil(COMPANY_PRODUCTS.length / cardsPerView);
  const sliderRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const products = useMemo(() => COMPANY_PRODUCTS, []);
  const visibleProducts = useMemo(() => {
    if (isMobile) {
      return products;
    }
    const start = currentIndex * cardsPerView;
    const end = start + cardsPerView;
    const slicedProducts = products.slice(start, end);
    return slicedProducts.length < cardsPerView
      ? [...slicedProducts, ...Array(cardsPerView - slicedProducts.length).fill(null)]
      : slicedProducts;
  }, [products, currentIndex, isMobile]);

  useEffect(() => {
    if (currentIndex >= totalSlides) {
      setCurrentIndex(totalSlides - 1);
      console.log(`CompanyProducts: Reset currentIndex to ${totalSlides - 1} (totalSlides: ${totalSlides})`);
    }
  }, [currentIndex, totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      const newIndex = Math.max(0, prev - 1);
      console.log(`CompanyProducts: Previous slide, currentIndex: ${newIndex}/${totalSlides}`);
      return newIndex;
    });
  }, [totalSlides]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      const newIndex = Math.min(totalSlides - 1, prev + 1);
      console.log(`CompanyProducts: Next slide, currentIndex: ${newIndex}/${totalSlides}`);
      return newIndex;
    });
  }, [totalSlides]);

  const handleBook = useCallback((productName) => {
    console.log(`CompanyProducts: Navigating to book-product/${encodeURIComponent(productName)}`);
    navigate(`/book-product/${encodeURIComponent(productName)}`);
  }, [navigate]);

  const handleLearnMore = useCallback((productName) => {
    console.log(`CompanyProducts: Navigating to product-description/${encodeURIComponent(productName)}`);
    navigate(`/product-description/${encodeURIComponent(productName)}`);
  }, [navigate]);

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth <= 768;
      setIsMobile(newIsMobile);
      if (!newIsMobile && currentIndex >= totalSlides) {
        setCurrentIndex(totalSlides - 1);
        console.log(`CompanyProducts: Resize, reset currentIndex to ${totalSlides - 1}`);
      }
      console.log(`CompanyProducts: Resize, isMobile: ${newIsMobile}, currentIndex: ${currentIndex}`);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex, totalSlides]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isMobile) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide, isMobile]);

  // Touch swipe support
  const handleTouchStart = (e) => {
    const x = e.clientX || e.touches?.[0]?.clientX;
    if (x !== undefined) {
      setTouchStart(x);
      setTouchEnd(null);
      console.log(`CompanyProducts: Touch start at x=${x}`);
    }
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;
    const x = e.clientX || e.touches?.[0]?.clientX;
    if (x !== undefined) {
      setTouchEnd(x);
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const deltaX = touchStart - touchEnd;
    if (deltaX > 50) {
      nextSlide();
      console.log(`CompanyProducts: Swipe left, deltaX=${deltaX}`);
    } else if (deltaX < -50) {
      prevSlide();
      console.log(`CompanyProducts: Swipe right, deltaX=${deltaX}`);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  console.log(
    `CompanyProducts: Rendering slide ${currentIndex + 1}/${totalSlides}, visible:`,
    visibleProducts.map(p => p?.name || 'Empty')
  );

  return (
    <section className="company-products-section">
      <h2>Our Signature Company Experiences</h2>
      <div className="company-products-container">
        <div
          className="company-products-slider"
          style={isMobile ? {} : { transform: `translateX(-${(currentIndex * 100) / totalSlides}%)` }}
          ref={sliderRef}
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {products.map((product, index) => (
            <div
              key={`${product.name}-${index}`}
              className={`company-product-card ${!product ? 'company-product-card-empty' : ''}`}
            >
              {product && (
                <>
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
                      className="cta-button learn-more-button"
                      onClick={() => handleLearnMore(product.name)}
                    >
                      Learn More
                    </button>
                    <button
                      className="cta-button"
                      onClick={() => handleBook(product.name)}
                    >
                      Book Now
                    </button>
                  </div>
                </>
              )}
            </div>
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
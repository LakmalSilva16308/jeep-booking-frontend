import React, { useState, useEffect } from 'react';
import '../styles/App.css';

const ReviewGridSlider = ({ reviews }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerRow = 4;
  const totalSlides = Math.ceil(reviews.length / cardsPerRow);

  // Auto-slide every 5 seconds if more than 4 reviews
  useEffect(() => {
    if (reviews.length <= cardsPerRow) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(interval);
  }, [totalSlides, reviews.length]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % totalSlides);
  };

  const visibleReviews = reviews.slice(currentIndex * cardsPerRow, (currentIndex + 1) * cardsPerRow);

  if (!reviews || reviews.length === 0) {
    return <p className="no-reviews">No reviews yet</p>;
  }

  return (
    <div className="review-grid-slider">
      <div className="reviews-container">
        <div className="reviews-grid">
          {visibleReviews.map(review => (
            <div key={review._id} className="review-card">
              <p className="rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
              <p>{review.comment}</p>
              <p className="name">— {review.reviewerId?.fullName || 'Anonymous'}</p>
              <p className="service-name">{review.targetId?.serviceName || 'Unknown Service'}</p>
            </div>
          ))}
        </div>
        {totalSlides > 1 && (
          <>
            <button className="reviews-arrow reviews-arrow-left" onClick={handlePrev}>
              ←
            </button>
            <button className="reviews-arrow reviews-arrow-right" onClick={handleNext}>
              →
            </button>
          </>
        )}
      </div>
      {totalSlides > 1 && (
        <div className="reviews-dots">
          {Array.from({ length: totalSlides }, (_, index) => (
            <span
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewGridSlider;
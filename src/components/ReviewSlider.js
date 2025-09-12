import React, { useEffect, useState } from 'react';
import '../styles/App.css';

const ReviewSlider = ({ reviews }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (reviews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [reviews.length]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % reviews.length);
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  if (!reviews || reviews.length === 0) {
    return <p>No reviews yet</p>;
  }

  return (
    <div className="review-slider">
      <div
        className="review-slider-container"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {reviews.map(review => (
          <div key={review._id} className="review-card">
            <p className="rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
            <p>{review.comment}</p>
            <p className="name">— {review.reviewerId?.fullName || 'Anonymous'}</p>
          </div>
        ))}
      </div>
      {reviews.length > 1 && (
        <>
          <button className="reviews-arrow reviews-arrow-left" onClick={handlePrev}>
            ←
          </button>
          <button className="reviews-arrow reviews-arrow-right" onClick={handleNext}>
            →
          </button>
          <div className="reviews-dots">
            {reviews.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => handleDotClick(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewSlider;
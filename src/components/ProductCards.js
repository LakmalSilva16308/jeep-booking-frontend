import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../constants/products.js';
import '../styles/App.css';

const ProductCards = () => {
  const navigate = useNavigate();

  return (
    <section className="product-cards-section">
      <h2>Our Signature Experiences</h2>
      <div className="product-cards-container">
        {Object.entries(PRODUCTS).map(([name, product]) => (
          <div key={name} className="product-card">
            <img src={product.image} alt={name} className="product-image" />
            <div className="product-info">
              <h3>{name}</h3>
              <p className="product-price">${product.price}</p>
              <p className="product-description">{product.description}</p>
              <button
                className="cta-button"
                onClick={() => navigate(`/book-product/${encodeURIComponent(name)}`)}
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductCards;
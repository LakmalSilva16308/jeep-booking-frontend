import React from 'react';
import '../styles/App.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>SL Eco Tour</h3>
          <p>Explore thrilling adventures with our trusted providers!</p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/services">Services</a></li>
            <li><a href="/signup">Sign Up</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Contact</h3>
          <p>Email: Villagesltour@gmail.com</p>
          <p>Phone: +94 777 393 670</p>
        </div>
        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-links">
            <a href="https://www.facebook.com/niroshan.madushanka.341057" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 Sl Eco Tour. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
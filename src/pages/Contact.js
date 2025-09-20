import '../styles/App.css';
import '../styles/Contact.css';

function Contact() {
  return (
    <div className="contact-page container">
      <section className="hero-section">
        <div className="hero-image">
          <img src="/images/img4.jpg" alt="Contact Adventure Booking" className="hero-img" />
        </div>
        <div className="hero-content">
          <h1>Get in Touch</h1>
          <p className="hero-text">
            We're here to help you plan your next adventure in Sri Lanka. Reach out to us for any inquiries or support!
          </p>
          <a href="https://wa.me/+94777393670" className="cta-button" target="_blank" rel="noopener noreferrer">
            Chat on WhatsApp
          </a>
        </div>
      </section>

      <section className="contact-content">
        <h2>Contact Us</h2>
        <p className="intro-text">
          At Adventure Booking, we’re dedicated to making your travel experience seamless and memorable. Whether you have questions about our Jeep Safaris, Catamaran Boat Rides, or any other adventure, our team is ready to assist you.
        </p>

        <div className="contact-grid">
          <div className="contact-card">
            <h3>Email</h3>
            <p>
              <a href="mailto:support@adventurebooking.com" className="contact-link">
                Villagesltour@gmail.com
              </a>
            </p>
          </div>
          <div className="contact-card">
            <h3>Phone</h3>
            <p>
              <a href="https://wa.me/+94777393670" target="_blank" rel="noopener noreferrer" className="contact-link">
                +94 777 393 670
              </a>
            </p>
          </div>
          <div className="contact-card">
            <h3>Address</h3>
            <p>
              Hiriwadunna habarana<br />
              50150<br />
              Sri Lanka
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
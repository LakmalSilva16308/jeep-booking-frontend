import '../styles/App.css';
import '../styles/About.css';

function About() {
  return (
    <div className="about-page container">
      <section className="hero-section">
        <div className="hero-image">
          <img src="/images/img2.webp" alt="Adventure Booking Experience" className="hero-img" />
        </div>
        <div className="hero-content">
          <h1>Welcome to Adventure Booking</h1>
          <p className="hero-text">
            Discover the heart of Sri Lanka with unforgettable experiences tailored for adventure seekers and cultural enthusiasts.
          </p>
          <a href="/services" className="cta-button">Explore Adventures</a>
        </div>
      </section>

      <section className="about-content">
        <h2>About Us</h2>
        <p className="intro-text">
          At Adventure Booking, we are passionate about showcasing the vibrant culture, stunning landscapes, and thrilling adventures of Sri Lanka. Our mission is to connect travelers with authentic experiences that create lasting memories.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <h3>Unique Experiences</h3>
            <p>
              From thrilling Jeep Safaris through national parks to serene Catamaran Boat Rides along the coast, we offer a diverse range of activities to suit every traveler.
            </p>
          </div>
          <div className="feature-card">
            <h3>Local Expertise</h3>
            <p>
              Our trusted providers are local experts who bring you closer to Sri Lanka’s traditions, whether through a Bullock Cart Ride or a Traditional Village Lunch.
            </p>
          </div>
          <div className="feature-card">
            <h3>Seamless Booking</h3>
            <p>
              Our user-friendly platform ensures a hassle-free booking process, connecting you with top-rated providers for a smooth adventure.
            </p>
          </div>
        </div>
      </section>

      <section className="mission-section">
        <h2>Our Mission</h2>
        <p>
          We aim to promote sustainable tourism by partnering with local communities, ensuring every adventure supports the people and places that make Sri Lanka special.
        </p>
      </section>
    </div>
  );
}

export default About;
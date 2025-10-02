import '../styles/App.css';
import '../styles/About.css';

function About() {
  return (
    <>
      <title>Eco Tourism Sri Lanka - About SLECO Tour 2025</title>
      <meta name="description" content="Learn about SLECO Tour’s mission to promote eco tourism in Sri Lanka through jeep safaris, village tours, and cultural adventures." />
      <meta name="keywords" content="eco tourism sri lanka, sri lanka tourism, Minneriya jeep safari sri lanka, hiriwadunna village tour, sigiriya lion rock" />
      <meta property="og:title" content="Eco Tourism Sri Lanka - About SLECO Tour" />
      <meta property="og:description" content="Discover SLECO Tour’s commitment to sustainable Sri Lanka tourism with jeep safaris and village experiences." />
      <meta property="og:image" content="https://www.slecotour.com/images/hiriwadunna.png" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Eco Tourism Sri Lanka - About SLECO Tour" />
      <meta name="twitter:description" content="Discover SLECO Tour’s commitment to sustainable Sri Lanka tourism with jeep safaris and village experiences." />
      <meta name="twitter:image" content="https://www.slecotour.com/images/hiriwadunna.png" />

      <div className="about-page container">
        <section className="hero-section">
          <div className="hero-image">
            <img src="/images/img2.webp" alt="Eco tourism Sri Lanka adventure with SLECO Tour" className="hero-img" loading="lazy" />
          </div>
          <div className="hero-content">
            <h1>Welcome to SLECO Tour</h1>
            <p className="hero-text">
              Discover the heart of Sri Lanka tourism with unforgettable eco-friendly experiences tailored for adventure seekers and cultural enthusiasts.
            </p>
            <a href="/services" className="cta-button">Explore Adventures</a>
          </div>
        </section>
        <section className="about-content">
          <h2>About Us</h2>
          <p className="intro-text">
            At SLECO Tour, we are passionate about showcasing the vibrant culture, stunning landscapes, and thrilling adventures of Sri Lanka. Our mission is to connect travelers with authentic eco tourism experiences, from Minneriya jeep safaris to Hiriwadunna village tours, creating lasting memories.
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Unique Eco Adventures</h3>
              <p>
                From thrilling Minneriya jeep safaris to serene catamaran boat rides on Hiriwadunna Lake, we offer diverse Sri Lanka tourism activities.
              </p>
            </div>
            <div className="feature-card">
              <h3>Local Expertise</h3>
              <p>
                Our trusted providers offer authentic experiences like Sigiriya Lion Rock climbs and traditional village cooking classes.
              </p>
            </div>
            <div className="feature-card">
              <h3>Seamless Booking</h3>
              <p>
                Our platform ensures a hassle-free booking process for eco tourism in Sri Lanka, connecting you with top-rated providers.
              </p>
            </div>
          </div>
        </section>
        <section className="mission-section">
          <h2>Our Mission</h2>
          <p>
            We promote eco tourism in Sri Lanka by partnering with local communities, ensuring every adventure supports sustainable travel and cultural preservation.
          </p>
        </section>
      </div>
    </>
  );
}

export default About;
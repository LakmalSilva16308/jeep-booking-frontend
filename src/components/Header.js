import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../styles/App.css';

function Header() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setRole(decoded.role);
      } catch (err) {
        console.error('Error decoding token:', err);
        localStorage.removeItem('token');
        setToken(null);
        setRole(null);
      }
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setRole(null);
    navigate('/login');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header>
      <nav>
        <Link to="/" className="logo">SL ECO TOUR</Link>
        
        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => isMenuOpen && toggleMenu()}>+94 777 393 670</Link>
          <Link to="/" onClick={() => isMenuOpen && toggleMenu()}>Home</Link>
          <Link to="/services" onClick={() => isMenuOpen && toggleMenu()}>Services</Link>
          <Link to="/about" onClick={() => isMenuOpen && toggleMenu()}>About</Link>
          <Link to="/contact" onClick={() => isMenuOpen && toggleMenu()}>Contact</Link>
          {token ? (
            <>
              {role === 'tourist' && <Link to="/tourist-dashboard" onClick={() => isMenuOpen && toggleMenu()}>My Dashboard</Link>}
              {role === 'provider' && <Link to="/provider-dashboard" onClick={() => isMenuOpen && toggleMenu()}>Provider Dashboard</Link>}
              {role === 'admin' && <Link to="/admin-panel" onClick={() => isMenuOpen && toggleMenu()}>Admin Panel</Link>}
              <button className="logout-button" onClick={() => { handleLogout(); isMenuOpen && toggleMenu(); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/signup" onClick={() => isMenuOpen && toggleMenu()}>Sign Up</Link>
              <Link to="/login" onClick={() => isMenuOpen && toggleMenu()}>Login</Link>
            </>
          )}
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            <span className="theme-icon">{isDarkMode ? '☀️' : '🌙'}</span>
          </button>
        </div>
        <div className="hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>
    </header>
  );
}

export default Header;
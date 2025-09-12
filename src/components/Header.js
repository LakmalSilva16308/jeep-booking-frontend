import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../styles/App.css';

function Header() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  return (
    <header>
      <nav>
        <Link to="/" className="logo">Adventure Booking</Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          {token ? (
            <>
              {role === 'tourist' && <Link to="/tourist-dashboard">My Dashboard</Link>}
              {role === 'provider' && <Link to="/provider-dashboard">Provider Dashboard</Link>}
              {role === 'admin' && <Link to="/admin-panel">Admin Panel</Link>}
              <button className="logout-button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/signup">Sign Up</Link>
              <Link to="/login">Login</Link>
            </>
          )}
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            <span className="theme-icon">{isDarkMode ? '☀️' : '🌙'}</span>
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Header;
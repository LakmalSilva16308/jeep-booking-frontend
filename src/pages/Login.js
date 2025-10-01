import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/App.css';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'tourist' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const cleanApiUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '') || 'https://jeep-booking-backend.vercel.app/api';

  console.log('API URL:', cleanApiUrl);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      console.log('Sending request to:', `${cleanApiUrl}/auth/login`, 'with data:', formData);
      const res = await axios.post(`${cleanApiUrl}/auth/login`, formData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true // Enable credentials for CORS
      });
      localStorage.setItem('token', res.data.token);
      if (formData.role === 'tourist') navigate('/tourist-dashboard');
      else if (formData.role === 'provider') navigate('/provider-dashboard');
      else if (formData.role === 'admin') navigate('/admin-panel');
    } catch (err) {
      console.error('Login.js: Error logging in:', err);
      setError(err.response?.data?.error || 'Failed to log in. Please check your credentials or network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Role</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="tourist">Tourist</option>
            <option value="provider">Provider</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="form-group">
          <label>Username or Email</label>
          <input type="text" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <button type="submit" disabled={loading}>{loading ? 'Logging In...' : 'Login'}</button>
        </div>
        {error && <p className="error">{error}</p>}
      </form>
      <p>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}

export default Login;
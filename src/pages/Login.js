import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'tourist' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      if (formData.role === 'tourist') navigate('/tourist-dashboard');
      else if (formData.role === 'provider') navigate('/provider-dashboard');
      else if (formData.role === 'admin') navigate('/admin-panel');
    } catch (err) {
      alert('Error logging in: ' + (err.response?.data?.error || err.message));
    }
    setLoading(false);
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
      </form>
      <p>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}

export default Login;
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPanel from '../components/AdminPanel';

function AdminPanelPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setError('No token found. Please log in.');
      setLoading(false);
      navigate('/login');
      return;
    }
    try {
      if (!token.includes('.') || token.split('.').length !== 3) {
        throw new Error('Invalid token format');
      }
      const decoded = JSON.parse(atob(token.split('.')[1]));
      console.log('Admin token decoded:', decoded);
      if (decoded.role !== 'admin') {
        console.error('Not authorized: Role is not admin');
        localStorage.removeItem('token');
        setError('Access denied. Please log in as admin.');
        navigate('/login');
        return;
      }
      setError(null);
    } catch (err) {
      console.error('Invalid token in AdminPanelPage:', err.message);
      localStorage.removeItem('token');
      setError('Session expired or invalid. Please log in again.');
      navigate('/login');
      return;
    }
    setLoading(false);
  }, [navigate, token]);

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (error) {
    return <div className="container error">{error}</div>;
  }

  return <AdminPanel />;
}

export default AdminPanelPage;
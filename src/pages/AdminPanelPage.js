import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPanel from '../components/AdminPanel';

function AdminPanelPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      if (decoded.role !== 'admin') {
        navigate('/login');
      }
    } catch (err) {
      console.error('Invalid token:', err);
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate, token]);

  return <AdminPanel />;
}

export default AdminPanelPage;
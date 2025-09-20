import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TouristDashboard from './TouristDashboard'; // Updated to import from pages directory

function TouristDashboardPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      if (decoded.role !== 'tourist') {
        navigate('/login');
      }
    } catch (err) {
      console.error('Invalid token:', err);
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate, token]);

  return <TouristDashboard />;
}

export default TouristDashboardPage;
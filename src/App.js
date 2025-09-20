import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Booking from './pages/Booking';
import ProviderProfile from './pages/ProviderProfile';
import Signup from './pages/Signup';
import Login from './pages/Login';
import TouristDashboardPage from './pages/TouristDashboardPage';
import ProviderDashboardPage from './pages/ProviderDashboardPage';
import AdminPanelPage from './pages/AdminPanelPage';
import About from './pages/About';
import Contact from './pages/Contact';
import ProductBookingForm from './pages/ProductBookingForm'; // New import
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/booking/:providerId" element={<Booking />} />
            <Route path="/provider/:id" element={<ProviderProfile />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/tourist-dashboard" element={<TouristDashboardPage />} />
            <Route path="/provider-dashboard" element={<ProviderDashboardPage />} />
            <Route path="/admin-panel" element={<AdminPanelPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/book-product/:productName" element={<ProductBookingForm />} /> {/* New route */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
import { Link } from 'react-router-dom';
import '../styles/App.css';

function ServiceCard({ provider }) {
  return (
    <div className="service-card">
      <img
        src={provider.profilePicture ? `http://localhost:5000${provider.profilePicture}` : '/images/placeholder.jpg'}
        alt={provider.serviceName}
        className="service-image"
        onError={(e) => {
          console.error(`Failed to load image: http://localhost:5000${provider.profilePicture}`);
          e.target.src = '/images/placeholder.jpg';
        }}
      />
      <h3>{provider.serviceName}</h3>
      <p>{provider.category ? provider.category.replace('-', ' ') : 'Unknown'}</p>
      <p>{provider.description ? provider.description.substring(0, 100) + '...' : 'No description available.'}</p>
      <p className="price">${provider.price}</p>
      <Link to={`/provider/${provider._id}`} className="service-button">View Details</Link>
    </div>
  );
}

export default ServiceCard;
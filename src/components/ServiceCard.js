import { Link } from 'react-router-dom';
import '../styles/Services.css';

function ServiceCard({ provider }) {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const cleanApiUrl = apiUrl.replace(/\/+$/, '');

  return (
    <div className="service-card">
      <img
        src={
          provider.profilePicture
            ? provider.profilePicture.startsWith('http')
              ? provider.profilePicture
              : `${cleanApiUrl}/${provider.profilePicture}`
            : '/images/placeholder.jpg'
        }
        alt={provider.serviceName}
        className="service-image"
        onLoad={() => console.log(`Service image loaded: ${provider.profilePicture}`)}
        onError={(e) => {
          console.error(`Failed to load image: ${provider.profilePicture}`);
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
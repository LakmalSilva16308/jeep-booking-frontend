import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import '../styles/ProductDescription.css';

const PRODUCT_DETAILS = [
  {
    name: 'Hiriwadunna Village Tour and Jeep Safari One Day Tour',
    image: '/images/hiriwadunna.png',
    detailedDescription: `
      Embark on an unforgettable full-day adventure that combines the rich cultural heritage of Hiriwadunna with the thrill of a jeep safari. Begin your journey with a guided tour through the serene Hiriwadunna Village, where you'll witness traditional Sri Lankan rural life. Interact with locals, learn about their customs, and experience a bullock cart ride through lush paddy fields. Afterward, hop into a rugged jeep for an exhilarating safari through the wilderness, spotting wildlife such as elephants, deer, and exotic birds. This tour offers a perfect blend of culture and adventure, ideal for those seeking an authentic Sri Lankan experience.
    `,
    relatedImages: [
      '/images/hiriwadunna_1.jpg',
      '/images/hiriwadunna_2.jpg',
      '/images/hiriwadunna_3.jpg',
      '/images/catamaran_boat_ride_1.jpeg',
      '/images/jeep_safari_1.jpg',
      '/images/village_cooking_5.jpeg',
      '/images/village_cooking_6.jpeg'
    ],
    additionalDetails: {
      duration: [
        'Village Tour: 2 - 2.5 hours',
        'Bullock Cart Ride: 20 - 30 minutes',
        'Boat Ride: 20 - 40 minutes',
        'Village Lunch: 30 minutes - 1.5 hours',
        'Jeep Safari: 2 - 2.5 hours'
      ],
      included: ['Village tour ticket'],
      excluded: ['Jeep safari entrance']
    },
    seo: {
      title: 'Hiriwadunna Village Tour & Jeep Safari - SLECO Tour 2025',
      description: 'Experience a Hiriwadunna village tour and jeep safari in Sri Lanka. Explore rural life and wildlife with SLECO Tour.',
      keywords: 'hiriwadunna village tour, sri lanka jeep safari, sri lanka tourism, eco tourism sri lanka'
    }
  },
  {
    name: 'Sigiriya Tour,Dambulla Temple, Village Tour and Jeep Safari',
    image: '/images/dambulla.jpg',
    detailedDescription: `
      This two-day immersive journey takes you deep into Sri Lanka’s cultural and natural treasures. Day one includes a village tour where you’ll engage with local traditions, followed by a thrilling jeep safari through untamed landscapes teeming with wildlife. On day two, climb the iconic Sigiriya Lion Rock, a UNESCO World Heritage Site, and marvel at its ancient frescoes and breathtaking views. Conclude your adventure with a visit to the historic Dambulla Cave Temple, adorned with intricate Buddhist murals and statues. This tour is perfect for history buffs and adventure seekers alike.
    `,
    relatedImages: [
      '/images/dambulla_1.jpg',
      '/images/village_tour_1.jpeg',
      '/images/dambulla_3.jpg',
      '/images/sigiriya.jpeg',
      '/images/dambulla_2.jpg',
      '/images/jeep1.jpeg',
      '/images/jeep2.jpeg',
      '/images/jeep4.jpeg'
    ],
    additionalDetails: {
      included: ['Village tour ticket'],
      excluded: ['Dambulla temple ticket', 'Sigiriya ticket', 'Jeep safari ticket']
    },
    seo: {
      title: 'Sigiriya, Dambulla & Jeep Safari Tour - SLECO Tour 2025',
      description: 'Explore Sigiriya Lion Rock, Dambulla Temple, and a jeep safari in Sri Lanka with SLECO Tour. Book your cultural adventure now.',
      keywords: 'sigiriya lion rock, dambulla temple, sri lanka jeep safari, sri lanka tourism, eco tourism sri lanka'
    }
  },
  {
    name: 'Jeep Safari',
    image: '/images/jeep_safari.jpg',
    detailedDescription: `
      Feel the adrenaline rush as you venture into the heart of Sri Lanka’s wilderness on a jeep safari. Traverse rugged terrains, dense forests, and open plains in a 4x4 vehicle, guided by experienced drivers. Keep your eyes peeled for elephants, leopards, and a variety of bird species. This adventure is perfect for nature lovers and thrill-seekers looking to explore the untamed beauty of Sri Lanka’s wildlife reserves.
    `,
    relatedImages: [
      '/images/jeep1.jpeg',
      '/images/jeep2.jpeg',
      '/images/jeep3.jpeg'
    ],
    additionalDetails: {
      included: ['Water bottle', 'Welcome drink'],
      excluded: ['Jeep safari ticket']
    },
    seo: {
      title: 'Yala Jeep Safari Sri Lanka - SLECO Tour 2025',
      description: 'Book a Yala jeep safari in Sri Lanka with SLECO Tour. Spot leopards and elephants in Yala National Park.',
      keywords: 'yala jeep safari sri lanka, sri lanka jeep safari, yala national park, eco tourism sri lanka'
    }
  },
  {
    name: 'Tuk Tuk Adventures',
    image: '/images/tuk_tuk.jpg',
    detailedDescription: `
      Hop aboard a vibrant tuk-tuk and zip through the scenic villages of Sri Lanka. This fun-filled adventure lets you experience local life up close, from bustling markets to tranquil countryside roads. Your local driver will share stories and insights, making this a culturally rich and exciting way to explore the region. Perfect for those who want a lively, authentic travel experience.
    `,
    relatedImages: [
      '/images/tuk_tuk_1.jpg',
      '/images/tuk_tuk_2.jpg',
      '/images/tuk_tuk_3.jpg',
      '/images/tuk (1).jpeg',
      '/images/tuk (2).jpeg',
      '/images/tuk (3).jpeg',
      '/images/tuk (4).jpeg'
    ],
    additionalDetails: {},
    seo: {
      title: 'Sri Lanka Tuk Tuk Tour - SLECO Tour 2025',
      description: 'Experience a tuk-tuk adventure through Sri Lankan villages with SLECO Tour. Book now for an authentic cultural journey.',
      keywords: 'tuk tuk tour sri lanka, sri lanka village tours, sri lanka tourism, eco tourism sri lanka'
    }
  },
  {
    name: 'Catamaran Boat Ride',
    image: '/images/catamaran_boat_ride.jpg',
    detailedDescription: `
      Set sail on a traditional catamaran for a serene journey across the tranquil waters of Hiriwadunna Lake. This peaceful boat ride offers stunning views of the surrounding nature and opportunities to spot local birdlife, including herons and kingfishers. Ideal for those seeking a relaxing escape, this experience combines natural beauty with cultural heritage.
    `,
    relatedImages: [
      '/images/catamaran_boat_ride_1.jpg',
      '/images/catamaran_boat_ride_2.jpg',
      '/images/catamaran_boat_ride_3.jpg',
      '/images/catamaran_boat_ride_1.jpeg',
      '/images/catamaran_boat_ride_2.jpeg',
      '/images/catamaran_boat_ride_3.jpeg',
      '/images/catamaran_boat_ride_4.jpeg'
    ],
    additionalDetails: {},
    seo: {
      title: 'Catamaran Boat Ride Sri Lanka - Hiriwadunna Lake Tour',
      description: 'Enjoy a catamaran boat ride on Hiriwadunna Lake with SLECO Tour, perfect for bird-watching and eco tourism in Sri Lanka.',
      keywords: 'catamaran boat ride sri lanka, hiriwadunna lake boat tour, sri lanka boat tours, eco tourism sri lanka'
    }
  },
  {
    name: 'Village Cooking Experience',
    image: '/images/village_cooking.jpg',
    detailedDescription: `
      Immerse yourself in Sri Lankan culinary traditions with a hands-on village cooking experience. Join local families in their homes to learn how to prepare authentic dishes using fresh, local ingredients. From spicy curries to fragrant rice, you’ll master recipes passed down through generations. Enjoy the fruits of your labor with a delicious meal, making this a delightful activity for food enthusiasts.
    `,
    relatedImages: [
      '/images/village_cooking_1.jpg',
      '/images/village_cooking_2.jpg',
      '/images/village_cooking_3.jpg',
      '/images/village_cooking_1.jpeg',
      '/images/village_cooking_2.jpeg',
      '/images/village_cooking_3.jpeg',
      '/images/village_cooking_4.jpeg',
      '/images/village_cooking_5.jpeg',
      '/images/village_cooking_6.jpeg',
      '/images/village_cooking_7.jpeg',
      '/images/village_cooking_8.jpeg',
      '/images/village_cooking_9.jpeg'
    ],
    additionalDetails: {
      duration: ['1.5 - 2 hours']
    },
    seo: {
      title: 'Sri Lanka Village Cooking Class - SLECO Tour 2025',
      description: 'Learn authentic Sri Lankan recipes in a village cooking class with SLECO Tour. Perfect for food lovers and cultural explorers.',
      keywords: 'sri lanka village cooking class, sri lanka tourism, authentic sri lankan cooking, eco tourism sri lanka'
    }
  },
  {
    name: 'Traditional Village Lunch',
    image: '/images/village_lunch.jpg',
    detailedDescription: `
      Savor the flavors of Sri Lanka with a traditional village lunch served in an authentic setting. Enjoy a spread of home-cooked dishes, including rice, curries, and local delicacies, all prepared with fresh ingredients. This experience offers a taste of rural hospitality and a chance to connect with local culture through food.
    `,
    relatedImages: [],
    additionalDetails: {},
    seo: {
      title: 'Traditional Sri Lankan Village Lunch - SLECO Tour 2025',
      description: 'Enjoy a traditional village lunch in Sri Lanka with SLECO Tour, featuring authentic home-cooked dishes.',
      keywords: 'traditional sri lankan village lunch, sri lanka tourism, eco tourism sri lanka'
    }
  },
  {
    name: 'Sundowners Cocktail',
    image: '/images/sundowners_cocktail.jpg',
    detailedDescription: `
      Unwind with a refreshing cocktail as you watch the sun set over the stunning Sri Lankan landscape. This sundowner experience combines tropical drinks with breathtaking views, creating a perfect evening of relaxation. Whether you’re toasting with friends or enjoying a quiet moment, this is an ideal way to end your day.
    `,
    relatedImages: [],
    additionalDetails: {},
    seo: {
      title: 'Sundowners Cocktail Sri Lanka - SLECO Tour 2025',
      description: 'Relax with a sundowners cocktail and stunning sunset views in Sri Lanka with SLECO Tour.',
      keywords: 'sundowners cocktail sri lanka, sri lanka tourism, eco tourism sri lanka'
    }
  },
  {
    name: 'High Tea',
    image: '/images/high_tea_1.webp',
    detailedDescription: `
      Indulge in a classic high tea experience, featuring a selection of fine teas, delicate sandwiches, and delectable pastries. Set in a charming environment, this activity offers a taste of colonial elegance blended with Sri Lankan hospitality. Perfect for those looking to relax and enjoy a refined afternoon.
    `,
    relatedImages: [],
    additionalDetails: {},
    seo: {
      title: 'High Tea Experience Sri Lanka - SLECO Tour 2025',
      description: 'Enjoy a classic high tea with fine teas and pastries in Sri Lanka with SLECO Tour.',
      keywords: 'high tea sri lanka, sri lanka tourism, eco tourism sri lanka'
    }
  },
  {
    name: 'Bullock Cart Ride',
    image: '/images/bullockcart_ride.jpg',
    detailedDescription: `
      Step back in time with a traditional bullock cart ride through the picturesque countryside. This leisurely journey offers a glimpse into rural Sri Lankan life, with scenic views of paddy fields and village homes. Guided by local farmers, this experience is both nostalgic and educational, ideal for families and culture enthusiasts.
    `,
    relatedImages: [
      '/images/bullockcart_ride_1.jpeg',
      '/images/bullockcart_ride_2.jpeg',
      '/images/bullockcart_ride_3.jpeg',
      '/images/bullockcart_ride_4.jpeg',
      '/images/bullockcart_ride_5.jpeg'
    ],
    additionalDetails: {
      duration: ['25 - 45 minutes']
    },
    seo: {
      title: 'Bullock Cart Ride Sri Lanka - SLECO Tour 2025',
      description: 'Experience a traditional bullock cart ride through Sri Lankan countryside with SLECO Tour.',
      keywords: 'bullock cart ride sri lanka, sri lanka village tours, sri lanka tourism, eco tourism sri lanka'
    }
  },
  {
    name: 'Village Tour',
    image: '/images/tour.jpg',
    detailedDescription: `
      Discover the heart of Sri Lanka with a guided village tour. Walk through vibrant communities, interact with friendly locals, and learn about traditional crafts, farming, and daily life. This immersive experience showcases the rich cultural tapestry of rural Sri Lanka, making it a must-do for cultural explorers.
    `,
    relatedImages: [
      '/images/village_tour_1.jpeg',
      '/images/catamaran_boat_ride_4.jpeg',
      '/images/village_lunch.jpg',
      '/images/catamaran_boat_ride_2.jpg'
    ],
    additionalDetails: {
      duration: ['2 - 2.5 hours']
    },
    seo: {
      title: 'Sri Lanka Village Tour - SLECO Tour 2025',
      description: 'Join a guided village tour in Sri Lanka with SLECO Tour to explore rural life and traditions.',
      keywords: 'sri lanka village tour, sri lanka tourism, eco tourism sri lanka'
    }
  },
  {
    name: 'Bicycle Tour',
    image: '/images/bicycle.jpeg',
    detailedDescription: `
      Pedal through the scenic countryside on a guided bicycle tour, exploring hidden trails, lush paddy fields, and quaint villages. This eco-friendly adventure offers a refreshing way to connect with nature and local culture, with opportunities to stop at local markets or temples along the way.
    `,
    relatedImages: [],
    additionalDetails: {},
    seo: {
      title: 'Bicycle Tour Sri Lanka - SLECO Tour 2025',
      description: 'Explore Sri Lanka’s countryside on a guided bicycle tour with SLECO Tour, perfect for eco-tourism enthusiasts.',
      keywords: 'bicycle tour sri lanka, sri lanka tourism, eco tourism sri lanka'
    }
  },
  {
    name: 'Sigiriya Lion Rock',
    image: '/images/sigiriya.jpeg',
    detailedDescription: `
      Ascend the majestic Sigiriya Lion Rock, a UNESCO World Heritage Site and one of Sri Lanka’s most iconic landmarks. Explore the ancient fortress, admire its stunning frescoes, and enjoy panoramic views from the summit. This historical adventure is perfect for those eager to uncover Sri Lanka’s rich past.
    `,
    relatedImages: [],
    additionalDetails: {
      duration: ['3 - 4 hours'],
      included: ['Water bottle'],
      excluded: ['Ticket'],
      notes: ['Transport dependent']
    },
    seo: {
      title: 'Sigiriya Lion Rock Tour - SLECO Tour 2025',
      description: 'Climb Sigiriya Lion Rock, a UNESCO site, with SLECO Tour for a historic Sri Lanka tourism adventure.',
      keywords: 'sigiriya lion rock, sri lanka tourism, eco tourism sri lanka'
    }
  },
  {
    name: 'Pidurangala Rock',
    image: '/images/pidurangala.webp',
    detailedDescription: `
      Hike to the summit of Pidurangala Rock for breathtaking views and a glimpse into Sri Lanka’s spiritual heritage. This lesser-known gem offers a quieter alternative to Sigiriya, with a historic rock temple and panoramic vistas of the surrounding landscape. Ideal for hikers and history lovers.
    `,
    relatedImages: [
      '/images/pidurangala_1.jpg',
      '/images/pidurangala_2.jpg',
      '/images/pidurangala_3.jpg',
      '/images/pidurangala.webp'
    ],
    additionalDetails: {
      duration: ['3 - 4 hours']
    },
    seo: {
      title: 'Pidurangala Rock Hike - SLECO Tour 2025',
      description: 'Hike Pidurangala Rock with SLECO Tour for stunning views and a spiritual Sri Lanka tourism experience.',
      keywords: 'pidurangala rock, sri lanka tourism, eco tourism sri lanka'
    }
  },
  {
    name: 'Polonnaruwa City Tour',
    image: '/images/polonnaruwa.jpg',
    detailedDescription: `
      Step into history with a guided tour of Polonnaruwa, an ancient royal capital and UNESCO World Heritage Site. Explore well-preserved ruins, including palaces, temples, and stupas, while learning about Sri Lanka’s medieval past. This tour is a must for history enthusiasts and cultural explorers.
    `,
    relatedImages: [
      '/images/polonnaruwa_1.jpg',
      '/images/polonnaruwa_2.jpg',
      '/images/polonnaruwa_3.jpg',
      '/images/polonnaruwa_4.jpg'
    ],
    additionalDetails: {},
    seo: {
      title: 'Polonnaruwa City Tour - SLECO Tour 2025',
      description: 'Explore Polonnaruwa, a UNESCO site, with SLECO Tour for a historic Sri Lanka tourism adventure.',
      keywords: 'polonnaruwa city tour, sri lanka tourism, eco tourism sri lanka'
    }
  },
  {
    name: 'Motor Bikes Rent',
    image: '/images/motor.jpg',
    detailedDescription: `
      Embark on a thrilling motorbike adventure through Sri Lanka’s scenic landscapes. Rent a reliable motorbike and explore at your own pace, from rural villages to coastal roads. This experience is perfect for adventure seekers looking for freedom and flexibility in their travels.
    `,
    relatedImages: [],
    additionalDetails: {},
    seo: {
      title: 'Motor Bike Rental Sri Lanka - SLECO Tour 2025',
      description: 'Rent a motorbike in Sri Lanka with SLECO Tour for a thrilling adventure through scenic landscapes.',
      keywords: 'motor bike rental sri lanka, sri lanka tourism, eco tourism sri lanka'
    }
  },
  {
    name: 'Village Walk Tour',
    image: '/images/walk.jpg',
    detailedDescription: `
      Take a leisurely stroll through a traditional Sri Lankan village, guided by locals who share stories of their culture and traditions. This walking tour offers an intimate look at rural life, with opportunities to visit homes, farms, and local landmarks. Perfect for those seeking a slow-paced, authentic experience.
    `,
    relatedImages: [
      '/images/village_walk_1.jpg',
      '/images/village_walk_2.jpg',
      '/images/village_walk_3.webp',
      '/images/village_walk_4.webp'
    ],
    additionalDetails: {
      duration: ['1.5 - 2.5 hours'],
      included: ['Water bottle'],
      notes: ['Open 6 AM - 4 PM']
    },
    seo: {
      title: 'Sri Lanka Village Walk Tour - SLECO Tour 2025',
      description: 'Join a village walk tour in Sri Lanka with SLECO Tour to explore rural life and traditions.',
      keywords: 'sri lanka village walk tour, sri lanka tourism, eco tourism sri lanka'
    }
  }
];

const ProductDescription = () => {
  const { productName } = useParams();
  const product = PRODUCT_DETAILS.find(p => p.name === decodeURIComponent(productName));

  if (!product) {
    return (
      <div className="product-description-container">
        <Helmet>
          <title>Product Not Found - SLECO Tour</title>
          <meta name="description" content="Explore Sri Lanka tourism with SLECO Tour’s eco-friendly adventures and cultural tours." />
        </Helmet>
        <h2>Product Not Found</h2>
        <p>Sorry, we couldn't find the requested product.</p>
        <Link to="/" className="cta-button">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="product-description-container">
      <Helmet>
        <title>{product.seo.title}</title>
        <meta name="description" content={product.seo.description} />
        <meta name="keywords" content={product.seo.keywords} />
        <meta property="og:title" content={product.seo.title} />
        <meta property="og:description" content={product.seo.description} />
        <meta property="og:image" content={`https://www.slecotour.com${product.image}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            "name": product.name,
            "description": product.seo.description,
            "url": `https://www.slecotour.com/product-description/${encodeURIComponent(product.name)}`
          })}
        </script>
      </Helmet>
      <div className="product-description-content animate-in">
        <h1>{product.name}</h1>
        <img
          src={product.image}
          alt={`${product.name} - Sri Lanka tourism adventure`}
          className="product-description-image"
          onError={(e) => {
            console.error(`Failed to load image: ${product.image}`);
            e.target.src = '/images/placeholder.jpg';
          }}
        />
        <div className="product-description-text">
          {product.detailedDescription.trim().split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
          <p>Discover the best of Sri Lanka tourism with {product.name.toLowerCase()}. Perfect for eco-tourists and adventure seekers visiting in 2025.</p>
        </div>
        {product.additionalDetails && (product.additionalDetails.duration?.length > 0 || product.additionalDetails.included?.length > 0 || product.additionalDetails.excluded?.length > 0 || product.additionalDetails.notes?.length > 0) && (
          <div className="additional-details">
            <h3>Additional Details</h3>
            {product.additionalDetails.duration?.length > 0 && (
              <div className="details-section">
                <h4>Duration</h4>
                <ul className="details-list">
                  {product.additionalDetails.duration.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {product.additionalDetails.included?.length > 0 && (
              <div className="details-section">
                <h4>Included</h4>
                <ul className="details-list">
                  {product.additionalDetails.included.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {product.additionalDetails.excluded?.length > 0 && (
              <div className="details-section">
                <h4>Excluded</h4>
                <ul className="details-list">
                  {product.additionalDetails.excluded.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {product.additionalDetails.notes?.length > 0 && (
              <div className="details-section">
                <h4>Notes</h4>
                <ul className="details-list">
                  {product.additionalDetails.notes.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        <div className="product-description-actions">
          <Link to={`/book-product/${encodeURIComponent(product.name)}`} className="cta-button">
            Book Now
          </Link>
          <Link to="/" className="cta-button secondary">
            Back to Home
          </Link>
        </div>
        {product.relatedImages && product.relatedImages.length > 0 && (
          <div className="related-images">
            <h3>Explore More</h3>
            <div className="related-images-grid">
              {product.relatedImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} - Sri Lanka tourism image ${index + 1}`}
                  className="related-image"
                  onError={(e) => {
                    console.error(`Failed to load related image: ${image}`);
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDescription;
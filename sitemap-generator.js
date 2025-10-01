const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');
const path = require('path');

const routes = [
  { url: '/', priority: 1.0, changefreq: 'daily' },
  { url: '/services', priority: 0.9, changefreq: 'weekly' },
  { url: '/about', priority: 0.7, changefreq: 'monthly' },
  { url: '/contact', priority: 0.6, changefreq: 'monthly' },
  { url: '/signup', priority: 0.6, changefreq: 'monthly' },
  { url: '/login', priority: 0.6, changefreq: 'monthly' },
  { url: '/tourist-dashboard', priority: 0.5, changefreq: 'weekly' },
  { url: '/provider-dashboard', priority: 0.5, changefreq: 'weekly' },
  { url: '/admin-panel', priority: 0.5, changefreq: 'monthly' },
  { url: '/product-description/Hiriwadunna%20Village%20Tour%20and%20Jeep%20Safari%20One%20Day%20Tour', priority: 0.9, changefreq: 'weekly' },
  { url: '/product-description/Sigiriya%20Tour%2CDambulla%20Temple%2C%20Village%20Tour%20and%20Jeep%20Safari', priority: 0.9, changefreq: 'weekly' },
  { url: '/product-description/Jeep%20Safari', priority: 0.9, changefreq: 'weekly' },
  { url: '/product-description/Tuk%20Tuk%20Adventures', priority: 0.8, changefreq: 'weekly' },
  { url: '/product-description/Catamaran%20Boat%20Ride', priority: 0.8, changefreq: 'weekly' },
  { url: '/product-description/Village%20Cooking%20Experience', priority: 0.8, changefreq: 'weekly' },
  { url: '/product-description/Traditional%20Village%20Lunch', priority: 0.7, changefreq: 'weekly' },
  { url: '/product-description/Sundowners%20Cocktail', priority: 0.7, changefreq: 'weekly' },
  { url: '/product-description/High%20Tea', priority: 0.7, changefreq: 'weekly' },
  { url: '/product-description/Bullock%20Cart%20Ride', priority: 0.8, changefreq: 'weekly' },
  { url: '/product-description/Village%20Tour', priority: 0.8, changefreq: 'weekly' },
  { url: '/product-description/Bicycle%20Tour', priority: 0.7, changefreq: 'weekly' },
  { url: '/product-description/Sigiriya%20Lion%20Rock', priority: 0.9, changefreq: 'weekly' },
  { url: '/product-description/Pidurangala%20Rock', priority: 0.8, changefreq: 'weekly' },
  { url: '/product-description/Polonnaruwa%20City%20Tour', priority: 0.8, changefreq: 'weekly' },
  { url: '/product-description/Motor%20Bikes%20Rent', priority: 0.7, changefreq: 'weekly' },
  { url: '/product-description/Village%20Walk%20Tour', priority: 0.8, changefreq: 'weekly' }
];

const sitemap = new SitemapStream({ hostname: 'https://www.slecotour.com' });
routes.forEach(route => sitemap.write(route));
sitemap.end();

streamToPromise(sitemap)
  .then(data => {
    createWriteStream(path.join(__dirname, 'public', 'sitemap.xml')).write(data.toString());
    console.log('Sitemap generated with keyword-optimized routes!');
  })
  .catch(console.error);
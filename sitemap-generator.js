const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');
const path = require('path');

// Keyword-Optimized Routes from App.js
const routes = [
  { url: '/', priority: 1.0, changefreq: 'daily' }, // sri lanka tourism
  { url: '/services', priority: 0.9, changefreq: 'weekly' }, // sri lanka jeep safari
  { url: '/product-description/jeep-safari', priority: 0.9, changefreq: 'weekly' }, // yala jeep safari sri lanka
  { url: '/product-description/catamaran-boat-ride', priority: 0.8, changefreq: 'weekly' }, // catamaran boat ride sri lanka
  { url: '/product-description/tuk-tuk-tour', priority: 0.8, changefreq: 'weekly' }, // sri lanka village tours
  { url: '/product-description/village-cooking', priority: 0.8, changefreq: 'weekly' }, // sri lanka village cooking class
  { url: '/about', priority: 0.7, changefreq: 'monthly' }, // eco tourism sri lanka
  { url: '/contact', priority: 0.6, changefreq: 'monthly' },
  { url: '/booking/:providerId', priority: 0.8, changefreq: 'weekly' } // dynamic, but included for crawlers
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
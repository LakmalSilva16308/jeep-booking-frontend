const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');
const path = require('path');

// Define your routes
const routes = [
  '/',
  '/tours',
  '/about',
  '/contact',
  '/booking',
  // Add more routes as needed
];

// Create sitemap
const sitemap = new SitemapStream({ hostname: 'https://www.slecotour.com' });

routes.forEach(route => {
  sitemap.write({ url: route, changefreq: 'weekly', priority: 0.8 });
});

sitemap.end();

// Write to public/sitemap.xml
streamToPromise(sitemap)
  .then(data => {
    createWriteStream(path.join(__dirname, 'public', 'sitemap.xml')).write(data.toString());
    console.log('Sitemap generated successfully!');
  })
  .catch(console.error);
const chokidar = require('chokidar');
const compression = require('compression');
const swPrecache = require('sw-precache');
const express = require('express');

const app = express();
app.use(compression());

const STATIC_ROOT = 'public';

const generateServiceWorker = () => {
  console.log('Generating a new service worker...');
  return swPrecache.generate({
    staticFileGlobs: [`${STATIC_ROOT}/**/!(*manifest.json*)`],
    stripPrefix: STATIC_ROOT,
    runtimeCaching: [{
      ///https://cdn0.iconfinder.com/data/icons/green-world-colored/80/battery-energy-charger-charging-electric-station-tesla-256.png
      urlPattern: new RegExp('^https://cdn0.iconfinder.com/'),
      handler: 'cacheFirst',
    }],
  });
};

let swPromise = generateServiceWorker();
const watcher = chokidar.watch(STATIC_ROOT);
watcher.on('ready', () => {
  watcher.on('all', () => {
    swPromise = generateServiceWorker();
  });
});

app.use(express.static(STATIC_ROOT));

app.get('/service-worker.js', (request, response) => {
  swPromise.then((swContents) => {
    response.setHeader('Content-Type', 'application/javascript');
    response.setHeader('Cache-Control', 'no-cache');
    response.send(swContents);
  });
});

// process.env.PORT
const listener = app.listen(3009, () => {
  console.log(`==> 🌎  listening on http://localhost:${listener.address().port}`);
});

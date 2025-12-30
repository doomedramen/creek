const CACHE_NAME = 'creek-soundboard-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/sounds.json',
  '/icons/favicon.svg',
  '/icons/app-icon-192.svg',
  '/icons/app-icon-512.svg'
];

// Install event - cache core assets and audio files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('Opened cache');

        // Cache static assets first
        await cache.addAll(urlsToCache);
        console.log('Static assets cached');

        // Fetch sounds.json and cache all audio files for offline playback
        try {
          const response = await fetch('/sounds.json');
          const data = await response.json();

          // Extract audio file paths
          const audioFiles = data.sounds.map(sound => sound.file);

          // Extract custom icon file paths (filter out null/undefined icons)
          const iconFiles = data.sounds
            .filter(sound => sound.icon && sound.icon.endsWith('.svg'))
            .map(sound => sound.icon);

          // Combine and remove duplicates
          const filesToCache = [...new Set([...audioFiles, ...iconFiles])];

          // Cache all audio and icon files
          if (filesToCache.length > 0) {
            await cache.addAll(filesToCache);
            console.log(`Cached ${filesToCache.length} audio/icon files for offline use`);
          }
        } catch (error) {
          console.error('Failed to cache audio files:', error);
          // Don't fail the entire installation if audio caching fails
          // Static assets are still cached and app will work partially
        }
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
  self.skipWaiting();
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the new resource (especially audio files)
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch((error) => {
          console.error('Fetch failed:', error);
          throw error;
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

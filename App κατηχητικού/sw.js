// Service Worker για PWA - Offline caching
const CACHE_NAME = 'katixitiko-v19';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.js',
  './styles.css',
  './manifest.json',
  './icon.svg'
];

// Εγκατάσταση - Αποθήκευση assets στην cache
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Ενεργοποίηση - Καθαρισμός παλιών caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Στρατηγική: Cache First, Network Fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // ΜΗΝ κάνεις cache αιτήματα προς Firebase
  if (url.hostname.includes('firebase') || 
      url.hostname.includes('googleapis') || 
      url.hostname.includes('gstatic') ||
      url.hostname.includes('google.com')) {
    return; // Άφησέ τα να περάσουν κανονικά από το δίκτυο
  }
  
  // Μόνο για GET requests
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Αν βρεθεί στην cache, επέστρεψέ το
        if (response) return response;
        
        // Αλλιώς, πάρε το από το δίκτυο και αποθήκευσέ το
        return fetch(event.request).then(networkResponse => {
          // Μην αποθηκεύεις μη-επιτυχείς απαντήσεις
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
            return networkResponse;
          }
          
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return networkResponse;
        }).catch(() => {
          // Αν δεν υπάρχει δίκτυο και δεν είναι cached, επέστρεψε το index.html
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});

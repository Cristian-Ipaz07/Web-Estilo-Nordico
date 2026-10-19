/**
 * Service Worker — Estilo Nórdico (Offline PWA & SWR Cache)
 * Permite navegación instantánea y acceso al catálogo completo incluso sin conexión a internet.
 */

const CACHE_NAME = 'estilo-nordico-v2';
const STATIC_ASSETS = [
  '/',
  '/chaquetas',
  '/perfumes',
  '/relojes',
  '/favicon.svg',
  '/assets/baner cha.png'
];

// Instalación: precargar shell esencial
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Precaching parcial de assets:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activación: limpiar cachés obsoletas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Intercepción de peticiones (Stale-While-Revalidate + Cache-First para imágenes)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo peticiones GET
  if (req.method !== 'GET') return;

  // 1. Imágenes (Supabase, locales, webp): Cache First con actualización en segundo plano
  if (req.destination === 'image' || url.pathname.match(/\.(webp|jpg|jpeg|png|svg|ico)$/i)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) {
          // Revalidar en segundo plano silenciosamente
          fetch(req).then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              cache.put(req, networkRes);
            }
          }).catch(() => {/* offline */});
          return cached;
        }

        try {
          const networkRes = await fetch(req);
          if (networkRes && networkRes.status === 200) {
            cache.put(req, networkRes.clone());
          }
          return networkRes;
        } catch (e) {
          return cached || new Response('', { status: 408, statusText: 'Offline Image' });
        }
      })
    );
    return;
  }

  // 2. Páginas HTML (Navegación): Network First con fallback inmediato a Caché si no hay internet
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req).then(async (networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, networkRes.clone());
        }
        return networkRes;
      }).catch(async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        const fallbackHome = await caches.match('/');
        return fallbackHome || new Response('<h1>Estás sin conexión</h1><p>Vuelve a conectarte para actualizar.</p>', {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      })
    );
    return;
  }

  // 3. API Pública de Productos (SWR): Cache first con red en segundo plano
  if (url.pathname.includes('/api/public/products')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(req);
        const fetchPromise = fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            cache.put(req, networkRes.clone());
          }
          return networkRes;
        }).catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // 4. Otros activos (JS, CSS, Fuentes): Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          caches.open(CACHE_NAME).then((cache) => cache.put(req, networkRes));
        }
        return networkRes;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

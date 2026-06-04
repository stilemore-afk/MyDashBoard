const CACHE_NAME = 'dashboard-v5';
const ASSETS = [
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())\n  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // 天気API(open-meteo)とGAS(script.google.com)への通信は、
  // キャッシュを通さず、ブラウザ本来の標準ネットワークリクエストとしてそのままプロキシ（中継）する
  if (url.hostname.includes('open-meteo.com') || url.hostname.includes('script.google.com')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // それ以外のローカルファイル（index.html等）はキャッシュまたはネットワークから取得
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});

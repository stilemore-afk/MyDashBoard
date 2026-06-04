const CACHE_NAME = 'dashboard-v4';
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
    }).then(() => self.skipWaiting())
  );
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

// === sw.js の fetch イベントを以下に丸ごと差し替え ===
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // 天気API(open-meteo)とGAS(script.google.com)への通信は、キャッシュ処理を通さず完全にブラウザに素通りさせる
  if (url.hostname.includes('open-meteo.com') || url.hostname.includes('script.google.com')) {
    // respondWith を呼ばずにただ処理を終えるか、直接標準の fetch を返すことでCORSエラーを防ぎます
    return;
  }

  // それ以外のローカルアセット（index.html等）は通常通りキャッシュを利用
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});

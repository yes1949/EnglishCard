const CACHE_NAME = 'vocab-app-cache-v1.13'; // 更新版本号！
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './service-worker.js',
  // 如果你有单独的 CSS/JS 文件，记得也加进来
];

// 安装阶段，缓存资源
self.addEventListener('install', event => {
  self.skipWaiting(); // 强制等待的 SW 立刻进入激活
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 激活阶段，清理旧缓存，接管页面
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// 监听 fetch 请求，优先用缓存，没有则网络请求
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

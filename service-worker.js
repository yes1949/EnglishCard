const CACHE_NAME = 'ec-app-cache-v1.16';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
  // 如果你加入了图标图片，请把它们也加到缓存列表里，例如：
  // './icon-192.png',
  // './icon-512.png'
];

// 安装阶段：预缓存核心文件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// 激活阶段：清理旧版本的缓存
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 拦截网络请求：优先从缓存读取，如果没有则发起网络请求并缓存新结果
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果在缓存中找到匹配的请求，则直接返回缓存
        if (response) {
          return response;
        }
        
        // 否则向服务器发起请求
        const fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(response => {
          // 检查是否是有效的响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 将新请求的响应存入缓存
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

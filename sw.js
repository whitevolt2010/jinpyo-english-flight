/* 진표의 영어 비행단 — 오프라인에서도 놀 수 있게 해 주는 일꾼 */
const CACHE = 'jinpyo-sky-v4';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isDoc = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html');
  if (isDoc) {
    // 새 판이 있으면 받아오고, 인터넷이 없으면 저장해 둔 것으로
    e.respondWith(
      fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(cc => cc.put(req, c)); return r; })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
  } else {
    // 글꼴·그림은 저장해 둔 것 먼저 (빠르고 오프라인에서도 됨)
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const c = res.clone(); caches.open(CACHE).then(cc => cc.put(req, c).catch(() => {}));
        return res;
      }).catch(() => hit))
    );
  }
});

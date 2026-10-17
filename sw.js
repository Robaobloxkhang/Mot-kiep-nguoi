/* Một Kiếp Người — service worker: chơi offline sau lần mở đầu tiên.
 * Trang chính & version.json: lấy mạng trước (để luôn nhận bản cập nhật), mất mạng thì dùng bản đã lưu.
 * Script/CSS/thư viện/phông: lấy bản đã lưu trước (tên file có ?v= theo bản dựng nên không bị cũ).
 * API online/bảng xếp hạng: luôn đi mạng, không lưu. */
const CACHE = 'mkn-v1';
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', 'manifest.webmanifest']).catch(() => {}))); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin && (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_vercel/'))) return; // online: không đụng
  const sameOrigin = url.origin === location.origin;
  const isPage = req.mode === 'navigate' || (sameOrigin && (url.pathname === '/' || url.pathname.endsWith('.html') || url.pathname.endsWith('version.json')));
  if (isPage) {
    e.respondWith(fetch(req).then((res) => { if (res.ok && req.mode === 'navigate') { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./', copy)); } return res; })
      .catch(() => caches.match(req).then((r) => r || caches.match('./'))));
    return;
  }
  const cacheable = sameOrigin || /cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com|unpkg\.com/.test(url.host);
  if (!cacheable) return;
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
    if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  })));
});

// Một Kiếp Người — máy chủ chuyển tiếp TURN cho Haxball / bóng rổ online
// Mạng trường học, công ty thường chặn kết nối trực tiếp giữa hai máy (WebRTC qua UDP). TURN chuyển tiếp dữ liệu qua cổng 443
// (trông như web bình thường) nên vẫn chơi được mà không cần VPN.
// GET /api/turn → { iceServers: [...] }   (rỗng nếu chưa cấu hình → trình duyệt chỉ dùng STUN như cũ)
//
// Cấu hình (Vercel → Settings → Environment Variables), chọn MỘT trong hai cách:
//   1) Cloudflare Realtime TURN (miễn phí 1000 GB/tháng): CF_TURN_KEY_ID + CF_TURN_KEY_API_TOKEN
//   2) TURN bất kỳ (vd metered.ca): TURN_URLS (nhiều địa chỉ cách nhau dấu phẩy) + TURN_USERNAME + TURN_CREDENTIAL
'use strict';

const CF_ID = process.env.CF_TURN_KEY_ID, CF_TOKEN = process.env.CF_TURN_KEY_API_TOKEN;
const TTL = 6 * 3600;
let cache = null; // { at, servers } — dùng lại trong cùng một phiên máy chủ cho đỡ gọi API

function send(res, status, obj, maxAge) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', maxAge ? 'private, max-age=' + maxAge : 'no-store');
  res.end(JSON.stringify(obj));
}

async function cloudflare() {
  if (cache && Date.now() - cache.at < (TTL - 1800) * 1000) return cache.servers;
  const r = await fetch('https://rtc.live.cloudflare.com/v1/turn/keys/' + encodeURIComponent(CF_ID) + '/credentials/generate-ice-servers', {
    method: 'POST', headers: { Authorization: 'Bearer ' + CF_TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify({ ttl: TTL }),
  });
  if (!r.ok) throw new Error('cf ' + r.status);
  const j = await r.json();
  const list = Array.isArray(j.iceServers) ? j.iceServers : j.iceServers ? [j.iceServers] : [];
  // bỏ cổng 53 (nhiều trình duyệt chặn) — giữ UDP 3478 và TCP/TLS 443
  const servers = list.map((s) => ({ ...s, urls: [].concat(s.urls || []).filter((u) => !/:53(\?|$)/.test(u)) })).filter((s) => s.urls.length);
  cache = { at: Date.now(), servers };
  return servers;
}

module.exports = async (req, res) => {
  try {
    if (CF_ID && CF_TOKEN) return send(res, 200, { iceServers: await cloudflare() }, 1800);
    // chấp nhận cả "host:port" (tự thêm turn:), và tự thêm bản TCP cho mạng chặn UDP
    const urls = [];
    String(process.env.TURN_URLS || '').split(',').map((s) => s.trim()).filter(Boolean).forEach((u) => {
      if (!/^turns?:/i.test(u)) u = 'turn:' + u;
      if (!urls.includes(u)) urls.push(u);
      if (/^turn:/i.test(u) && !/transport=/i.test(u)) { const t = u + '?transport=tcp'; if (!urls.includes(t)) urls.push(t); }
    });
    if (urls.length) return send(res, 200, { iceServers: [{ urls, username: process.env.TURN_USERNAME || '', credential: process.env.TURN_CREDENTIAL || '' }] }, 1800);
    return send(res, 200, { iceServers: [], off: true });
  } catch (e) {
    return send(res, 200, { iceServers: [], error: 'turn-unavailable' });
  }
};

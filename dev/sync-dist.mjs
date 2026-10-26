// Một Kiếp Người — đồng bộ dist/ sau khi sửa nguồn, và đóng dấu lại bản dựng (?v= trên thẻ script/css, KN_BUILD, version.json).
// Chạy:  node dev/sync-dist.mjs        (không cần PowerShell; script deploy-vercel.ps1 vẫn dùng được để dựng dist từ đầu)
// Vì sao cần: service worker lưu script/CSS theo URL kèm ?v=; không đổi dấu thì người chơi cũ giữ bản JS cũ.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const cp = (f) => fs.copyFileSync(path.join(root, f), path.join(dist, f));

fs.readdirSync(path.join(root, 'js')).filter((f) => f.endsWith('.js')).forEach((f) => cp('js/' + f));
['styles.css', 'sw.js', 'manifest.webmanifest'].forEach((f) => { if (fs.existsSync(path.join(root, f))) cp(f); });
// mô hình 3D của minigame Hầm ngục (assets/dread/*.glb)
if (fs.existsSync(path.join(root, 'assets', 'dread'))) { fs.mkdirSync(path.join(dist, 'assets', 'dread'), { recursive: true }); fs.readdirSync(path.join(root, 'assets', 'dread')).forEach((f) => fs.copyFileSync(path.join(root, 'assets', 'dread', f), path.join(dist, 'assets', 'dread', f))); }
// dist/vercel.json có cấu trúc riêng (chỉ phần headers); giữ nguyên, chỉ cảnh báo nếu thiếu
if (!fs.existsSync(path.join(dist, 'vercel.json'))) console.warn('Thiếu dist/vercel.json');

const d = new Date(), pad = (n) => String(n).padStart(2, '0');
const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
const idx = path.join(dist, 'index.html');
let html = fs.readFileSync(idx, 'utf8');
const n = (html.match(/\?v=20\d{12}/g) || []).length;
html = html.replace(/\?v=20\d{12}/g, '?v=' + stamp).replace(/KN_BUILD='20\d{12}'/, `KN_BUILD='${stamp}'`);
fs.writeFileSync(idx, html);
fs.writeFileSync(path.join(dist, 'version.json'), JSON.stringify({ build: stamp }));

// kiểm tra nhanh: mọi script trong index nguồn (trừ nạp trễ) có trong dist, và dist không thiếu tệp
const src = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const missing = [...src.matchAll(/<script src="(js\/[^"?]+)/g)].map((m) => m[1]).filter((f) => !fs.existsSync(path.join(dist, f)));
const inDist = new Set([...html.matchAll(/<script src="(js\/[^"?]+)/g)].map((m) => m[1]));
const notInDist = [...src.matchAll(/<script src="(js\/[^"?]+)/g)].map((m) => m[1]).filter((f) => !inDist.has(f));
if (notInDist.length) { console.error('dist/index.html thiếu thẻ script (thêm vào đúng vị trí như index.html): ' + notInDist.join(', ')); process.exit(1); }
console.log(`Đã đồng bộ dist/, đóng dấu ${stamp} (${n} thẻ ?v=).` + (missing.length ? ' THIẾU: ' + missing.join(', ') : ''));
process.exit(missing.length ? 1 : 0);

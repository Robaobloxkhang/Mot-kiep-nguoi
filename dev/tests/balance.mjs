// Một Kiếp Người — kiểm tra "sàn/trần" độ khó của từng minigame bằng thời gian ảo (nhanh, không phải chờ thật).
// Chạy:  node dev/tests/balance.mjs [--root=.|dist] [--only=sprint,swim] [--need=0.5] [--runs=2]
// Mỗi game chơi với hai kiểu "người chơi" vô dụng và báo điểm:
//   idle = không bấm gì · mash = bấm loạn phím liên tục.
// Một game mà idle/mash đã gần đạt yêu cầu là quá dễ (có thể "ăn gian"); cảnh báo khi idle ≥ 35% hoặc mash ≥ ngưỡng đạt.
// Đây là kiểm tra thô (không thay cho một bot chơi giỏi); các chỉ số nhân vật cố định ở mức trung bình (sức khỏe 70, trí tuệ 70).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] ?? true] : [a, true]; }));
const ROOT = path.resolve(here, '..', '..', args.root && args.root !== true ? args.root : '.');
const ONLY = args.only && args.only !== true ? String(args.only).split(',') : null;
const NEED = +(args.need || 0.5), RUNS = +(args.runs || 2);

let chromium;
try { ({ chromium } = await import('playwright')); } catch (e) { try { ({ chromium } = createRequire(import.meta.url)('playwright')); } catch (e2) { console.error('Chưa có Playwright: npm i -D playwright && npx playwright install chromium'); process.exit(2); } }

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer((q, s) => { let u = decodeURIComponent(q.url.split('?')[0]); if (u.endsWith('/')) u += 'index.html'; const fp = path.join(ROOT, u); if (!fp.startsWith(ROOT)) { s.writeHead(403); return s.end(); } fs.readFile(fp, (e, d) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': (MIME[path.extname(fp)] || 'application/octet-stream') + '; charset=utf-8' }); s.end(d); }); });
await new Promise((r) => server.listen(0, r));
const BASE = 'http://localhost:' + server.address().port + '/';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });

// các game không đo được kiểu này: có vòng lặp riêng/online (hax, race) hoặc cần nhập văn bản (scamchat)
const SKIP = new Set(['hax', 'race', 'scamchat', 'shoot']);
const KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', '1', '2', '3', '4', 'a', 'd', 'w', 's', 'j', 'k', 'f', 'e', 'Enter'];

async function play(page, type, policy) {
  // thời gian ảo: ép game chạy nhanh. Cài đồng hồ giả trước khi tạo game.
  await page.clock.install({ time: Date.now() });
  await page.evaluate(([t, need]) => {
    window.__pct = null; window.__done = false;
    // bắt điểm ngay khi màn kết quả hiện (bấm loạn có thể đóng nó nhanh hơn lúc đọc)
    new MutationObserver(() => { const b = document.querySelector('.mini-ring b'); if (b && window.__pct == null) window.__pct = parseInt(b.textContent, 10); }).observe(document.body, { childList: true, subtree: true, characterData: true });
    KN.Mini.test(t, need, { happy: 60, health: 70, smarts: 70, looks: 60 }, t === 'haggle' ? { mode: 'buy', price: 3e7, item: 'Xe cũ' } : t === 'love' ? { partnerName: 'Lan' } : {}).then(() => (window.__done = true));
  }, [type, NEED]);
  await page.clock.runFor(600);
  await page.evaluate(() => { const b = document.querySelector('.mini .btn-primary, .mini .mini-go, .mini [data-go]'); if (b) b.click(); }); // "Chơi thật!"
  if (policy === 'mash') {
    await page.evaluate((keys) => {
      let n = 0; window.__mash = setInterval(() => { const k = keys[(n++ * 7 + (n >> 3)) % keys.length], ev = (t) => window.dispatchEvent(new KeyboardEvent(t, { key: k, bubbles: true, cancelable: true })); ev('keydown'); setTimeout(() => ev('keyup'), 30);
        const el = document.querySelector('.mini canvas, .mini .am-arena'); if (el && n % 5 === 0) { const r = el.getBoundingClientRect(); el.dispatchEvent(new PointerEvent('pointerdown', { clientX: r.left + Math.random() * r.width, clientY: r.top + Math.random() * r.height, bubbles: true })); } }, 90);
    }, KEYS);
  }
  // chạy tới 150 giây ảo hoặc tới khi hiện màn kết quả
  let pct = null;
  for (let i = 0; i < 75 && pct == null; i++) {
    await page.clock.runFor(2000);
    pct = await page.evaluate(() => window.__pct);
  }
  await page.evaluate(() => { clearInterval(window.__mash); if (KN.Mini.abort) KN.Mini.abort(); });
  await page.clock.runFor(800);
  await page.evaluate(() => { const m = document.querySelector('.mini'); if (m) m.remove(); });
  return pct;
}

const rows = [], warn = [];
const types = await (async () => { const p = await browser.newPage(); await p.goto(BASE + 'index.html', { waitUntil: 'commit' }); await p.waitForFunction(() => window.KN && KN.Mini && KN.Mini.NAME, null, { timeout: 90000 }); const t = await p.evaluate(() => Object.keys(KN.Mini.NAME)); await p.close(); return t; })();
for (const type of types) {
  if (SKIP.has(type) || (ONLY && !ONLY.includes(type))) continue;
  const res = {};
  for (const policy of ['idle', 'mash']) {
    const vals = [];
    for (let k = 0; k < RUNS; k++) {
      const ctx = await browser.newContext({ viewport: { width: 1000, height: 760 } }); const page = await ctx.newPage();
      await page.goto(BASE + 'index.html', { waitUntil: 'commit' });
      try { await page.waitForFunction(() => window.KN && KN.UI && KN.Mini && document.querySelector('.hub-tile'), null, { timeout: 90000 }); await page.evaluate(() => { const m = document.getElementById('modal'); if (m && !m.hidden) { const c = m.querySelector('[data-close]'); if (c) c.click(); } KN.Mini.setEnabled(true); if (KN.World && KN.World.setPaused) KN.World.setPaused(true); /* tắt vẽ cảnh 3D phía sau để thời gian ảo chạy nhanh */ }); vals.push(await play(page, type, policy)); } catch (e) { vals.push(null); }
      await ctx.close();
    }
    res[policy] = vals;
  }
  const avg = (a) => { const v = a.filter((x) => x != null); return v.length ? Math.round(v.reduce((s, x) => s + x, 0) / v.length) : null; };
  const idle = avg(res.idle), mash = avg(res.mash);
  const flag = (idle != null && idle >= 35) || (mash != null && mash >= NEED * 100) || idle == null || mash == null; // không kết thúc trong 150s ảo cũng đáng xem
  rows.push({ type, idle, mash, raw: res }); if (flag) warn.push(type);
  console.log(`${flag ? '⚠' : ' '} ${type.padEnd(12)} idle=${idle == null ? 'không kết thúc' : idle + '%'}  mash=${mash == null ? 'không kết thúc' : mash + '%'}  (lần: ${JSON.stringify(res)})`);
}
await browser.close(); server.close();
console.log(warn.length ? `\nCần xem lại (quá dễ khi không chơi/bấm loạn, hoặc không kết thúc): ${warn.join(', ')}` : '\nKhông game nào bị "ăn gian" bằng idle/bấm loạn ở mức nhân vật trung bình.');

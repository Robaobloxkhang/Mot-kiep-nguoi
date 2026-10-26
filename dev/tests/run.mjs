// Một Kiếp Người — bộ kiểm tra tự động (không cần thêm gì vào game).
// Chạy:  node dev/tests/run.mjs [--root=.|dist] [--only=boot,lazy,minigames,jobtasks,shop,i18n,saves,a11y] [--quick]
// Cần Playwright + Chromium trên máy chạy test:  npm i -D playwright && npx playwright install chromium
//   (có thể chỉ đường dẫn Chromium sẵn có bằng biến môi trường CHROMIUM_PATH)
// Ghi chú: test dùng máy chủ tĩnh tạm thời trên cổng ngẫu nhiên, không gọi API online.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] ?? true] : [a, true]; }));
const ROOT = path.resolve(here, '..', '..', args.root && args.root !== true ? args.root : '.');
const ONLY = args.only && args.only !== true ? String(args.only).split(',') : null;
const QUICK = !!args.quick;

let chromium;
try { ({ chromium } = await import('playwright')); } catch (e) {
  try { ({ chromium } = createRequire(import.meta.url)('playwright')); } catch (e2) { // thử cả đường dẫn NODE_PATH (cài toàn cục)
    console.error('Chưa có Playwright. Cài bằng: npm i -D playwright && npx playwright install chromium'); process.exit(2);
  }
}

// ---------------------------------------------------------------- máy chủ tĩnh tạm
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/json', '.png': 'image/png' };
const server = http.createServer((q, s) => {
  let u = decodeURIComponent(q.url.split('?')[0]); if (u.endsWith('/')) u += 'index.html';
  const fp = path.join(ROOT, u);
  if (!fp.startsWith(ROOT)) { s.writeHead(403); return s.end(); }
  fs.readFile(fp, (e, d) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': (MIME[path.extname(fp)] || 'application/octet-stream') + '; charset=utf-8' }); s.end(d); });
});
await new Promise((r) => server.listen(0, r));
const BASE = 'http://localhost:' + server.address().port + '/';

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const results = [];
const IGNORE = /(_vercel\/insights|GL Driver Message|Failed to load resource)/;

async function openPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1100, height: 800 }, isMobile: !!opts.mobile, hasTouch: !!opts.mobile });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !IGNORE.test(m.text())) errs.push('console: ' + m.text().slice(0, 140)); });
  await page.goto(BASE + (opts.url || 'index.html'), { waitUntil: 'commit' });
  await page.waitForFunction(() => window.KN && KN.UI && KN.Game && document.querySelector('.hub-tile'), null, { timeout: 90000 });
  if (opts.closeModal !== false) await page.evaluate(() => { const m = document.getElementById('modal'); if (m && !m.hidden) { const c = m.querySelector('[data-close]'); if (c) c.click(); } KN.Mini.setEnabled(true); });
  return { page, ctx, errs };
}
const record = (name, ok, detail) => { results.push({ name, ok, detail }); console.log((ok ? '  ✓ ' : '  ✗ ') + name + (detail ? ' — ' + detail : '')); };
const want = (g) => !ONLY || ONLY.includes(g);

// ---------------------------------------------------------------- 1. khởi động
if (want('boot')) {
  console.log('[boot]');
  const { page, ctx, errs } = await openPage();
  await page.waitForTimeout(1500);
  record('mở trang, không lỗi JS', errs.length === 0, errs.slice(0, 3).join(' | '));
  const ok = await page.evaluate(() => !!(KN.Game && KN.Mini && KN.MiniMeta && KN.Arcade));
  record('các module chính có mặt (Game, Mini, MiniMeta, Arcade)', ok);
  await ctx.close();
}

// ---------------------------------------------------------------- 2. nạp trễ tình huống
if (want('lazy')) {
  console.log('[lazy] nạp trễ events_*.js');
  for (const early of [false, true]) {
    const { page, ctx, errs } = await openPage();
    let waited = true; if (!early) waited = await page.waitForFunction(() => KN.lazy && KN.lazy.done, null, { timeout: 170000 }).then(() => true, () => false); // máy yếu/vẽ phần mềm có thể mất vài chục giây
    const r = await page.evaluate(() => {
      const before = KN.EVENTS ? KN.EVENTS.length : 0; const G = KN.Game; G.newLife({}); const S = G._state(); let err = null;
      try { for (let i = 0; i < 8; i++) { S.pending.length = 0; S.stats.health = 90; G.ageUp(); } } catch (e) { err = String(e); }
      const ids = KN.EVENTS.map((e) => e.id); return { before, total: ids.length, unique: new Set(ids).size, age: G.view().age, err };
    });
    await page.waitForTimeout(2500);
    const after = await page.evaluate(() => { const ids = KN.EVENTS.map((e) => e.id); return { total: ids.length, unique: new Set(ids).size, done: KN.lazy ? KN.lazy.done : true }; });
    record(early ? 'bấm bắt đầu sớm → nạp đồng bộ dự phòng' : 'đợi nạp nền xong rồi chơi', waited && !r.err && r.total >= 800 && r.age >= 8 && after.unique === after.total && errs.length === 0, `trước=${r.before} sau=${r.total} duy nhất=${after.unique}/${after.total} tuổi=${r.age} ${r.err || ''} ${errs.slice(0, 2).join('|')}`);
    await ctx.close();
  }
}

// ---------------------------------------------------------------- 3. mọi minigame mở và chạy được
if (want('minigames')) {
  console.log('[minigames]');
  const { page, ctx, errs } = await openPage();
  const types = await page.evaluate(() => Object.keys(KN.Mini.NAME).filter((t) => t !== 'shoot'));
  const skip = new Set(['hax', 'race']); // game thật có vòng lặp riêng + online; kiểm tra riêng
  let n = 0;
  for (const t of types) {
    if (skip.has(t)) continue; if (QUICK && n++ % 3) continue;
    const before = errs.length;
    await page.evaluate((t) => { window.__r = KN.Mini.test(t, 0.5, null, t === 'haggle' ? { mode: 'buy', price: 3e7, item: 'Xe cũ' } : t === 'love' ? { partnerName: 'Lan' } : {}); }, t);
    await page.waitForTimeout(700);
    await page.evaluate(() => { const b = document.querySelector('.mini .btn-primary, .mini .mini-go, .mini [data-go]'); if (b) b.click(); });
    await page.waitForTimeout(1300);
    for (const k of ['ArrowRight', ' ', '1', 'ArrowUp']) { await page.keyboard.press(k); }
    await page.waitForTimeout(300);
    const open = await page.waitForSelector('.mini', { timeout: 3000 }).then(() => true, () => false);
    await page.evaluate(() => { if (KN.Mini.abort) KN.Mini.abort(); }); // thoát đúng đường để các module riêng (showbiz, jobsmini, race) tự dọn
    await page.waitForTimeout(500);
    await page.evaluate(() => { const m = document.querySelector('.mini'); if (m) m.remove(); });
    await page.waitForTimeout(150);
    record('minigame ' + t, open && errs.length === before, open ? errs.slice(before).join(' | ') : 'khung minigame không mở');
  }
  await ctx.close();
}

// ---------------------------------------------------------------- 4. mọi ca làm việc có minigame
if (want('jobtasks')) {
  console.log('[jobtasks] mỗi ca làm việc: mở, lên kế hoạch minigame, chọn xử lý được');
  const { page, ctx, errs } = await openPage();
  const list = await page.evaluate(() => { const J = KN.JOB_TASKS, out = []; Object.keys(J).forEach((cid) => J[cid].tasks.forEach((t, ti) => { out.push([cid, ti, t.c.some((x) => x[3])]); })); return out; });
  let bad = 0, done = 0, skipped = 0, i = 0;
  for (const [cid, ti, hasMini] of list) {
    if (QUICK && i++ % 4) continue;
    let ok = false, why = '';
    for (let attempt = 0; attempt < 3 && !ok; attempt++) { // sự kiện ngẫu nhiên có thể chen ngang → thử lại
      const r = await page.evaluate(([cid, ti]) => {
        const G = KN.Game; G.newLife({}); const S = G._state();
        for (let i = 0; i < 26; i++) { S.pending.length = 0; S.stats.health = 95; S.stats.happy = 80; G.ageUp(); }
        S.pending.length = 0; S.job = { id: cid, level: 1, perf: 50, years: 1, since: S.year }; S.flags.lastClub = 'Phố Núi FC'; S.forced.push({ id: 'jt_' + cid + '_' + ti, at: S.year }); G.ageUp();
        const e = S.pending.find((x) => x.id === 'jt_' + cid + '_' + ti); if (!e) return { retry: true };
        const plans = e.choices.map((c) => { const pl = KN.Mini.plan(e, c); return pl ? pl.type : '-'; });
        const k = plans.findIndex((x) => x !== '-'), idx = k >= 0 ? k : 0; const r = G.choose(e.uid, idx, k >= 0 ? { mini: 0.9 } : undefined);
        return { ok: !!(r && r.ok), plans };
      }, [cid, ti]);
      if (r.retry) { why = 'sự kiện không xuất hiện'; continue; }
      ok = r.ok; why = r.ok ? '' : 'chọn xử lý thất bại';
    }
    if (why === 'sự kiện không xuất hiện') { skipped++; continue; }
    done++; if (!ok) { bad++; record(`ca ${cid}#${ti}`, false, why); }
  }
  record(`ca làm việc: ${done} ca chạy, ${skipped} bỏ qua (sự kiện ngẫu nhiên chen ngang), ${bad} lỗi`, bad === 0 && errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}

// ---------------------------------------------------------------- 4b. cửa hàng: mua đủ mọi món, lên tuổi không NaN
if (want('shop')) {
  console.log('[shop] mua mọi món trong cửa hàng, sống thêm vài năm, bán lại');
  const { page, ctx, errs } = await openPage();
  const r = await page.evaluate(() => {
    const G = KN.Game; G.newLife({}); const S = G._state(); const bad = [];
    for (let i = 0; i < 30; i++) { S.pending.length = 0; S.stats.health = 95; S.stats.happy = 80; G.ageUp(); }
    S.pending.length = 0; S.money = 5e12; S.flags.master = S.flags.master || 0;
    const items = G.shopItems(); let bought = 0, once = 0;
    items.forEach((it) => { const x = G.buy(it.id); if (x && x.ok !== false) { bought++; if (it.type === 'once') once++; } else bad.push('mua ' + it.id + ': ' + (x && x.error)); });
    const boost = G.ieltsBoost();
    S.english = 55; const ex = G.doActivity('ielts_exam'); if (!ex || ex.ok === false) bad.push('thi IELTS: ' + (ex && ex.error)); else if (!(S.flags.ieltsBand >= 3)) bad.push('không có band IELTS'); G.ieltsStudy(0.8);
    for (let i = 0; i < 4; i++) { S.pending.length = 0; S.stats.health = Math.max(S.stats.health, 60); G.ageUp(); }
    const nan = ['money', 'happy', 'health', 'smarts', 'looks'].filter((k) => !isFinite(k === 'money' ? S.money : S.stats[k])); if (nan.length) bad.push('NaN: ' + nan.join(','));
    S.assets.slice().forEach((a) => { if (!isFinite(a.value)) bad.push('giá trị NaN: ' + a.name); });
    return { n: items.length, bought, once, boost, bad };
  });
  record(`cửa hàng: ${r.n} món, mua được ${r.bought} (${r.once} dùng một lần), cộng IELTS tối đa ${r.boost}, thi IELTS thật chạy được`, r.bad.length === 0 && r.bought >= r.n - 3 && errs.length === 0, (r.bad.concat(errs)).slice(0, 3).join(' | '));
  await ctx.close();
}

// ---------------------------------------------------------------- 4c. bản tiếng Anh (công tắc EN/VI)
if (want('i18n')) {
  console.log('[i18n] công tắc tiếng Anh: dịch giao diện, mở minigame, đổi lại tiếng Việt');
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 800 } }); await ctx.addInitScript(() => { try { localStorage.setItem('kn_lang', 'en'); } catch (e) { /* */ } });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(e.message)); page.on('console', (m) => { if (m.type() === 'error' && !IGNORE.test(m.text())) errs.push('console: ' + m.text().slice(0, 140)); });
  await page.goto(BASE + 'index.html', { waitUntil: 'commit' });
  await page.waitForFunction(() => window.KN && KN.UI && KN.I18n && document.querySelector('.hub-tile'), null, { timeout: 90000 });
  await page.waitForFunction(() => KN.I18n.stats().exact > 1000, null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(800);
  const en = await page.evaluate(() => ({ lang: document.documentElement.lang, tile: document.querySelector('.hub-tile').innerText, miss: KN.I18n.missing().length, stats: KN.I18n.stats() }));
  record(`EN: giao diện chính được dịch (${en.stats.exact} mục từ), còn ${en.miss} chuỗi tiếng Việt ở màn hình chính`, en.lang === 'en' && /Life/.test(en.tile) && en.miss <= 8 && errs.length === 0, errs.slice(0, 2).join(' | ') || en.tile.replace(/\n/g, ' | ').slice(0, 60));
  await page.evaluate(() => { KN.Mini.setEnabled(true); if (KN.World && KN.World.setPaused) KN.World.setPaused(true); KN.Mini.test('ielts_vocab', 0.5, null, {}); });
  await page.waitForTimeout(900);
  const intro = await page.evaluate(() => (document.querySelector('.mini') || { innerText: '' }).innerText);
  record('EN: màn hướng dẫn minigame có chữ tiếng Anh', /IELTS/.test(intro) && /(Goal|goal|How to play)/.test(intro), intro.slice(0, 80).replace(/\n/g, ' | '));
  await page.evaluate(() => { if (KN.Mini.abort) KN.Mini.abort(); const m = document.querySelector('.mini'); if (m) m.remove(); });
  await page.click('#knLang'); await page.waitForTimeout(600);
  const vi = await page.evaluate(() => ({ lang: document.documentElement.lang, tile: document.querySelector('.hub-tile').innerText }));
  record('đổi lại VI: chữ gốc được khôi phục', vi.lang === 'vi' && /Cuộc đời/.test(vi.tile) && errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}

// ---------------------------------------------------------------- 5. save cũ vẫn nạp được
if (want('saves')) {
  console.log('[saves] nạp save của các phiên bản cũ');
  const dir = path.join(here, 'fixtures');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')) : [];
  if (!files.length) record('có save mẫu trong dev/tests/fixtures', false, 'thiếu fixtures');
  for (const f of files) {
    const fx = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const { page, ctx, errs } = await openPage();
    await page.evaluate((fx) => { localStorage.setItem('kn_save_v1', JSON.stringify(fx.save)); if (fx.meta) localStorage.setItem('kn_meta_v1', JSON.stringify(fx.meta)); }, fx);
    const r = await page.evaluate((fx) => {
      const G = KN.Game, ok = G.load(); const S = G._state(); const v = G.view(); let err = null;
      const money0 = S ? S.money : null, age0 = v ? v.age : null;
      try { for (let i = 0; i < 4; i++) { S.pending.length = 0; S.stats.health = 90; G.ageUp(); } } catch (e) { err = String(e); }
      return { ok, age0, money0, ageAfter: G.view().age, err, wantAge: fx.age, saveMoney: fx.save.money };
    }, fx);
    record(`save ${fx.tag}: nạp được, tuổi/tiền giữ nguyên, chơi tiếp 4 năm`, r.ok && r.age0 === r.wantAge && r.money0 === r.saveMoney && !r.err && r.ageAfter >= r.wantAge + 4 && errs.length === 0,
      `tuổi ${r.age0}/${r.wantAge} tiền ${r.money0}/${r.saveMoney} sau=${r.ageAfter} ${r.err || ''} ${errs.slice(0, 2).join('|')}`);
    await ctx.close();
  }
}

// ---------------------------------------------------------------- 6. truy cập trên điện thoại
if (want('a11y')) {
  console.log('[a11y] khung điện thoại 390px');
  const { page, ctx, errs } = await openPage({ viewport: { width: 390, height: 800 }, mobile: true });
  const scan = () => page.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    const out = { noName: [], small: [], canvasNoLabel: 0, hOverflow: document.documentElement.scrollWidth > innerWidth + 2 };
    document.querySelectorAll('button, [role=button], a, select').forEach((e) => { if (!vis(e)) return; const nm = (e.getAttribute('aria-label') || e.textContent || e.title || '').trim(); if (!nm) out.noName.push(e.className || e.tagName); const r = e.getBoundingClientRect(); if (r.width < 40 || r.height < 36) out.small.push((e.className || e.tagName) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); });
    document.querySelectorAll('canvas').forEach((c) => { if (vis(c) && !c.getAttribute('aria-label') && !c.getAttribute('role')) out.canvasNoLabel++; });
    return out;
  });
  const views = { 'màn hình chính': async () => {}, 'màn Minigame': async () => { await page.evaluate(() => KN.Arcade.open()); await page.waitForTimeout(400); }, 'một minigame': async () => { await page.evaluate(() => { KN.UI.closeModal(); window.__r = KN.Mini.test('sprint', 0.5); }); await page.waitForTimeout(1200); } };
  for (const [name, go] of Object.entries(views)) {
    await go(); const r = await scan();
    record('a11y ' + name, r.noName.length === 0 && r.small.length === 0 && r.canvasNoLabel === 0 && !r.hOverflow, JSON.stringify(r).slice(0, 200));
  }
  record('không lỗi JS khi quét', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}

await browser.close(); server.close();
const bad = results.filter((r) => !r.ok);
console.log(`\nTổng: ${results.length - bad.length}/${results.length} đạt` + (bad.length ? `, ${bad.length} lỗi:` : '. ✔'));
bad.forEach((r) => console.log('  ✗ ' + r.name + (r.detail ? ' — ' + r.detail : '')));
process.exit(bad.length ? 1 : 0);

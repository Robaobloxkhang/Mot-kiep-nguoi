/* Một Kiếp Người — 📒 SỔ MINIGAME (KN.MiniMeta)
   Ghi nhận mọi lượt chơi minigame (trong cuộc đời lẫn chơi thử): kỷ lục, chuỗi thắng, thành tựu minigame, thử thách hằng ngày.
   - Lưu trên máy ở khóa 'kn_mini_meta' (không đụng vào định dạng save game). Khóa cũ 'kn_arcade_best' được đọc làm kỷ lục khởi điểm.
   - Mỗi lượt chơi chỉ được ghi MỘT lần (cờ p._rec). Thách đấu 1-1 (mode 'duel') không tính thành tựu.
   - Phần thưởng tiền được cộng vào cuộc đời đang sống qua KN.Game.onlineMoney (có log + lưu game), mỗi thành tựu/ngày chỉ nhận một lần. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const KEY = 'kn_mini_meta';
  const get = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); if (v && typeof v === 'object') return Object.assign({ stats: {}, ach: {}, daily: {}, dailyDone: 0, fav: {}, streak: 0, bestStreak: 0, lifeWins: 0 }, v); } catch (e) { /* */ } return { stats: {}, ach: {}, daily: {}, dailyDone: 0, fav: {}, streak: 0, bestStreak: 0, lifeWins: 0 }; };
  const put = (m) => { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) { /* */ } };
  const legacy = () => { try { return JSON.parse(localStorage.getItem('kn_arcade_best') || '{}') || {}; } catch (e) { return {}; } };
  const SPORT = ['penalty', 'keeper', 'hoops', 'sprint', 'swim', 'hax', 'race'], BRAIN = ['quiz', 'millionaire', 'detective', 'interview', 'pitch', 'stock', 'cards', 'aim', 'clutch'];
  // thời lượng ước tính (giây) — hiện trên thẻ minigame
  const DUR = { penalty: 50, keeper: 50, hoops: 55, sprint: 35, swim: 45, chase: 45, drive: 40, fight: 45, sneak: 60, ride: 60, quiz: 50, millionaire: 120, detective: 90, interview: 50, pitch: 90, stock: 35, cards: 90, cook: 50, haggle: 60, love: 45, cpr: 60, surgery: 60, fishing: 60, sing: 35, aim: 30, clutch: 60, hax: 70, race: 90 };
  const NEWV = ['penalty', 'keeper', 'hoops', 'sprint', 'swim', 'chase', 'drive', 'fight', 'sneak', 'ride', 'quiz', 'millionaire', 'detective', 'interview', 'pitch', 'stock', 'cards', 'cook', 'haggle', 'love', 'cpr', 'surgery', 'fishing', 'sing', 'aim', 'clutch'];
  const ACH = [
    { id: 'first', icon: '🎮', name: 'Tay mơ', desc: 'Chơi minigame đầu tiên.', money: 5e5, test: (m, c) => c.plays >= 1 },
    { id: 'win10', icon: '🏆', name: 'Thắng quen tay', desc: 'Đạt yêu cầu ở tổng cộng 10 lượt chơi.', money: 1e6, test: (m, c) => c.wins >= 10 },
    { id: 'perfect', icon: '💯', name: 'Hoàn hảo', desc: 'Đạt 100% điểm ở một minigame bất kỳ.', money: 2e6, test: (m, c) => c.perfect },
    { id: 'explorer8', icon: '🧭', name: 'Thích khám phá', desc: 'Thử 8 minigame khác nhau.', money: 1.5e6, test: (m, c) => c.types >= 8 },
    { id: 'explorer20', icon: '🌏', name: 'Bách nghệ', desc: 'Thử 20 minigame khác nhau.', money: 5e6, test: (m, c) => c.types >= 20 },
    { id: 'streak5', icon: '🔥', name: 'Chuỗi thắng 5', desc: 'Thắng liên tiếp 5 lượt (không tính thách đấu).', money: 3e6, test: (m) => m.bestStreak >= 5 },
    { id: 'hard', icon: '😤', name: 'Dân chơi hệ khó', desc: 'Đạt yêu cầu ở độ khó Khó.', money: 3e6, test: (m, c) => c.hardWin },
    { id: 'athlete', icon: '🏅', name: 'Vận động viên', desc: 'Đạt yêu cầu ở 4 môn thể thao khác nhau.', money: 3e6, test: (m, c) => SPORT.filter((t) => (m.stats[t] || {}).wins).length >= 4 },
    { id: 'brainy', icon: '🧠', name: 'Cao thủ trí tuệ', desc: 'Đạt yêu cầu ở 4 trò trí tuệ khác nhau.', money: 3e6, test: (m, c) => BRAIN.filter((t) => (m.stats[t] || {}).wins).length >= 4 },
    { id: 'lifewin', icon: '🌱', name: 'Cuộc đời là sân chơi', desc: 'Vượt qua 5 minigame trong các sự kiện của cuộc đời.', money: 2e6, test: (m) => m.lifeWins >= 5 },
    { id: 'daily3', icon: '📅', name: 'Siêng năng', desc: 'Hoàn thành 3 thử thách hằng ngày.', money: 2e6, test: (m) => m.dailyDone >= 3 },
  ];
  const ageK = () => { try { const c = KN.Game && KN.Game.miniContext && KN.Game.miniContext(); return c ? (c.age < 12 ? 0.2 : c.age < 18 ? 0.5 : 1) : 1; } catch (e) { return 1; } };
  const lifeOn = () => { try { return !!(KN.Game && KN.Game.hasLife && KN.Game.hasLife() && !KN.Game.isDead()); } catch (e) { return false; } };
  const money = (v) => Math.round(v * ageK() / 1e4) * 1e4;
  const fmt = (v) => (v >= 1e6 ? (v / 1e6).toFixed(v % 1e6 ? 2 : 0).replace(/\.?0+$/, '') + ' triệu' : Math.round(v / 1e3) + 'k');
  // ---------------------------------------------------------------- thử thách hằng ngày (giờ máy, cố định theo ngày)
  const dayKey = (d) => { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const POOL = ['penalty', 'keeper', 'hoops', 'sprint', 'swim', 'chase', 'drive', 'fight', 'sneak', 'ride', 'quiz', 'millionaire', 'detective', 'interview', 'pitch', 'stock', 'cards', 'cook', 'haggle', 'love', 'cpr', 'surgery', 'fishing', 'sing', 'aim', 'clutch'];
  function daily(d) {
    const k = dayKey(d), h = hash('kn-mini-' + k), types = POOL.filter((t) => !KN.Mini || (KN.Mini.NAME || {})[t]);
    const type = types[h % types.length], target = [50, 60, 70][(h >> 8) % 3];
    return { key: k, type, target, reward: money(2e6) };
  }
  // ---------------------------------------------------------------- ghi nhận một lượt chơi
  function record(p, score, ok) {
    if (!p || p._rec) return null; p._rec = true;
    const m = get(), t = p.type, pct = Math.round(Math.max(0, Math.min(1, score)) * 100), duel = p.mode === 'duel';
    const s = m.stats[t] || (m.stats[t] = { plays: 0, wins: 0, best: Math.max(0, +legacy()[t] || 0), bestStreak: 0, streak: 0, sum: 0, last: 0 });
    const prev = s.best, plays0 = s.plays;
    s.plays++; s.sum += pct; s.last = Date.now(); s.avg = Math.round(s.sum / s.plays);
    if (ok) { s.wins++; s.streak++; s.bestStreak = Math.max(s.bestStreak, s.streak); } else s.streak = 0;
    const isBest = pct > prev; if (isBest) s.best = pct;
    const life = p.mode === 'event' && p.title !== 'Chơi thử' && !p.practice;
    if (!duel) {
      if (ok) { m.streak++; m.bestStreak = Math.max(m.bestStreak, m.streak); if (life) m.lifeWins++; } else m.streak = 0;
    }
    // thử thách hằng ngày
    const dc = daily(); let dailyDoneNow = false;
    if (p.daily && p.daily === dc.key && p.type === dc.type && pct >= dc.target && !(m.daily[dc.key] || {}).done) { m.daily[dc.key] = Object.assign(m.daily[dc.key] || {}, { done: true, pct }); m.dailyDone++; dailyDoneNow = true; }
    // thành tựu
    const types = Object.keys(m.stats).filter((x) => m.stats[x].plays > 0).length, tot = Object.values(m.stats).reduce((a, x) => ({ plays: a.plays + x.plays, wins: a.wins + x.wins }), { plays: 0, wins: 0 });
    const ctx = { plays: tot.plays, wins: tot.wins, types, perfect: !duel && pct >= 100 || Object.values(m.stats).some((x) => x.best >= 100), hardWin: !duel && ok && (p.need || 0) >= 0.7 || !!m.hardWin };
    if (ctx.hardWin) m.hardWin = true;
    const fresh = [];
    ACH.forEach((a) => { if (!m.ach[a.id] && a.test(m, ctx)) { m.ach[a.id] = { at: Date.now(), claimed: false }; fresh.push(a); } });
    put(m);
    return { pct, prev, best: s.best, isBest: isBest && plays0 > 0, firstTime: plays0 === 0, plays: s.plays, streak: s.streak, avg: s.avg, fresh, dailyDoneNow, daily: dc };
  }
  // ---------------------------------------------------------------- nhận thưởng thật (cộng vào cuộc đời đang sống, một lần)
  function claim(id) {
    const m = get();
    if (!lifeOn()) return { ok: false, text: 'Cần đang sống một cuộc đời để nhận thưởng.' };
    if (id === 'daily') {
      const dc = daily(), d = m.daily[dc.key];
      if (!d || !d.done) return { ok: false, text: 'Chưa hoàn thành thử thách hôm nay.' };
      if (d.claimed) return { ok: false, text: 'Hôm nay bạn đã nhận thưởng rồi.' };
      d.claimed = true; put(m);
      KN.Game.onlineMoney(dc.reward, 'Hoàn thành thử thách minigame hằng ngày, nhận thưởng ' + fmt(dc.reward) + '.', '🎯');
      return { ok: true, text: '+' + fmt(dc.reward) };
    }
    const a = ACH.find((x) => x.id === id), st = m.ach[id];
    if (!a || !st) return { ok: false, text: 'Chưa mở khóa thành tựu này.' };
    if (st.claimed) return { ok: false, text: 'Đã nhận thưởng rồi.' };
    st.claimed = true; put(m); const v = money(a.money);
    KN.Game.onlineMoney(v, 'Thành tựu minigame “' + a.name + '”: thưởng ' + fmt(v) + '.', a.icon);
    return { ok: true, text: '+' + fmt(v) };
  }
  KN.MiniMeta = {
    record, claim, daily, get, put, ACH, DUR, NEWV, SPORT, BRAIN, fmt, lifeOn, rewardOf: (a) => money(a.money),
    stat: (t) => { const m = get(), s = m.stats[t]; return s ? Object.assign({}, s) : { plays: 0, wins: 0, best: Math.max(0, +legacy()[t] || 0), avg: 0 }; },
    toggleFav: (t) => { const m = get(); m.fav[t] = !m.fav[t]; put(m); return !!m.fav[t]; },
  };
})();

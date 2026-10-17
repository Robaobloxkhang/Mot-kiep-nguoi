/* dev helper: mô phỏng đời con nhà giàu. __sim({ money, co, years, nojob, life, pick }) → quỹ đạo tiền (tỷ) + biến cố đã gặp */
(function () {
  for (let i = 0; i < 5000; i++) clearInterval(i);
  window.__sim = async (o) => {
    const G = KN.Game; G.setMode && G.setMode('offline');
    G.newLife({ gender: 'm', firstName: 'Test', lastName: 'Nguyễn', city: 'hcm' });
    let S = G._state(); S.player.age = 60; S.money = o.money;
    if (o.co) S.company = { name: 'Tập đoàn Test', ind: 'phanmem', val: o.co, own: 0.8, lv: 4, staff: 500, bad: 0 };
    const kid = (id, g, a) => ({ id, role: 'child', firstName: id, middleName: '', lastName: 'Nguyễn', gender: g, age: a, alive: true, relation: 80, appearance: KN.DATA.randomAppearance(g, a), kind: 'human' });
    S.people.push(kid('kid1', 'm', o.age || 25), kid('kid2', 'f', 22));
    S.dead = { cause: 'test', age: 60 }; G.continueAs('kid1'); S = G._state();
    if (o.life) S.lifestyle = o.life; if (o.nojob) S.job = null; if (o.followers) S.social = Object.assign(S.social || { feed: [], offers: [], posts: 0, scandals: 0 }, { followers: o.followers });
    const traj = [Math.round(S.money / 1e9)], evs = {};
    for (let y = 0; y < o.years; y++) {
      let guard = 0;
      while (G.pending().length && guard++ < 10) {
        const p = G.pending()[0]; evs[p.id] = (evs[p.id] || 0) + 1; const n = (p.choices || []).length || 1;
        try { await G.choose(p.uid, o.pick != null ? Math.min(o.pick, n - 1) : Math.floor(Math.random() * n)); } catch (e) { S.pending.shift(); }
      }
      if (G.isDead()) break;
      try { await G.ageUp(); } catch (e) { traj.push('err ' + e.message); break; }
      S = G._state(); traj.push(Math.round(S.money / 1e9) + (S.company ? '+' + Math.round(S.company.val * S.company.own / 1e9) + 'c' : ''));
    }
    return [traj.join(' '), Object.entries(evs).filter(([k]) => /ms_(cauam|tranh|batcoc|vay|tuthien|luadao|thue|papa|fan|boc|xinchup|company|co_)/.test(k)).map((e) => e.join(':')).join(', ')];
  };
})();

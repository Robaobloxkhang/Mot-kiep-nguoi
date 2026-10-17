/* dev helper: chụp cận nhân vật khi pane bị ẩn. Dùng: await import('/dev/shot.js') rồi __solo({...}) */
(function () {
  for (let i = 0; i < 5000; i++) clearInterval(i);
  const ts = document.getElementById('titleScreen'); if (ts) ts.style.display = 'none';
  document.querySelectorAll('#toasts,.coach,#panel').forEach((e) => (e.style.display = 'none'));
  const D = KN.DATA;
  window.__solo = async (o) => {
    o = o || {};
    const app = Object.assign(D.randomAppearance(o.g || 'f', o.age || 22), o.app || {});
    const sc = { loc: o.loc || 'park', time: o.time || 'day', weather: 'clear', player: { id: 'player', name: 'A' + Math.random(), appearance: app, age: o.age || 22, gender: o.g || 'f', anim: o.anim || 'idle', expr: o.expr || null }, npcs: o.npcs || [], shot: 'close' };
    KN.World.playScene(sc);
    for (let i = 0; i < 25; i++) { KN.World.advance(0.2); await new Promise((r) => setTimeout(r, 30)); }
    const p = KN.World.stageInfo().player, a = p.rotY + (o.yaw || 0), r = o.dist || 3.4;
    KN.World.lookFrom([p.x + Math.sin(a) * r, o.h || 1.1, p.z + Math.cos(a) * r], [p.x, o.ty || 0.85, p.z]);
    KN.World.advance(2); KN.World.advance(0.05);
    return app;
  };
})();

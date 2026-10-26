[
  [/^Khu chơi minigame: (.+?)\. Xem hướng dẫn phím bên dưới\.$/, (m, n) => 'Minigame area: ' + KN.I18n.t(n) + '. See the key guide below.'],
  [/^Khu chơi minigame: (.+?)\s*·\s*(.+?)\. Xem hướng dẫn phím bên dưới\.$/, (m, n, k) => 'Minigame area: ' + KN.I18n.t(n) + ' · ' + KN.I18n.t(k) + '. See the key guide below.'],
  [/^Thử minigame · (.+)$/, (m, n) => 'Minigame practice · ' + KN.I18n.t(n)],
  [/^Tầng (\d)\/3 · (.+) · (.+)$/, (m, n, a, b) => 'Floor ' + n + '/3 · ' + KN.I18n.t(a) + ' · ' + KN.I18n.t(b)],
  [/^Quái còn (\d+) · đợt (\d+)\/(\d+)$/, 'Monsters left $1 · wave $2/$3'],
  [/^Bạn (-?\d+)\/(\d+)$/, 'You $1/$2'],
  [/^Tầng (\d) — (.+)$/, (m, n, a) => 'Floor ' + n + ' — ' + KN.I18n.t(a)],
  [/^Đợt (\d+)$/, 'Wave $1']
]

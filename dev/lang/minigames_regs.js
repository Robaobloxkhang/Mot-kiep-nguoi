[
  [/^Khu chơi minigame: (.+?)\. Xem hướng dẫn phím bên dưới\.$/, (m, n) => 'Minigame area: ' + KN.I18n.t(n) + '. See the key guide below.'],
  [/^Khu chơi minigame: (.+?)\s*·\s*(.+?)\. Xem hướng dẫn phím bên dưới\.$/, (m, n, k) => 'Minigame area: ' + KN.I18n.t(n) + ' · ' + KN.I18n.t(k) + '. See the key guide below.'],
  [/^Thử minigame · (.+)$/, (m, n) => 'Minigame practice · ' + KN.I18n.t(n)]
]

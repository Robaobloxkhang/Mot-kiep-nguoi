[
  [/^Tuổi (\d+)$/, 'Age $1'],
  [/^Bạn (\d+) tuổi$/, 'You are $1 years old'],
  [/^(.+) · (\d+) tuổi$/, (m, a, n) => a + ' · age ' + n],
  [/^Đề hôm nay: (.+)$/, (m, a) => "Today's challenge: " + a],
  [/^Kiếp (\d+)$/, 'Life $1'],
  [/^Còn (\d+) điểm$/, '$1 points left'],
  [/^📰 Thị trường việc làm: (.+)$/, (m, rest) => '📰 Job market: ' + rest.replace(/đang khát nhân lực/g, 'hiring boom in').replace(/sa thải hàng loạt ở/g, 'mass layoffs in').replace(/[^,;]*?(\p{Extended_Pictographic}\uFE0F?)\s*[^,;]+/gu, (x) => x).replace(/(\p{Extended_Pictographic}\uFE0F?\s*[^,;]+)/gu, (x) => KN.I18n.t(x.trim()))],
  [/^Bạn kết thân với (.+)\.$/, 'You become close friends with $1.'],
  [/^Bạn có thêm một em (trai|gái): bé (.+)!$/, (m, g, n) => 'You have a new ' + (g === 'trai' ? 'little brother' : 'little sister') + ': ' + n + '!'],
  [/^Chào bạn, mình là (.+)!$/, 'Hi, I\'m $1!'],
  [/^Bạn chào đời tại (.+)\. Bố (.+), mẹ (.+)\.$/, (m, c, f, mo) => 'You are born in ' + KN.I18n.t(c) + '. Father ' + f + ', mother ' + mo + '.']
]

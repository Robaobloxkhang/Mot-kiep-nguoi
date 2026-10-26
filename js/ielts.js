/* Một Kiếp Người — luyện IELTS (đăng ký vào KN.Mini):
   📖 'ielts_vocab'   — từ vựng: nghĩa, từ cần điền, xen kẽ từ cần ôn trong sổ từ vựng (Leitner)
   📰 'ielts_read'    — đọc hiểu ngắn: True / False / Not Given và trắc nghiệm
   ✏️ 'ielts_grammar' — chọn câu đúng ngữ pháp
   🎧 'ielts_listen'  — nghe (giọng đọc của trình duyệt), trả lời 3 câu
   🗣️ 'ielts_speak'  — nói (nhận diện giọng nếu trình duyệt hỗ trợ, nếu không thì gõ câu trả lời; chấm thô)
   Điểm 0..1 được quy ra band ước tính. Nội dung do game soạn, không phải đề thi thật và không thay cho luyện đề chính thức. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sfx = (n) => { try { KN.Audio && KN.Audio.sfx(n); } catch (e) { /* */ } };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lsGet = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* */ } };

  // ---------------------------------------------------------------- khung chung
  let root = null, keyH = null, timers = [], speechOn = false;
  function open(html) {
    close();
    root = document.createElement('div'); root.className = 'mini'; root.innerHTML = '<div class="mini-box sb-box ie-box">' + html + '</div>';
    document.body.appendChild(root);
    if (KN.Mini && KN.Mini.playing && KN.Mini.playing()) { const qb = document.createElement('button'); qb.type = 'button'; qb.className = 'mini-quit'; qb.textContent = '✖ Thoát'; qb.title = 'Bỏ dở minigame'; qb.onclick = () => { if (KN.Mini.abort) KN.Mini.abort(); }; root.appendChild(qb); }
    return root;
  }
  function close() {
    timers.forEach((t) => { clearInterval(t); clearTimeout(t); }); timers = [];
    if (keyH) { window.removeEventListener('keydown', keyH, true); keyH = null; }
    stopSpeak(); stopListen();
    if (root) { root.remove(); root = null; }
  }
  const every = (fn, ms) => { const t = setInterval(fn, ms); timers.push(t); return t; };
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  function onKeys(fn) { if (keyH) window.removeEventListener('keydown', keyH, true); keyH = (e) => { if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return; if (fn(e) !== false) { e.preventDefault(); e.stopPropagation(); } }; window.addEventListener('keydown', keyH, true); }

  // ---------------------------------------------------------------- giọng đọc & nhận diện giọng (nếu trình duyệt có)
  const synth = () => (typeof window !== 'undefined' && window.speechSynthesis && window.SpeechSynthesisUtterance ? window.speechSynthesis : null);
  const SR = () => window.SpeechRecognition || window.webkitSpeechRecognition || null;
  let recog = null;
  function speak(text, opts) {
    const s = synth(); if (!s) return false;
    try {
      s.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'en-GB'; u.rate = (opts && opts.rate) || 0.92;
      const v = (s.getVoices() || []).find((x) => /^en[-_]GB/i.test(x.lang)) || (s.getVoices() || []).find((x) => /^en/i.test(x.lang)); if (v) u.voice = v;
      u.onend = u.onerror = () => { speechOn = false; if (opts && opts.done) opts.done(); }; speechOn = true; s.speak(u); return true;
    } catch (e) { return false; }
  }
  function stopSpeak() { try { const s = synth(); if (s) s.cancel(); } catch (e) { /* */ } speechOn = false; }
  function stopListen() { try { if (recog) { recog.onend = null; recog.stop(); } } catch (e) { /* */ } recog = null; }
  const band = (score) => clamp(Math.round((3.5 + clamp(score, 0, 1) * 5) * 2) / 2, 3.5, 8.5);
  const bandText = (score) => 'Ước tính Band ' + band(score).toFixed(1);

  // ---------------------------------------------------------------- kho từ vựng [từ, loại, nghĩa, ví dụ, chủ đề, band]
  const VOCAB = [
    ['significant', 'adj', 'đáng kể, quan trọng', 'There has been a significant increase in online learning.', 'general', 5.5],
    ['maintain', 'v', 'duy trì, giữ', 'It is important to maintain a balanced diet.', 'health', 5.5],
    ['achieve', 'v', 'đạt được', 'She worked hard to achieve her goal.', 'education', 5.5],
    ['challenge', 'n', 'thử thách', 'Learning a language is a real challenge.', 'education', 5.5],
    ['benefit', 'n', 'lợi ích', 'Regular exercise has many health benefits.', 'health', 5.5],
    ['environment', 'n', 'môi trường', 'We must protect the environment for future generations.', 'environment', 5.5],
    ['pollution', 'n', 'ô nhiễm', 'Air pollution is a serious problem in big cities.', 'environment', 5.5],
    ['transport', 'n', 'giao thông, vận tải', 'Public transport can reduce traffic jams.', 'city', 5.5],
    ['crowded', 'adj', 'đông đúc', 'The market is crowded on weekends.', 'city', 5.5],
    ['expensive', 'adj', 'đắt đỏ', 'Housing is very expensive in the city centre.', 'city', 5.5],
    ['salary', 'n', 'tiền lương', 'He receives a high salary at his new job.', 'work', 5.5],
    ['experience', 'n', 'kinh nghiệm', 'Employers prefer candidates with work experience.', 'work', 5.5],
    ['colleague', 'n', 'đồng nghiệp', 'My colleagues are friendly and helpful.', 'work', 5.5],
    ['deadline', 'n', 'hạn chót', 'We must finish the report before the deadline.', 'work', 5.5],
    ['journey', 'n', 'chuyến đi', 'The journey to the coast took three hours.', 'travel', 5.5],
    ['accommodation', 'n', 'chỗ ở', 'Hotels offer comfortable accommodation for tourists.', 'travel', 5.5],
    ['delay', 'n', 'sự chậm trễ', 'There was a long delay at the airport.', 'travel', 5.5],
    ['recipe', 'n', 'công thức nấu ăn', 'This recipe needs only five ingredients.', 'food', 5.5],
    ['ingredient', 'n', 'nguyên liệu', 'Fresh ingredients make the dish taste better.', 'food', 5.5],
    ['nutritious', 'adj', 'bổ dưỡng', 'Vegetables are nutritious and low in fat.', 'food', 6.0],
    ['obesity', 'n', 'bệnh béo phì', 'Obesity is linked to a lack of exercise.', 'health', 6.0],
    ['mental health', 'n', 'sức khỏe tinh thần', 'Schools should pay more attention to mental health.', 'health', 6.0],
    ['sedentary', 'adj', 'ít vận động', 'A sedentary lifestyle can lead to health problems.', 'health', 7.0],
    ['curriculum', 'n', 'chương trình học', 'The school has updated its curriculum.', 'education', 6.0],
    ['scholarship', 'n', 'học bổng', 'He won a scholarship to study abroad.', 'education', 6.0],
    ['compulsory', 'adj', 'bắt buộc', 'Education is compulsory until the age of sixteen.', 'education', 6.0],
    ['literacy', 'n', 'khả năng đọc viết', 'Adult literacy has improved over the last decade.', 'education', 6.5],
    ['pursue', 'v', 'theo đuổi', 'Many students pursue a degree in engineering.', 'education', 6.0],
    ['enhance', 'v', 'nâng cao', 'Reading widely can enhance your vocabulary.', 'education', 6.5],
    ['sustainable', 'adj', 'bền vững', 'Solar power is a sustainable source of energy.', 'environment', 6.5],
    ['deforestation', 'n', 'nạn phá rừng', 'Deforestation destroys the habitat of many animals.', 'environment', 7.0],
    ['greenhouse gas', 'n', 'khí nhà kính', 'Cars produce greenhouse gases that warm the planet.', 'environment', 6.5],
    ['renewable', 'adj', 'có thể tái tạo', 'Wind is a renewable source of energy.', 'environment', 6.5],
    ['biodiversity', 'n', 'đa dạng sinh học', 'Coral reefs support rich biodiversity.', 'environment', 7.0],
    ['conserve', 'v', 'bảo tồn, tiết kiệm', 'We should conserve water during dry seasons.', 'environment', 6.5],
    ['urbanisation', 'n', 'đô thị hóa', 'Rapid urbanisation has put pressure on housing.', 'city', 7.0],
    ['infrastructure', 'n', 'cơ sở hạ tầng', 'Better infrastructure attracts foreign investment.', 'city', 7.0],
    ['commute', 'v', 'đi làm hằng ngày (đường xa)', 'Many people commute an hour to work.', 'city', 6.0],
    ['congestion', 'n', 'sự tắc nghẽn', 'Traffic congestion wastes time and fuel.', 'city', 6.5],
    ['residential', 'adj', 'thuộc khu dân cư', 'The council plans a new residential area.', 'city', 6.5],
    ['affordable', 'adj', 'giá phải chăng', 'Affordable housing is a priority for the government.', 'city', 6.0],
    ['workforce', 'n', 'lực lượng lao động', 'The workforce is becoming more diverse.', 'work', 6.5],
    ['unemployment', 'n', 'tình trạng thất nghiệp', 'Unemployment rose during the recession.', 'work', 6.5],
    ['promotion', 'n', 'sự thăng chức', 'She received a promotion after two years.', 'work', 6.0],
    ['flexible', 'adj', 'linh hoạt', 'Flexible working hours help parents.', 'work', 6.0],
    ['burnout', 'n', 'kiệt sức vì công việc', 'Long hours can lead to burnout.', 'work', 7.0],
    ['negotiate', 'v', 'thương lượng', 'He negotiated a better salary.', 'work', 6.5],
    ['technology', 'n', 'công nghệ', 'Technology has changed the way we communicate.', 'technology', 5.5],
    ['innovation', 'n', 'sự đổi mới', 'Innovation drives economic growth.', 'technology', 6.5],
    ['artificial intelligence', 'n', 'trí tuệ nhân tạo', 'Artificial intelligence is used in many industries.', 'technology', 6.5],
    ['addiction', 'n', 'sự nghiện', 'Smartphone addiction affects sleep quality.', 'technology', 6.5],
    ['privacy', 'n', 'quyền riêng tư', 'Online privacy is a growing concern.', 'technology', 6.5],
    ['obsolete', 'adj', 'lỗi thời', 'Typewriters became obsolete after computers appeared.', 'technology', 7.0],
    ['digital', 'adj', 'kỹ thuật số', 'Digital skills are essential in modern jobs.', 'technology', 5.5],
    ['cultural heritage', 'n', 'di sản văn hóa', 'Museums help preserve cultural heritage.', 'culture', 7.0],
    ['tradition', 'n', 'truyền thống', 'Tet is the most important tradition in Vietnam.', 'culture', 5.5],
    ['custom', 'n', 'phong tục', 'It is a local custom to remove shoes indoors.', 'culture', 6.0],
    ['diverse', 'adj', 'đa dạng', 'London is a diverse and multicultural city.', 'culture', 6.0],
    ['preserve', 'v', 'gìn giữ', 'We should preserve old buildings.', 'culture', 6.0],
    ['globalisation', 'n', 'toàn cầu hóa', 'Globalisation has linked economies around the world.', 'culture', 7.0],
    ['tourism', 'n', 'ngành du lịch', 'Tourism is an important source of income.', 'travel', 5.5],
    ['destination', 'n', 'điểm đến', 'Da Nang is a popular holiday destination.', 'travel', 5.5],
    ['sightseeing', 'n', 'tham quan', 'We spent the day sightseeing in Hue.', 'travel', 5.5],
    ['itinerary', 'n', 'lịch trình', 'The tour guide gave us the itinerary.', 'travel', 6.5],
    ['eco-friendly', 'adj', 'thân thiện môi trường', 'Many hotels now offer eco-friendly services.', 'travel', 6.5],
    ['stressful', 'adj', 'căng thẳng', 'Exams can be very stressful for students.', 'health', 5.5],
    ['prevent', 'v', 'ngăn ngừa', 'Vaccines prevent serious diseases.', 'health', 6.0],
    ['immune system', 'n', 'hệ miễn dịch', 'Sleep strengthens the immune system.', 'health', 6.5],
    ['balanced diet', 'n', 'chế độ ăn cân bằng', 'A balanced diet includes fruit, vegetables and protein.', 'health', 6.0],
    ['life expectancy', 'n', 'tuổi thọ trung bình', 'Life expectancy has risen in recent decades.', 'health', 7.0],
    ['wealthy', 'adj', 'giàu có', 'Wealthy families can afford private schools.', 'society', 6.0],
    ['poverty', 'n', 'sự nghèo đói', 'Education can help people escape poverty.', 'society', 6.0],
    ['inequality', 'n', 'sự bất bình đẳng', 'Income inequality has widened in many countries.', 'society', 7.0],
    ['elderly', 'adj', 'cao tuổi', 'The elderly need more support from their families.', 'society', 6.0],
    ['generation gap', 'n', 'khoảng cách thế hệ', 'The generation gap can cause arguments at home.', 'society', 7.0],
    ['volunteer', 'n', 'tình nguyện viên', 'Volunteers cleaned the beach last Sunday.', 'society', 5.5],
    ['crime', 'n', 'tội phạm', 'Crime rates are lower in safer neighbourhoods.', 'society', 5.5],
    ['punishment', 'n', 'hình phạt', 'Some argue that harsh punishment reduces crime.', 'society', 6.0],
    ['consume', 'v', 'tiêu thụ', 'Developed countries consume more energy.', 'economy', 6.0],
    ['inflation', 'n', 'lạm phát', 'High inflation reduces the value of savings.', 'economy', 7.0],
    ['invest', 'v', 'đầu tư', 'Companies invest in new technology to stay competitive.', 'economy', 6.0],
    ['export', 'v', 'xuất khẩu', 'Vietnam exports rice and coffee.', 'economy', 6.0],
    ['income', 'n', 'thu nhập', 'Average income has grown steadily.', 'economy', 5.5],
    ['budget', 'n', 'ngân sách', 'The family keeps a strict monthly budget.', 'economy', 5.5],
    ['predict', 'v', 'dự đoán', 'Scientists predict that temperatures will rise.', 'general', 6.0],
    ['alternative', 'n', 'phương án thay thế', 'Cycling is a cheap alternative to driving.', 'general', 6.0],
    ['issue', 'n', 'vấn đề', 'Climate change is a global issue.', 'general', 5.5],
    ['approach', 'n', 'cách tiếp cận', 'A new approach to teaching has been introduced.', 'general', 6.0],
    ['consequence', 'n', 'hậu quả', 'Ignoring the rules had serious consequences.', 'general', 6.5],
    ['contribute', 'v', 'đóng góp', 'Everyone should contribute to the community.', 'general', 6.0],
    ['restrict', 'v', 'hạn chế', 'The law restricts the use of plastic bags.', 'general', 6.5],
    ['assume', 'v', 'cho rằng, giả định', 'Many people assume that older workers cannot learn new skills.', 'general', 6.5],
    ['overcome', 'v', 'vượt qua', 'He overcame his fear of public speaking.', 'general', 6.0],
    ['reluctant', 'adj', 'miễn cưỡng', 'She was reluctant to change jobs.', 'general', 6.5],
    ['crucial', 'adj', 'then chốt', 'Sleep is crucial for concentration.', 'general', 6.5],
    ['inevitable', 'adj', 'không thể tránh khỏi', 'Some change is inevitable in any career.', 'general', 7.0],
    ['detrimental', 'adj', 'có hại', 'Too much sugar is detrimental to health.', 'general', 7.5],
    ['widespread', 'adj', 'phổ biến rộng rãi', 'Smartphones are now widespread among teenagers.', 'general', 6.5],
    ['mitigate', 'v', 'giảm nhẹ', 'Planting trees can mitigate the effects of climate change.', 'general', 7.5],
    ['undermine', 'v', 'làm suy yếu', 'Constant criticism can undermine confidence.', 'general', 7.5],
    ['alleviate', 'v', 'làm dịu bớt', 'Public libraries alleviate the cost of books.', 'general', 7.5],
    ['exacerbate', 'v', 'làm trầm trọng thêm', 'Heavy traffic exacerbates air pollution.', 'general', 8.0],
    ['ubiquitous', 'adj', 'có mặt khắp nơi', 'Mobile phones are ubiquitous in modern life.', 'general', 8.0],
    ['paradigm', 'n', 'mô hình tư duy', 'Online learning shifted the educational paradigm.', 'general', 8.0],
    ['scrutiny', 'n', 'sự xem xét kỹ lưỡng', 'The new policy came under public scrutiny.', 'general', 8.0],
    ['prevalent', 'adj', 'thịnh hành, phổ biến', 'Obesity is increasingly prevalent among children.', 'general', 7.5],
    ['sufficient', 'adj', 'đủ', 'Is the food supply sufficient for the population?', 'general', 6.0],
    ['reliable', 'adj', 'đáng tin cậy', 'A reliable source should be cited.', 'general', 6.0],
    ['advocate', 'v', 'ủng hộ, chủ trương', 'Doctors advocate a daily walk.', 'general', 7.0],
    ['phenomenon', 'n', 'hiện tượng', 'Remote work is a relatively new phenomenon.', 'general', 7.0],
    ['stimulate', 'v', 'kích thích', 'Games can stimulate creative thinking.', 'general', 7.0],
    ['vulnerable', 'adj', 'dễ bị tổn thương', 'Young children are vulnerable to online risks.', 'general', 7.0],
  ];
  const TOPIC = { general: 'Chung', health: 'Sức khỏe', education: 'Giáo dục', environment: 'Môi trường', city: 'Đô thị', work: 'Công việc', travel: 'Du lịch', food: 'Ẩm thực', technology: 'Công nghệ', culture: 'Văn hóa', society: 'Xã hội', economy: 'Kinh tế' };
  const vByWord = {}; VOCAB.forEach((v) => (vByWord[v[0]] = v));

  // ---------------------------------------------------------------- sổ từ vựng (Leitner): KEY → { từ: { box, due, seen, wrong } }
  const NB = 'kn_vocab', DAY = 864e5, GAP = [0, 1, 3, 7, 16, 35];
  const today = () => Math.floor(Date.now() / DAY);
  const nbGet = () => lsGet(NB, {});
  function nbMark(word, ok) {
    const nb = nbGet(), w = nb[word] || { box: 0, due: 0, seen: 0, wrong: 0 };
    w.seen++; if (ok) w.box = Math.min(5, w.box + 1); else { w.box = 1; w.wrong++; }
    w.due = today() + GAP[w.box]; nb[word] = w; lsSet(NB, nb);
  }
  const dueWords = () => { const nb = nbGet(), t = today(); return Object.keys(nb).filter((k) => vByWord[k] && nb[k].due <= t && nb[k].box < 5); };
  const notebookStats = () => { const nb = nbGet(), ks = Object.keys(nb).filter((k) => vByWord[k]); return { total: ks.length, due: dueWords().length, mastered: ks.filter((k) => nb[k].box >= 4).length }; };

  // trình độ hiện tại (0–100) từ game hoặc mặc định
  function level(p) { let en = 0; try { const s = KN.Game && KN.Game._state && KN.Game._state(); en = s ? (s.english || 0) : 0; } catch (e) { /* */ } const sm = p && p.ctx && p.ctx.stats ? p.ctx.stats.smarts : 60; return clamp(en * 0.8 + sm * 0.3, 0, 100); }
  const maxBand = (lv) => (lv < 25 ? 6.0 : lv < 50 ? 6.5 : lv < 70 ? 7.5 : 8.5);
  const need = (p) => (p && p.need != null ? p.need : 0.5);
  function finish(res, p, score, text, extra) {
    // luyện tập thêm English trong đời (nếu có), mỗi lượt đã chơi hết cộng một chút
    try { if (KN.Game && KN.Game.ieltsStudy && p.mode !== 'duel' && !p.practice) KN.Game.ieltsStudy(score); } catch (e) { /* */ }
    res(Object.assign({ score: clamp(score, 0, 1), text: text + ' ' + bandText(score) + '.' }, extra || {}));
  }

  // ================================================================ 📖 TỪ VỰNG
  function vocab(p) {
    return new Promise((res) => {
      const lv = level(p), mb = maxBand(lv), review = p.review === true;
      const due = shuffle(dueWords().map((k) => vByWord[k]));
      const fresh = shuffle(VOCAB.filter((v) => v[5] <= mb && !due.includes(v)));
      const picks = (review ? due : due.slice(0, 3)).concat(fresh).slice(0, 8);
      while (picks.length < 8) picks.push(pick(VOCAB));
      const qs = picks.map((v, i) => {
        const kind = i % 3; // 0: nghĩa tiếng Việt · 1: từ tiếng Anh · 2: điền từ
        const others = shuffle(VOCAB.filter((x) => x[0] !== v[0])).slice(0, 3);
        if (kind === 0) return { v, head: 'Từ này nghĩa là gì?', big: v[0] + ' (' + v[1] + ')', a: v[2], opts: shuffle([v[2]].concat(others.map((x) => x[2]))) };
        if (kind === 1) return { v, head: 'Từ tiếng Anh nào có nghĩa:', big: v[2], a: v[0], opts: shuffle([v[0]].concat(others.map((x) => x[0]))) };
        const blank = v[3].replace(new RegExp(v[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '_____');
        return { v, head: 'Điền từ còn thiếu:', big: blank === v[3] ? v[3] : blank, a: v[0], opts: shuffle([v[0]].concat(others.map((x) => x[0]))) };
      });
      const box = open('<div class="mini-head"><b>📖 Từ vựng IELTS</b><small id="ieN"></small></div><div class="mini-bar"><i id="ieT"></i></div><div class="mq-card"><small id="ieH"></small><p class="mq-q" id="ieQ"></p></div><div class="mq-opts" id="ieA"></div><p class="mini-keys" id="ieF"></p>');
      let n = 0, ok = 0, left = 0, timer = null, locked = false; const secs = 12, log = [];
      const draw = () => {
        const q = qs[n]; locked = false; left = secs;
        box.querySelector('#ieN').textContent = 'Câu ' + (n + 1) + '/8 · đúng ' + ok + (review ? ' · ôn tập' : '');
        box.querySelector('#ieH').textContent = q.head; box.querySelector('#ieQ').textContent = q.big; box.querySelector('#ieF').textContent = '';
        box.querySelector('#ieA').innerHTML = q.opts.map((o, k) => '<button type="button" class="mini-opt" data-o="' + esc(o) + '"><span>' + (k + 1) + '</span>' + esc(o) + '</button>').join('');
        box.querySelectorAll('.mini-opt').forEach((b) => (b.onclick = () => answer(b.dataset.o)));
        clearInterval(timer); timer = every(() => { left -= 0.1; box.querySelector('#ieT').style.width = Math.max(0, left / secs * 100) + '%'; if (left <= 0) answer(null); }, 100);
      };
      function answer(o) {
        if (locked) return; locked = true; clearInterval(timer);
        const q = qs[n], right = o === q.a; if (right) { ok++; sfx('good'); } else sfx('bad');
        nbMark(q.v[0], right); log.push({ w: q.v[0], vi: q.v[2], ex: q.v[3], ok: right });
        box.querySelectorAll('.mini-opt').forEach((b) => { if (b.dataset.o === q.a) b.classList.add('right'); else if (b.dataset.o === o) b.classList.add('wrong'); b.disabled = true; });
        box.querySelector('#ieF').innerHTML = (right ? '✔ ' : '✘ ') + '<b>' + esc(q.v[0]) + '</b> — ' + esc(q.v[2]) + '<br><i>' + esc(q.v[3]) + '</i>';
        n++; later(n >= 8 ? done : draw, right ? 1100 : 1900);
      }
      const done = () => {
        clearInterval(timer);
        const wrongs = log.filter((x) => !x.ok);
        box.innerHTML = '<div class="mini-head"><b>📖 Kết quả</b><small>' + ok + '/8 đúng</small></div><div class="mq-review">' + log.map((x) => '<div class="' + (x.ok ? 'ok' : 'bad') + '"><b>' + (x.ok ? '✔' : '✘') + ' ' + esc(x.w) + '</b> — ' + esc(x.vi) + '<small>' + esc(x.ex) + '</small></div>').join('') + '</div>' +
          '<p class="sub">' + (wrongs.length ? wrongs.length + ' từ đã được thêm vào Sổ từ vựng để ôn lại.' : 'Tất cả đều đúng!') + '</p><div class="mini-btns"><button type="button" class="btn btn-primary" data-fin>Xong</button></div>';
        let gone = false; const go = () => { if (gone) return; gone = true; finish(res, p, ok / 8, 'Bạn trả lời đúng ' + ok + '/8 từ.'); };
        box.querySelector('[data-fin]').onclick = go; onKeys((e) => { if (e.key === 'Enter' || e.key === ' ') { go(); return true; } return false; });
      };
      onKeys((e) => { const k = +e.key; if (k >= 1 && k <= 4) { const b = box.querySelectorAll('.mini-opt')[k - 1]; if (b && !b.disabled && !locked) answer(b.dataset.o); return true; } return false; });
      draw();
    });
  }

  // ================================================================ 📰 ĐỌC HIỂU
  // q: [câu hỏi, đáp án, [lựa chọn]] — với T/F/NG lựa chọn là ['True','False','Not Given']
  const TFNG = ['True', 'False', 'Not Given'];
  const PASSAGES = [
    { t: 'Cycling to work', band: 5.5, text: 'More people in the city of Greenfield now cycle to work than ten years ago. The council built forty kilometres of separate bike lanes and introduced a scheme that lends bicycles for free during the first month. Surveys show that cyclists arrive at work in a better mood, and many say they save money on fuel and parking. However, some residents worry about safety at busy junctions, and a few shops complain that fewer car drivers stop to buy things on the way home.', q: [
      ['The council built bike lanes that are separate from the traffic.', 'True', TFNG],
      ['The bicycle scheme is free for the whole year.', 'False', TFNG],
      ['Cyclists in Greenfield earn more money than drivers.', 'Not Given', TFNG],
      ['What is one concern mentioned by some shop owners?', 'Fewer car drivers stop at their shops', ['Bike lanes are too expensive', 'Fewer car drivers stop at their shops', 'Cyclists park outside their doors', 'Bicycles are too noisy']]] },
    { t: 'The value of sleep', band: 6.0, text: 'Researchers have long known that sleep affects memory, but a recent study suggests the effect is stronger than expected. Two groups of students learned the same list of words. One group slept for eight hours afterwards, while the other stayed awake. When tested the next day, the group that slept remembered about forty percent more. The scientists believe that during deep sleep the brain strengthens new connections and removes information it does not need. They advise students not to study all night before an exam.', q: [
      ['Both groups of students learned different lists of words.', 'False', TFNG],
      ['The students who slept remembered more words.', 'True', TFNG],
      ['The study was carried out in several countries.', 'Not Given', TFNG],
      ['According to the scientists, what happens during deep sleep?', 'The brain strengthens new connections', ['The brain stops working', 'The brain strengthens new connections', 'The body grows faster', 'Dreams become shorter']]] },
    { t: 'Urban farming', band: 6.5, text: 'In many large cities, unused rooftops are being transformed into small farms. Supporters argue that urban farming shortens the distance between producers and consumers, which reduces transport emissions and keeps vegetables fresher. It can also provide jobs and teach children where food comes from. Critics point out that rooftop farms produce only a small share of a city\'s food and that the initial cost of soil, water systems and safety rails is high. Even so, several city governments now offer tax reductions to building owners who create green roofs.', q: [
      ['Urban farming can help keep vegetables fresher.', 'True', TFNG],
      ['Rooftop farms already supply most of a city\'s food.', 'False', TFNG],
      ['Children in every city visit rooftop farms at school.', 'Not Given', TFNG],
      ['What do some governments offer to owners of green roofs?', 'Tax reductions', ['Free seeds', 'Tax reductions', 'Cheaper water', 'Bigger buildings']]] },
    { t: 'A new library', band: 5.5, text: 'The town of Millbrook opened a new library last month. It has three floors, a quiet study room, a children\'s corner and a small cafe on the ground floor. The library is open from eight in the morning until nine at night on weekdays, and until five on weekends. Membership is free for residents, while visitors pay a small yearly fee. Staff say that the number of young readers has doubled since the children\'s corner opened.', q: [
      ['The library has a cafe on the ground floor.', 'True', TFNG],
      ['Visitors can join the library for free.', 'False', TFNG],
      ['The library has more than ten thousand books.', 'Not Given', TFNG],
      ['What has happened since the children\'s corner opened?', 'The number of young readers has doubled', ['The cafe became busier', 'The number of young readers has doubled', 'Opening hours were extended', 'Membership fees went up']]] },
    { t: 'Learning languages as adults', band: 7.0, text: 'It is often claimed that children learn languages more easily than adults, but the evidence is more nuanced. Young children do tend to acquire a native-like accent, yet adults generally progress faster in vocabulary and grammar during the first months because they can use reasoning and study strategies. What adults often lack is time and a supportive environment. A recent review concluded that regular, short sessions with plenty of speaking practice matter far more than the age at which learning begins, provided that learners remain motivated over several years.', q: [
      ['Adults may learn grammar faster than children at the beginning.', 'True', TFNG],
      ['The review found that age is the only important factor.', 'False', TFNG],
      ['Most adults prefer online lessons to classroom lessons.', 'Not Given', TFNG],
      ['According to the review, what matters most?', 'Regular short sessions with speaking practice', ['Starting as a young child', 'Regular short sessions with speaking practice', 'Living abroad for a year', 'Studying grammar rules alone']]] },
    { t: 'Plastic in the ocean', band: 7.0, text: 'Every year millions of tonnes of plastic enter the ocean, where they break into tiny fragments known as microplastics. These particles are swallowed by plankton, fish and eventually people. Although some countries have banned single-use plastic bags, researchers stress that most waste comes from fishing nets and from rivers carrying litter from inland areas. Experts therefore argue that cleaning beaches, although valuable, cannot solve the problem unless waste collection and recycling systems are improved far from the coast.', q: [
      ['Microplastics can be eaten by fish.', 'True', TFNG],
      ['Single-use plastic bags are the main source of ocean plastic.', 'False', TFNG],
      ['Plastic waste costs governments billions each year.', 'Not Given', TFNG],
      ['What do experts say is necessary to solve the problem?', 'Better waste collection and recycling inland', ['More beach cleaning events', 'Better waste collection and recycling inland', 'Banning all fishing', 'Moving factories to the coast']]] },
    { t: 'Remote work', band: 6.5, text: 'Since the pandemic, a growing number of companies allow employees to work from home several days a week. Employees report that they save commuting time and can concentrate better, while managers say that team meetings have become more efficient. On the other hand, new graduates often feel isolated, and some firms notice a decline in informal conversations that once produced new ideas. Many organisations are therefore adopting a hybrid model in which staff spend two or three days in the office.', q: [
      ['Some employees say they concentrate better at home.', 'True', TFNG],
      ['All companies have stopped using offices.', 'False', TFNG],
      ['Remote workers receive higher salaries than office staff.', 'Not Given', TFNG],
      ['Why are many companies choosing a hybrid model?', 'To keep informal contact while giving flexibility', ['To reduce office rent only', 'To keep informal contact while giving flexibility', 'To hire more graduates', 'To avoid team meetings']]] },
    { t: 'A new bus route', band: 5.5, text: 'From next Monday, the number 24 bus will run along Park Road instead of Station Street. The change will make it quicker to reach the hospital and the main market, but it means that passengers who live near Station Street must walk about five minutes further to the nearest stop. Buses will run every fifteen minutes between six in the morning and ten at night. The fare remains the same, and students can still use their monthly pass.', q: [
      ['The number 24 bus will use a different road from Monday.', 'True', TFNG],
      ['The fare will become cheaper.', 'False', TFNG],
      ['The bus company plans to buy new vehicles.', 'Not Given', TFNG],
      ['How often will the buses run?', 'Every fifteen minutes', ['Every five minutes', 'Every ten minutes', 'Every fifteen minutes', 'Every hour']]] },
  ];
  function read(p) {
    return new Promise((res) => {
      const lv = level(p), mb = maxBand(lv);
      const cand = PASSAGES.filter((x) => x.band <= mb + 0.5); const ps = pick(cand.length ? cand : PASSAGES);
      const qs = ps.q.map((q) => ({ q: q[0], a: q[1], opts: q[2] === TFNG ? TFNG.slice() : shuffle(q[2].slice()) }));
      const box = open('<div class="mini-head"><b>📰 ' + esc(ps.t) + '</b><small id="rdN"></small></div><div class="mini-bar"><i id="rdT"></i></div><div class="ie-pass">' + esc(ps.text) + '</div><div class="mq-card"><p class="mq-q" id="rdQ"></p></div><div class="mq-opts" id="rdA"></div><p class="mini-keys" id="rdF"></p>');
      let n = 0, ok = 0, left = 0, locked = false; const total = 170; left = total;
      const timer = every(() => { left -= 0.2; box.querySelector('#rdT').style.width = Math.max(0, left / total * 100) + '%'; if (left <= 0) { clearInterval(timer); stop(); } }, 200);
      const draw = () => {
        locked = false; const q = qs[n]; box.querySelector('#rdN').textContent = 'Câu ' + (n + 1) + '/' + qs.length + ' · đúng ' + ok;
        box.querySelector('#rdQ').textContent = q.q; box.querySelector('#rdF').textContent = n < 3 ? 'True: đúng với bài · False: trái với bài · Not Given: bài không nói.' : '';
        box.querySelector('#rdA').innerHTML = q.opts.map((o, k) => '<button type="button" class="mini-opt" data-o="' + esc(o) + '"><span>' + (k + 1) + '</span>' + esc(o) + '</button>').join('');
        box.querySelectorAll('.mini-opt').forEach((b) => (b.onclick = () => answer(b.dataset.o)));
      };
      function answer(o) {
        if (locked) return; locked = true; const q = qs[n], right = o === q.a; if (right) { ok++; sfx('good'); } else sfx('bad');
        box.querySelectorAll('.mini-opt').forEach((b) => { if (b.dataset.o === q.a) b.classList.add('right'); else if (b.dataset.o === o) b.classList.add('wrong'); b.disabled = true; });
        n++; later(n >= qs.length ? stop : draw, right ? 800 : 1500);
      }
      function stop() { clearInterval(timer); finish(res, p, ok / qs.length, 'Bài “' + ps.t + '”: đúng ' + ok + '/' + qs.length + ' câu.'); }
      onKeys((e) => { const k = +e.key; if (k >= 1 && k <= 4) { const b = box.querySelectorAll('.mini-opt')[k - 1]; if (b && !b.disabled && !locked) answer(b.dataset.o); return true; } return false; });
      draw();
    });
  }

  // ================================================================ ✏️ NGỮ PHÁP
  // [câu có chỗ trống, đúng, [3 sai], giải thích] — trống là ____
  const GRAMMAR = [
    ['She ____ to school every day.', 'goes', ['go', 'going', 'gone'], 'Chủ ngữ ngôi thứ ba số ít ở hiện tại đơn thêm -s/-es.', 5.5],
    ['I have lived here ____ 2015.', 'since', ['for', 'from', 'during'], '"since" + mốc thời gian; "for" + khoảng thời gian.', 5.5],
    ['If it rains tomorrow, we ____ at home.', 'will stay', ['stay', 'would stay', 'stayed'], 'Câu điều kiện loại 1: if + hiện tại đơn, will + động từ nguyên.', 5.5],
    ['There ____ a lot of traffic this morning.', 'was', ['were', 'are', 'have been'], '"traffic" không đếm được nên dùng động từ số ít.', 5.5],
    ['He is interested ____ science.', 'in', ['on', 'at', 'about'], 'be interested in + danh từ.', 5.5],
    ['The number of students ____ increased.', 'has', ['have', 'are', 'were'], '"the number of" đi với động từ số ít.', 6.0],
    ['A number of students ____ absent today.', 'are', ['is', 'was', 'has been'], '"a number of" nghĩa là nhiều, đi với động từ số nhiều.', 6.5],
    ['If I ____ more time, I would learn another language.', 'had', ['have', 'will have', 'would have'], 'Điều kiện loại 2: if + quá khứ đơn, would + động từ nguyên.', 6.0],
    ['She suggested ____ a taxi.', 'taking', ['to take', 'take', 'took'], 'suggest + V-ing.', 6.0],
    ['I look forward to ____ from you.', 'hearing', ['hear', 'heard', 'to hear'], 'look forward to + V-ing (to là giới từ).', 6.0],
    ['The report, ____ was published last week, has caused debate.', 'which', ['who', 'what', 'whose'], 'Mệnh đề quan hệ không xác định chỉ vật dùng which.', 6.0],
    ['By next year, she ____ her degree.', 'will have finished', ['will finish', 'has finished', 'finishes'], 'Tương lai hoàn thành với "by + mốc tương lai".', 6.5],
    ['Not only ____ the exam, but he also won a prize.', 'did he pass', ['he passed', 'he did pass', 'passed he'], 'Đảo ngữ sau "Not only" ở đầu câu.', 7.0],
    ['The more you practise, ____ you become.', 'the better', ['better', 'the best', 'best'], 'So sánh kép: the + so sánh hơn, the + so sánh hơn.', 6.5],
    ['Despite ____ tired, he continued working.', 'being', ['he was', 'to be', 'of being'], 'Despite + V-ing / danh từ.', 6.5],
    ['Hardly ____ arrived when the meeting started.', 'had she', ['she had', 'did she', 'she has'], 'Đảo ngữ với "Hardly ... when".', 7.0],
    ['I wish I ____ taller.', 'were', ['am', 'will be', 'have been'], 'Mong ước trái hiện tại: wish + quá khứ.', 6.5],
    ['The book ____ by millions of people since it came out.', 'has been read', ['was read', 'is read', 'read'], 'Hiện tại hoàn thành bị động với "since".', 6.5],
    ['He asked me where I ____.', 'lived', ['do live', 'live', 'am living'], 'Câu tường thuật: lùi thì.', 6.0],
    ['We ____ to the cinema last night.', 'went', ['go', 'have gone', 'were going'], 'Quá khứ đơn với "last night".', 5.5],
    ['Neither of the answers ____ correct.', 'is', ['are', 'were', 'be'], '"Neither of" thường đi với động từ số ít.', 7.0],
    ['She is the person ____ car was stolen.', 'whose', ['who', 'which', 'whom'], 'whose chỉ sở hữu.', 6.5],
    ['You ____ wear a seat belt. It is the law.', 'must', ['might', 'could', 'would'], '"must" diễn tả bắt buộc.', 5.5],
    ['It is essential that every student ____ on time.', 'arrive', ['arrives', 'arrived', 'will arrive'], 'Thức giả định sau tính từ như essential: dùng động từ nguyên mẫu.', 7.5],
    ['The city has ____ population than it had ten years ago.', 'a larger', ['more large', 'the larger', 'largest'], 'So sánh hơn của tính từ ngắn: larger.', 6.0],
    ['There are ____ people in the queue today than yesterday.', 'fewer', ['less', 'little', 'much'], 'Danh từ đếm được dùng fewer.', 6.0],
    ['I didn\'t go out because I ____ a headache.', 'had', ['have', 'was having', 'would have'], 'Quá khứ đơn trong mệnh đề nguyên nhân.', 5.5],
    ['Had I known about the delay, I ____ earlier.', 'would have left', ['would leave', 'will leave', 'had left'], 'Đảo ngữ của điều kiện loại 3.', 7.5],
    ['She has been working here ____ five years.', 'for', ['since', 'during', 'from'], '"for" + khoảng thời gian.', 5.5],
    ['The teacher made the students ____ the essay again.', 'write', ['to write', 'writing', 'wrote'], 'make + tân ngữ + động từ nguyên không "to".', 6.5],
    ['I\'m not used to ____ up early.', 'getting', ['get', 'got', 'to get'], 'be used to + V-ing.', 6.5],
    ['Do you mind ____ the window?', 'opening', ['to open', 'open', 'opened'], 'mind + V-ing.', 6.0],
    ['The government is responsible ____ providing public services.', 'for', ['of', 'to', 'at'], 'be responsible for.', 5.5],
    ['Scarcely anyone ____ the announcement.', 'noticed', ['has noticed', 'noticing', 'does notice'], 'Quá khứ đơn cho sự việc đã xảy ra.', 7.0],
    ['She apologised ____ being late.', 'for', ['of', 'with', 'about'], 'apologise for.', 6.0],
    ['The research ____ that sleep improves memory.', 'shows', ['show', 'showing', 'are showing'], '"The research" là danh từ số ít.', 6.0],
    ['Unless you ____ harder, you won\'t pass.', 'study', ['will study', 'studied', 'would study'], '"unless" + hiện tại đơn (nghĩa phủ định).', 6.0],
    ['They ____ the project by the end of this month.', 'will have completed', ['complete', 'completed', 'are completing'], 'Tương lai hoàn thành với "by the end of".', 7.0],
    ['The city is famous ____ its street food.', 'for', ['of', 'by', 'with'], 'be famous for.', 5.5],
  ];
  function grammar(p) {
    return new Promise((res) => {
      const lv = level(p), mb = maxBand(lv);
      const pool = shuffle(GRAMMAR.filter((g) => g[4] <= mb + 0.5)); const qs = (pool.length >= 8 ? pool : shuffle(GRAMMAR.slice())).slice(0, 8).map((g) => ({ q: g[0], a: g[1], why: g[3], opts: shuffle([g[1]].concat(g[2])) }));
      const box = open('<div class="mini-head"><b>✏️ Ngữ pháp</b><small id="gmN"></small></div><div class="mini-bar"><i id="gmT"></i></div><div class="mq-card"><small>Chọn đáp án đúng ngữ pháp</small><p class="mq-q" id="gmQ"></p></div><div class="mq-opts" id="gmA"></div><p class="mini-keys" id="gmF"></p>');
      let n = 0, ok = 0, left = 0, timer = null, locked = false; const secs = 15;
      const draw = () => {
        const q = qs[n]; locked = false; left = secs; box.querySelector('#gmN').textContent = 'Câu ' + (n + 1) + '/8 · đúng ' + ok; box.querySelector('#gmQ').textContent = q.q; box.querySelector('#gmF').textContent = '';
        box.querySelector('#gmA').innerHTML = q.opts.map((o, k) => '<button type="button" class="mini-opt" data-o="' + esc(o) + '"><span>' + (k + 1) + '</span>' + esc(o) + '</button>').join('');
        box.querySelectorAll('.mini-opt').forEach((b) => (b.onclick = () => answer(b.dataset.o)));
        clearInterval(timer); timer = every(() => { left -= 0.1; box.querySelector('#gmT').style.width = Math.max(0, left / secs * 100) + '%'; if (left <= 0) answer(null); }, 100);
      };
      function answer(o) {
        if (locked) return; locked = true; clearInterval(timer); const q = qs[n], right = o === q.a; if (right) { ok++; sfx('good'); } else sfx('bad');
        box.querySelectorAll('.mini-opt').forEach((b) => { if (b.dataset.o === q.a) b.classList.add('right'); else if (b.dataset.o === o) b.classList.add('wrong'); b.disabled = true; });
        box.querySelector('#gmF').innerHTML = (right ? '✔ ' : '✘ ') + esc(q.why); n++; later(n >= 8 ? () => finish(res, p, ok / 8, 'Bạn chọn đúng ' + ok + '/8 câu ngữ pháp.') : draw, right ? 1100 : 2200);
      }
      onKeys((e) => { const k = +e.key; if (k >= 1 && k <= 4) { const b = box.querySelectorAll('.mini-opt')[k - 1]; if (b && !b.disabled && !locked) answer(b.dataset.o); return true; } return false; });
      draw();
    });
  }

  // ================================================================ 🎧 NGHE
  const LISTEN = [
    { text: 'Good morning, everyone. This is a reminder that the school trip to the science museum has been moved from Thursday to Friday because of the weather forecast. Please arrive at the front gate by eight thirty, and bring a packed lunch. Students who forget their permission forms will not be able to join the trip.', band: 5.5, q: [
      ['When will the trip take place now?', 'Friday', ['Thursday', 'Friday', 'Saturday', 'Monday']],
      ['What time should students arrive?', '8:30', ['8:00', '8:30', '9:30', '10:00']],
      ['What must students bring?', 'A packed lunch', ['A map', 'A packed lunch', 'Some money', 'A camera']]] },
    { text: 'Hello, I would like to book a table for six people on Saturday evening at seven o\'clock, please. Two of my friends are vegetarian, and my sister is allergic to nuts. The name is Hoang, H O A N G. My phone number ends in four, seven, two, nine. Could you also tell me whether you have a quiet table by the window?', band: 6.0, q: [
      ['How many people is the table for?', 'Six', ['Four', 'Six', 'Seven', 'Nine']],
      ['What is the sister allergic to?', 'Nuts', ['Fish', 'Milk', 'Nuts', 'Eggs']],
      ['What does the caller ask about at the end?', 'A quiet table by the window', ['The price of the menu', 'A quiet table by the window', 'Parking', 'A birthday cake']]] },
    { text: 'The library will introduce new opening hours from next month. On weekdays it will open at eight in the morning and close at nine in the evening, one hour later than before. On Sundays the library will remain closed. Members can now borrow up to ten books at a time, but the loan period will be reduced from four weeks to three weeks.', band: 6.5, q: [
      ['What time will the library close on weekdays?', '9 p.m.', ['8 p.m.', '9 p.m.', '10 p.m.', '6 p.m.']],
      ['What is the loan period from next month?', 'Three weeks', ['Two weeks', 'Three weeks', 'Four weeks', 'Ten days']],
      ['What is the library\'s plan for Sundays?', 'It will stay closed', ['It will open all day', 'It will open until noon', 'It will stay closed', 'It will open for members only']]] },
    { text: 'Tourists visiting the old town are advised to buy tickets online, since the queue at the ticket office can last more than an hour in summer. The guided tour lasts two hours and starts at the fountain. Visitors should wear comfortable shoes because the streets are uneven, and photography is allowed everywhere except inside the museum.', band: 6.5, q: [
      ['Why should tourists buy tickets online?', 'The queue can be very long', ['Online tickets are cheaper', 'The queue can be very long', 'The office is closed', 'Tickets sell out in minutes']],
      ['Where does the guided tour start?', 'At the fountain', ['At the museum', 'At the fountain', 'At the station', 'At the ticket office']],
      ['Where is photography not allowed?', 'Inside the museum', ['In the streets', 'On the tour', 'Inside the museum', 'Near the fountain']]] },
    { text: 'My name is Linh and I study environmental science. For my project I interviewed forty local families about how they reduce waste. Most families said that they recycle paper and plastic, but only a few compost food waste. The main reason was a lack of space in small flats. Based on the interviews, I recommend that the council provides shared compost bins in each residential block.', band: 7.0, q: [
      ['How many families did Linh interview?', 'Forty', ['Fourteen', 'Forty', 'Fifty', 'Sixty']],
      ['Why do few families compost?', 'They do not have enough space', ['It is too expensive', 'They do not have enough space', 'It smells bad', 'They do not know how']],
      ['What does Linh recommend?', 'Shared compost bins in residential blocks', ['Banning plastic', 'Shared compost bins in residential blocks', 'Free recycling bags', 'More bus routes']]] },
    { text: 'Welcome to the airport. Passengers travelling to Singapore on flight VN 651 should proceed to gate twelve, where boarding will begin in twenty minutes. Please have your boarding pass and passport ready. Due to a technical check, the departure time has been delayed by thirty minutes, and we apologise for the inconvenience.', band: 6.0, q: [
      ['Which gate should passengers go to?', 'Gate 12', ['Gate 2', 'Gate 12', 'Gate 20', 'Gate 21']],
      ['Why is the flight delayed?', 'A technical check', ['Bad weather', 'A technical check', 'A strike', 'Late passengers']],
      ['How long is the delay?', 'Thirty minutes', ['Fifteen minutes', 'Twenty minutes', 'Thirty minutes', 'One hour']]] },
  ];
  function listen(p) {
    return new Promise((res) => {
      const lv = level(p), mb = maxBand(lv); const cand = LISTEN.filter((x) => x.band <= mb + 0.5); const sc = pick(cand.length ? cand : LISTEN);
      const canSpeak = !!synth(), qs = sc.q.map((q) => ({ q: q[0], a: q[1], opts: shuffle(q[2].slice()) }));
      let plays = 0, shown = !canSpeak, n = 0, ok = 0, locked = false;
      const box = open('<div class="mini-head"><b>🎧 Nghe</b><small id="lsN"></small></div><div class="ie-pass" id="lsP"></div><div class="mini-btns"><button type="button" class="btn btn-primary" id="lsPlay">▶ Nghe</button><button type="button" class="btn btn-ghost" id="lsShow">📄 Xem bản chép</button></div><div class="mq-card"><p class="mq-q" id="lsQ"></p></div><div class="mq-opts" id="lsA"></div><p class="mini-keys" id="lsF"></p>');
      const P = box.querySelector('#lsP');
      const upd = () => { P.textContent = canSpeak ? (plays ? '🔊 Bạn nghe được tối đa 2 lần (đã nghe ' + plays + '/2). Giọng đọc phụ thuộc trình duyệt.' : '🔊 Bấm ▶ Nghe, sau đó trả lời 3 câu hỏi.') : '⚠️ Trình duyệt này không có giọng đọc, nên bài nghe hiện bản chép dưới đây (kết quả sẽ ít giá trị luyện nghe).'; if (shown) P.innerHTML += '<br><i>' + esc(sc.text) + '</i>'; box.querySelector('#lsPlay').disabled = !canSpeak || plays >= 2 || speechOn; };
      box.querySelector('#lsPlay').onclick = () => { if (plays >= 2) return; plays++; speak(sc.text, { done: upd }); upd(); };
      box.querySelector('#lsShow').onclick = () => { shown = true; upd(); }; // xem bản chép: vẫn tính điểm nhưng trừ nhẹ
      const draw = () => {
        locked = false; const q = qs[n]; box.querySelector('#lsN').textContent = 'Câu ' + (n + 1) + '/3 · đúng ' + ok; box.querySelector('#lsQ').textContent = q.q; box.querySelector('#lsF').textContent = '';
        box.querySelector('#lsA').innerHTML = q.opts.map((o, k) => '<button type="button" class="mini-opt" data-o="' + esc(o) + '"><span>' + (k + 1) + '</span>' + esc(o) + '</button>').join('');
        box.querySelectorAll('.mini-opt').forEach((b) => (b.onclick = () => answer(b.dataset.o)));
      };
      function answer(o) {
        if (locked) return; locked = true; const q = qs[n], right = o === q.a; if (right) { ok++; sfx('good'); } else sfx('bad');
        box.querySelectorAll('.mini-opt').forEach((b) => { if (b.dataset.o === q.a) b.classList.add('right'); else if (b.dataset.o === o) b.classList.add('wrong'); b.disabled = true; });
        n++; later(n >= 3 ? () => { const peek = canSpeak && shown; finish(res, p, ok / 3 * (peek ? 0.8 : 1), 'Bạn nghe đúng ' + ok + '/3 câu' + (peek ? ' (có xem bản chép nên bị trừ điểm)' : '') + '.'); } : draw, right ? 800 : 1400);
      }
      onKeys((e) => { const k = +e.key; if (k >= 1 && k <= 4) { const b = box.querySelectorAll('.mini-opt')[k - 1]; if (b && !b.disabled && !locked) answer(b.dataset.o); return true; } if (e.key.toLowerCase() === 'p') { box.querySelector('#lsPlay').click(); return true; } return false; });
      upd(); draw(); if (canSpeak) later(() => box.querySelector('#lsPlay').click(), 600);
    });
  }

  // ================================================================ 🗣️ NÓI
  const SPEAK = [
    { q: 'Describe your hometown. You should say where it is, what people do there, and what you like about it.', cue: ['hometown', 'city', 'village', 'people', 'food', 'family', 'beautiful', 'quiet', 'busy', 'like'], band: 5.5, model: 'My hometown is a small city in the north of Vietnam. Most people work in farming or run small shops. What I like most about it is the friendly atmosphere, because everybody knows each other, and the street food is delicious.' },
    { q: 'Talk about a book or film you enjoyed recently. What was it about and why did you like it?', cue: ['book', 'film', 'story', 'character', 'because', 'enjoy', 'about', 'watch', 'read', 'recommend'], band: 5.5, model: 'Recently I watched a film about a young chef who opens a small restaurant. I enjoyed it because the story was inspiring, and the main character never gave up. I would recommend it to anyone who likes cooking.' },
    { q: 'Do you prefer studying alone or with other people? Why?', cue: ['alone', 'group', 'concentrate', 'because', 'help', 'discuss', 'friends', 'prefer', 'quiet', 'ideas'], band: 6.0, model: 'I usually prefer studying alone because I can concentrate better in a quiet place. However, when I find a topic difficult, I like to discuss it with friends, since they sometimes explain ideas in a simpler way.' },
    { q: 'Describe a person who has influenced you. You should say who the person is, how you know them, and how they influenced you.', cue: ['influence', 'teacher', 'mother', 'father', 'taught', 'inspire', 'because', 'example', 'learn', 'admire'], band: 6.0, model: 'The person who has influenced me most is my mother. She taught me to work hard and to be honest. Even when life was difficult, she stayed positive, and I admire her for that.' },
    { q: 'What are the advantages and disadvantages of social media for young people?', cue: ['advantage', 'disadvantage', 'social media', 'friends', 'time', 'information', 'addicted', 'communicate', 'however', 'young'], band: 6.5, model: 'One advantage of social media is that young people can communicate easily with friends and find useful information. However, a major disadvantage is that many of them spend too much time online and can become addicted.' },
    { q: 'Describe a journey you remember well. Where did you go, who was with you, and why was it memorable?', cue: ['journey', 'trip', 'travel', 'with', 'memorable', 'because', 'beach', 'mountain', 'friends', 'unforgettable'], band: 6.0, model: 'I remember a trip to Da Nang with my cousins last summer. We swam in the sea, ate fresh seafood and watched the sunrise. It was memorable because it was our first holiday without our parents.' },
    { q: 'Some people think that city life is better than life in the countryside. What is your opinion?', cue: ['city', 'countryside', 'jobs', 'pollution', 'quiet', 'opportunity', 'prefer', 'however', 'because', 'opinion'], band: 7.0, model: 'In my opinion, city life offers more opportunities, such as better jobs and education. However, the countryside is quieter and has less pollution, so the best choice depends on a person\'s priorities.' },
    { q: 'Talk about your daily routine. What do you usually do on weekdays?', cue: ['morning', 'usually', 'school', 'work', 'breakfast', 'evening', 'study', 'after', 'then', 'weekend'], band: 5.5, model: 'On weekdays I usually get up at six and have breakfast with my family. Then I go to work by motorbike. In the evening I cook dinner, study English for an hour and go to bed around eleven.' },
  ];
  function speakGame(p) {
    return new Promise((res) => {
      const lv = level(p), mb = maxBand(lv); const cand = SPEAK.filter((x) => x.band <= mb + 0.5); const t = pick(cand.length ? cand : SPEAK);
      const canRec = !!SR(), canSpeak = !!synth();
      const box = open('<div class="mini-head"><b>🗣️ Luyện nói</b><small>' + (canRec ? 'Nhận diện giọng' : 'Gõ câu trả lời') + '</small></div><div class="mq-card"><small>Đề bài</small><p class="mq-q">' + esc(t.q) + '</p></div>' +
        '<p class="mini-keys">Gợi ý ý tưởng/từ khóa: ' + t.cue.slice(0, 7).map((c) => '<kbd>' + esc(c) + '</kbd>').join(' ') + '</p>' +
        '<div class="mini-btns">' + (canSpeak ? '<button type="button" class="btn btn-soft" id="spModel">🔊 Nghe câu mẫu</button>' : '') + (canRec ? '<button type="button" class="btn btn-primary" id="spRec">🎙️ Bắt đầu nói (45 giây)</button>' : '') + '</div>' +
        '<textarea id="spTxt" class="ie-ta" rows="5" placeholder="' + (canRec ? 'Lời bạn nói sẽ hiện ở đây (có thể sửa).' : 'Trình duyệt không nhận diện giọng nói: hãy gõ câu trả lời bằng tiếng Anh (ít nhất 40 từ).') + '"></textarea>' +
        '<div class="mini-btns"><button type="button" class="btn btn-primary" id="spDone">✔ Nộp bài</button></div><p class="mini-keys" id="spInfo"></p>');
      const ta = box.querySelector('#spTxt'), info = box.querySelector('#spInfo'); let t0 = 0, secs = 0;
      if (canSpeak) box.querySelector('#spModel').onclick = () => speak(t.model);
      if (canRec) box.querySelector('#spRec').onclick = () => {
        stopSpeak(); stopListen(); const R = SR(); try { recog = new R(); } catch (e) { info.textContent = 'Không bật được nhận diện giọng, hãy gõ câu trả lời.'; return; }
        recog.lang = 'en-GB'; recog.continuous = true; recog.interimResults = false; ta.value = ''; t0 = Date.now();
        recog.onresult = (ev) => { for (let i = ev.resultIndex; i < ev.results.length; i++) if (ev.results[i].isFinal) ta.value += (ta.value ? ' ' : '') + ev.results[i][0].transcript.trim(); };
        recog.onerror = () => { info.textContent = 'Nhận diện giọng gặp lỗi (có thể do quyền micro). Bạn có thể gõ trực tiếp.'; };
        recog.onend = () => { secs = (Date.now() - t0) / 1000; };
        try { recog.start(); info.textContent = '🎙️ Đang nghe… nói tự nhiên, không cần hoàn hảo.'; } catch (e) { /* */ }
        later(() => { stopListen(); secs = 45; info.textContent = 'Hết 45 giây. Kiểm tra lại rồi bấm Nộp bài.'; }, 45000);
      };
      box.querySelector('#spDone').onclick = () => {
        stopListen(); const txt = ta.value.trim(), words = txt ? txt.split(/\s+/).filter(Boolean) : [];
        if (words.length < 5) { info.textContent = 'Bạn cần nói hoặc gõ ít nhất vài câu trước khi nộp.'; return; }
        const low = txt.toLowerCase();
        const cueHit = t.cue.filter((c) => low.includes(c)).length / Math.min(6, t.cue.length);
        const conn = ['because', 'however', 'although', 'for example', 'in addition', 'moreover', 'so ', 'but ', 'which', 'while', 'as well as', 'therefore'].filter((c) => low.includes(c)).length;
        const adv = VOCAB.filter((v) => v[5] >= 6.5 && low.includes(v[0])).length;
        const uniq = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z']/g, ''))).size / words.length;
        const target = canRec ? 55 : 45, len = clamp(words.length / target, 0, 1);
        const score = clamp(0.1 + len * 0.35 + clamp(cueHit, 0, 1) * 0.2 + clamp(conn / 3, 0, 1) * 0.15 + clamp(adv / 3, 0, 1) * 0.1 + clamp((uniq - 0.5) * 1.2, 0, 0.1), 0, 1);
        finish(res, p, score, 'Bạn nói/viết ' + words.length + ' từ, dùng ' + conn + ' từ nối và ' + adv + ' từ vựng nâng cao (chấm thô theo độ dài, từ khóa, từ nối — không thay cho giám khảo).');
      };
    });
  }

  // ---------------------------------------------------------------- đăng ký
  function boot() {
    if (!KN.Mini || !KN.Mini.register) return;
    if (KN.Mini.onAbort) KN.Mini.onAbort.push(close);
    const wrap = (fn) => (p) => fn(p).then((r) => { close(); return r; });
    const reg = (id, fn, name, how, hint) => KN.Mini.register(id, wrap(fn), name, how, hint);
    reg('ielts_vocab', vocab, '📖 Từ vựng IELTS', '8 câu từ vựng theo chủ đề, mỗi câu 12 giây: chọn nghĩa, chọn từ tiếng Anh hoặc điền từ vào câu. Câu sai tự vào Sổ từ vựng để ôn lại sau 1–3 ngày. Phím 1–4 để chọn.', (p) => 'Trí tuệ + tiếng Anh hiện tại quyết định độ khó của từ (đến band ' + maxBand(level(p)).toFixed(1) + ')');
    reg('ielts_read', read, '📰 Đọc hiểu IELTS', 'Đọc một đoạn ngắn rồi trả lời 4 câu: True / False / Not Given hoặc trắc nghiệm. Có 170 giây cho cả bài. Not Given nghĩa là bài không nói tới điều đó.', (p) => 'Đoạn đọc chọn theo trình độ của bạn (đến band ' + maxBand(level(p)).toFixed(1) + ')');
    reg('ielts_grammar', grammar, '✏️ Ngữ pháp IELTS', '8 câu chọn đáp án đúng ngữ pháp, 15 giây mỗi câu, có giải thích sau mỗi câu. Phím 1–4 để chọn.', (p) => 'Độ khó theo trình độ (đến band ' + maxBand(level(p)).toFixed(1) + ')');
    reg('ielts_listen', listen, '🎧 Nghe IELTS', 'Bấm Nghe (tối đa 2 lần) rồi trả lời 3 câu. Giọng đọc do trình duyệt của bạn cung cấp. Bấm “Xem bản chép” vẫn được, nhưng bị trừ điểm.', () => 'Cần loa/tai nghe; nếu máy không có giọng đọc, bài hiện bản chép');
    reg('ielts_speak', speakGame, '🗣️ Luyện nói', 'Đọc đề, nghe câu mẫu rồi tự nói (nếu trình duyệt hỗ trợ nhận diện giọng, như Chrome) hoặc gõ câu trả lời. Điểm chấm thô theo độ dài, từ khóa, từ nối và từ vựng nâng cao.', () => 'Hỗ trợ micro tùy trình duyệt; nếu không có, hãy gõ câu trả lời');
  }
  boot();
  KN.Ielts = { VOCAB, TOPIC, notebook: notebookStats, due: dueWords, band, bandText, speakSupported: () => !!synth(), listenSupported: () => !!SR(), _vocab: vocab, _read: read, _grammar: grammar, _listen: listen, _speak: speakGame, nbGet };
})();

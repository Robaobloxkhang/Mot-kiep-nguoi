/* Một Kiếp Người — con đường giang hồ (nghề 'giangho': đàn em → trùm) và chuyện trong trại giam (req.jail).
   Bị bắt thì vào tù (hiệu ứng jail: số năm); trong tù mỗi năm có cột mốc ms_jail (cải tạo, học nghề, đánh nhau, vượt ngục). */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  const gh = (min) => ({ jobId: ['giangho'], cond: (s) => !!(s.job && s.job.id === 'giangho' && s.job.level >= (min || 0)) });
  KN.EVENTS.push(
    {
      id: 's_gh_moi', title: 'Lời mời của đại ca', icon: '🦹', age: [15, 32], weight: 1.4,
      req: { notFlag: 'gh_invite', maxKarma: 60, jail: false },
      text: 'Đại ca khu phố đỗ chiếc xe phân khối lớn trước mặt bạn, chìa ra xấp tiền: “Thấy mày lì đòn, có gan. Về làm với anh, tháng này nhận trước. Đi theo anh không bao giờ đói.”',
      scene: { loc: 'street', time: 'night', anim: 'think', npcs: [{ role: 'thug', anim: 'talk', say: 'Về với anh không?' }, { role: 'thug', anim: 'idle' }], fx: 'money', shot: 'dramatic' },
      choices: [
        { label: 'Nhận tiền, theo đại ca',
          text: 'Bạn nhét xấp tiền vào túi, leo lên yên sau. Từ đêm đó, bạn có “anh em”, có đại ca, và có một cái tên giang hồ.',
          effects: { money: 5000000, happy: 3, karma: -6, flag: 'gh_invite', job: { hire: 'giangho' } }, scene: { anim: 'cheer', fx: 'money' } },
        { label: 'Từ chối thẳng',
          text: '“Em cảm ơn anh, em đi làm ăn lương thiện.” Đại ca nhếch mép: “Đổi ý thì tìm anh.”',
          effects: { karma: 3, flag: 'gh_invite_no' }, scene: { anim: 'shake' } }
      ]
    },
    // ── đánh nhau: dân giang hồ năm nào cũng phải ra tay (gangYear ép ít nhất một trận) ──
    {
      id: 's_gh_hon_chien', title: 'Hỗn chiến đêm khuya', icon: '🔥', age: [15, 60], weight: 2.5,
      req: gh(0),
      text: 'Nửa đêm, điện thoại réo: “Anh em bị bọn chợ Đêm chặn đánh ở gầm cầu, ra ngay!”. Bạn vớ cây gậy sau cửa, nổ máy phóng đi. Dưới gầm cầu đã có mấy chục người đứng thủ thế.',
      scene: { loc: 'street', time: 'night', anim: 'run', npcs: [{ role: 'thug', anim: 'angry', say: 'Đứa nào dám đụng anh em tao?' }, { role: 'thug', anim: 'angry' }, { role: 'crowd', anim: 'scared' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: '👊 Xông vào giữa trận', mini: 'fight', foe: 'gang',
          success: { stat: 'health', base: 0.25, scale: 0.5 },
          outcomes: [
            { text: 'Bạn lao vào như con thú, hạ liền ba tên. Bọn chợ Đêm tan tác bỏ chạy. Sáng ra cả khu đồn ầm tên bạn.', effects: { perf: 15, karma: -5, happy: 4, money: 3000000 }, scene: { anim: 'cheer', fx: 'stars' } },
            { text: 'Bạn dính một gậy vào đầu, ngã gục giữa đường. Anh em khiêng bạn vào viện khâu năm mũi.', effects: { health: -14, perf: -6, happy: -4 }, scene: { loc: 'hospital', anim: 'sick', fx: 'tears' } }
          ] },
        { label: '🏍️ Chở đàn em bị thương chạy trước', text: 'Bạn bỏ trận, chở thằng em máu me đầy mặt vào viện. Nó sống, nhưng mấy anh em khác bảo bạn “hèn”.', effects: { karma: 3, perf: -6, rel: { friend: 3 } }, scene: { anim: 'drive', fx: 'sweat' } },
        { label: '🚓 Gọi công an giải tán', text: 'Bạn lén gọi 113. Còi hú vang, hai phe chạy tán loạn. Không ai biết là bạn, nhưng lòng bạn nhẹ nhõm lạ thường.', effects: { karma: 6, perf: -10 }, scene: { anim: 'phone', fx: 'exclaim' } }
      ]
    },
    {
      id: 's_gh_phuc_kich', title: 'Bị phục kích', icon: '🗡️', age: [16, 60], weight: 2.2,
      req: gh(0),
      text: 'Đang đi một mình về nhà, bạn bị bốn tên bịt mặt chặn đầu xe. Một tên rút dao: “Đại ca mày nợ bọn tao một món. Hôm nay mày trả thay.”',
      scene: { loc: 'street', time: 'night', anim: 'scared', npcs: [{ role: 'thug', anim: 'angry', say: 'Xuống xe!' }, { role: 'thug', anim: 'point' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: '👊 Đánh trả tên cầm dao', mini: 'fight', foe: 'dao',
          success: { stat: 'health', base: 0.2, scale: 0.5 },
          outcomes: [
            { text: 'Bạn né nhát dao, quật tên cầm đầu xuống đất. Ba tên còn lại hoảng hồn bỏ chạy. Đại ca thưởng nóng cho bạn.', effects: { perf: 14, money: 5000000, karma: -3, happy: 3 }, scene: { anim: 'cheer', fx: 'stars' } },
            { text: 'Nhát dao sượt qua bụng. Bạn ôm vết thương chạy được ra đường lớn, nằm viện cả tháng.', effects: { health: -20, happy: -6 }, scene: { loc: 'hospital', anim: 'sick', fx: 'tears' } }
          ] },
        { label: '🏃 Bỏ xe, chạy thoát thân', success: { stat: 'health', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bạn chạy một mạch qua ba con hẻm. Mất chiếc xe nhưng còn nguyên người.', effects: { money: -15000000, perf: -5 }, scene: { anim: 'run', fx: 'sweat' } },
            { text: 'Chạy không kịp, bạn bị đánh hội đồng một trận nhừ tử.', effects: { health: -15, money: -15000000, perf: -5 }, scene: { anim: 'fall', fx: 'dust' } }
          ] }
      ]
    },
    {
      id: 's_gh_solo', title: 'Solo với đại ca phe kia', icon: '🥊', age: [17, 55], weight: 2,
      req: gh(1),
      text: 'Hai băng thoả thuận giải quyết món nợ cũ bằng một trận solo tay đôi, không dao, không gậy. Bên kia cử ra một gã cao to từng đi đánh võ đài. Bên bạn, đại ca chỉ tay về phía bạn.',
      scene: { loc: 'ring', time: 'night', anim: 'box', npcs: [{ role: 'thug', anim: 'box', say: 'Lên đây!' }, { role: 'crowd', anim: 'cheer' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: '🥊 Lên đài', mini: 'fight', foe: 'vo',
          success: { stat: 'health', base: 0.15, scale: 0.55 },
          outcomes: [
            { text: 'Ba hiệp nghẹt thở, bạn hạ đo ván gã võ sĩ. Băng bên kia xoá nợ, đại ca nâng bạn lên làm “tay chân thân tín”.', effects: { perf: 22, happy: 6, karma: -2, money: 10000000 }, scene: { anim: 'cheer', fx: 'confetti' } },
            { text: 'Bạn bị đấm gãy mũi ở hiệp hai. Thua trận, mất mặt, “nhà mình” phải nhường bãi.', effects: { health: -12, perf: -12, happy: -6 }, scene: { anim: 'fall', fx: 'tears' } }
          ] },
        { label: '🙅 Từ chối, nhờ người khác đánh', text: 'Bạn lắc đầu. Đại ca cử thằng khác lên, nó thua. Từ đó đại ca nhìn bạn bằng nửa con mắt.', effects: { perf: -12, health: 1 }, scene: { anim: 'shake' } }
      ]
    },
    {
      id: 's_gh_cuu_em', title: 'Giải cứu đàn em', icon: '⛓️', age: [17, 60], weight: 1.8,
      req: gh(1),
      text: 'Thằng em ruột trong băng bị bọn cho vay nặng lãi bắt giữ ở một kho hàng bỏ hoang, đòi chuộc 100 triệu. Đại ca bảo: “Tiền thì không có. Có tay chân thôi.”',
      scene: { loc: 'street', time: 'night', anim: 'angry', npcs: [{ role: 'thug', anim: 'idle', say: 'Mang tiền tới chưa?' }, { role: 'friend', anim: 'scared' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: '👊 Đột nhập đánh úp', mini: 'fight', foe: 'gang',
          success: { stat: 'health', base: 0.2, scale: 0.5 },
          outcomes: [
            { text: 'Bạn phá cửa sau, hạ gục hai tên canh và cõng thằng em ra. Từ đó nó coi bạn như anh ruột.', effects: { perf: 16, karma: 2, happy: 5, rel: { friend: 10 } }, scene: { anim: 'cheer', fx: 'stars' } },
            { text: 'Bạn bị bắt luôn, ăn một trận đòn rồi bị ném ra đường. Đại ca phải bỏ tiền chuộc cả hai.', effects: { health: -14, perf: -10, happy: -6 }, scene: { anim: 'fall', fx: 'tears' } }
          ] },
        { label: '💵 Bỏ tiền túi chuộc', text: 'Bạn dốc hết tiền tiết kiệm chuộc thằng em. Nó khóc, thề cả đời không quên. Đại ca thì cười khẩy: “Ngu.”', effects: { money: -100000000, karma: 5, rel: { friend: 8 } }, scene: { anim: 'sad', fx: 'money' } }
      ]
    },
    {
      id: 's_gh_dam_cuoi', title: 'Phá đám cưới phe đối thủ', icon: '💥', age: [17, 55], weight: 1.6,
      req: gh(0),
      text: 'Đại ca ra lệnh: tối nay đám cưới con trai trùm phe bên kia, “sang chào hỏi” cho chúng nó biết mặt. Rạp cưới rực rỡ, nhạc xập xình, khách khứa đông nghịt.',
      scene: { loc: 'wedding', time: 'night', anim: 'angry', npcs: [{ role: 'thug', anim: 'idle', say: 'Vào thôi anh em!' }, { role: 'crowd', anim: 'dance' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: '👊 Lật bàn, đánh nhau giữa tiệc', mini: 'fight', foe: 'say',
          success: { stat: 'health', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Cỗ bàn đổ ngổn ngang, khách chạy tán loạn. Bạn đánh gục mấy tay bảo kê say xỉn. Đại ca hả hê, nhưng nhà bạn bị khắc tên vào sổ thù.', effects: { perf: 14, karma: -10, happy: 2 }, scene: { anim: 'cheer', fx: 'smoke' } },
            { text: 'Phe bên kia đông gấp ba. Bạn bị đánh văng ra cổng rạp, có người quay clip tung lên mạng.', effects: { health: -12, perf: -6, karma: -6 }, scene: { anim: 'fall', fx: 'dust' } }
          ] },
        { label: '🍻 Lặng lẽ đi phong bì rồi về', text: 'Bạn bỏ phong bì, chúc mừng một câu rồi kéo anh em về. Trùm bên kia gật đầu nể. Đại ca chửi bạn suốt đêm, nhưng đêm đó không ai đổ máu.', effects: { perf: -8, karma: 6, money: -2000000 }, scene: { anim: 'bow' } }
      ]
    },
    {
      id: 's_gh_vo_duong', title: 'Lò võ của đại ca', icon: '🥋', age: [15, 50], weight: 1.6,
      req: gh(0),
      text: 'Đại ca mở lò luyện võ trong kho hàng cho anh em. Ai muốn lên chức phải qua được ba đàn anh trong một buổi đấu tập.',
      scene: { loc: 'gym', time: 'night', anim: 'box', npcs: [{ role: 'thug', anim: 'box', say: 'Đỡ được ba đòn thì lên!' }, { role: 'crowd', anim: 'cheer' }], fx: 'sweat' },
      choices: [
        { label: '🥊 Đấu tập với đàn anh', mini: 'fight', foe: 'danAnh',
          success: { stat: 'health', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Bạn qua cả ba đàn anh, người tím bầm nhưng đứng vững. Đại ca ghi tên bạn vào danh sách “lên chức”.', effects: { perf: 15, health: 2, happy: 3 }, scene: { anim: 'cheer', fx: 'levelup' } },
            { text: 'Bạn gục ở đàn anh thứ hai. Đại ca bảo: “Về tập thêm đi.”', effects: { health: -5, perf: -3 }, scene: { anim: 'sad', fx: 'sweat' } }
          ] },
        { label: '💪 Tập thể lực cả đêm', text: 'Bạn chưa dám đấu, ở lại tập tạ tới sáng. Người rắn chắc hẳn ra.', effects: { health: 4, perf: 2 }, scene: { anim: 'lift', fx: 'sweat' } }
      ]
    },
    {
      id: 's_gh_teen_danh', title: 'Đánh nhau ở cổng trường', icon: '🤜', age: [12, 17], weight: 2,
      req: { flag: 'scnGang', jail: false },
      text: 'Tan học, đám học sinh trường bên kéo sang chặn cổng, đòi “nói chuyện” với bạn vì tội nhìn đểu. Mấy anh lớn trong khu phố đứng xa xa, khoanh tay xem bạn xử lý ra sao.',
      scene: { loc: 'school', time: 'dusk', anim: 'angry', npcs: [{ role: 'classmate', anim: 'angry', say: 'Mày nhìn gì?' }, { role: 'thug', anim: 'idle' }], fx: 'anger' },
      choices: [
        { label: '👊 Ra tay luôn', mini: 'fight', foe: 'kid',
          success: { stat: 'health', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bạn hạ gục thằng cầm đầu chỉ bằng hai cú đấm. Mấy anh lớn trong khu gật gù: “Thằng này có máu.”', effects: { happy: 3, karma: -3, flag: 'gh_teen_win', rel: { mother: -3 } }, scene: { anim: 'cheer', fx: 'stars' } },
            { text: 'Bạn bị đánh bầm mắt, mẹ bị mời lên trường. Về nhà còn ăn thêm trận roi.', effects: { health: -5, happy: -4, rel: { mother: -4 } }, scene: { anim: 'cry', fx: 'tears' } }
          ] },
        { label: '🚶 Đi đường khác về', text: 'Bạn lặng lẽ vòng cổng sau. Mấy anh lớn cười khẩy, nhưng mẹ không phải lên trường.', effects: { karma: 2, rel: { mother: 2 } }, scene: { anim: 'walk' } }
      ]
    },
    {
      id: 's_gh_bao_ke', title: 'Thu tiền bảo kê', icon: '💵', age: [15, 60], weight: 2,
      req: gh(0),
      text: 'Đại ca giao bạn đi thu “phí bảo kê” dãy quán nhậu đầu phố. Ông chủ quán nướng nhất định không nộp, còn gọi mấy đứa con trai ra đứng chắn cửa.',
      scene: { loc: 'street', time: 'night', anim: 'angry', npcs: [{ role: 'vendor', gender: 'm', anim: 'angry', say: 'Không có tiền!' }, { role: 'thug', anim: 'idle' }], fx: 'anger' },
      choices: [
        { label: 'Dằn mặt cả nhà nó', mini: 'fight', foe: 'gang',
          success: { stat: 'health', base: 0.25, scale: 0.5 },
          outcomes: [
            { text: 'Mấy đứa con trai bỏ chạy. Ông chủ run run đưa tiền. Đại ca vỗ vai bạn: “Được việc!”', effects: { money: 8000000, perf: 12, karma: -5 }, scene: { anim: 'cheer', fx: 'money' } },
            { text: 'Bạn bị đánh bật ra khỏi quán, sứt cả răng. Về bị đại ca chửi té tát.', effects: { health: -10, perf: -10, happy: -5 }, scene: { anim: 'sick', fx: 'tears' } }
          ] },
        { label: 'Bỏ qua, tự bỏ tiền túi nộp thay',
          text: 'Nhìn mấy đứa trẻ con trong quán, bạn không nỡ. Bạn tự móc tiền túi nộp đại ca. Nghề này mà mềm lòng thì khó sống.',
          effects: { money: -3000000, karma: 4, perf: -4 }, scene: { anim: 'sad' } }
      ]
    },
    {
      id: 's_gh_dia_ban', title: 'Tranh địa bàn', icon: '⚔️', age: [16, 60], weight: 2,
      req: gh(1),
      text: 'Băng bên kia sông kéo sang chiếm bãi giữ xe của “nhà mình”. Đại ca chỉ tay về phía bạn: “Mày dẫn anh em ra xử lý.”',
      scene: { loc: 'street', time: 'night', anim: 'angry', npcs: [{ role: 'thug', anim: 'angry', say: 'Bãi này của tao!' }, { role: 'crowd', anim: 'scared' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Xông lên giành lại bãi', mini: 'fight', foe: 'vo',
          success: { stat: 'health', base: 0.2, scale: 0.5 },
          outcomes: [
            { text: 'Trận hỗn chiến chớp nhoáng. Băng kia tháo chạy, bãi xe về tay “nhà mình”. Tên bạn vang khắp khu.', effects: { money: 15000000, perf: 18, karma: -6, happy: 4 }, scene: { anim: 'cheer', fx: 'stars' } },
            { text: 'Bạn bị chém trúng tay, phải vào viện. Công an lần theo hồ sơ bệnh viện, bạn bị bắt vì gây rối trật tự.', effects: { health: -18, jail: 2, jailReason: 'gây rối trật tự công cộng, cố ý gây thương tích' }, scene: { loc: 'hospital', anim: 'sick', npcs: [{ role: 'police', anim: 'point' }] } }
          ] },
        { label: 'Đề nghị hai bên ngồi xuống “nói chuyện”', mini: 'haggle',
          success: { stat: 'smarts', base: 0.2, scale: 0.5 },
          outcomes: [
            { text: 'Bạn khéo léo chia đôi bãi, mỗi bên một nửa. Không ai đổ máu, đại ca gật gù nể phục cái đầu của bạn.', effects: { perf: 12, karma: 2 }, scene: { anim: 'nod' } },
            { text: 'Nói chuyện được mười phút thì bên kia rút dao. Bạn chạy thoát, nhưng mất mặt với cả băng.', effects: { perf: -8, happy: -5 }, scene: { anim: 'run', fx: 'sweat' } }
          ] }
      ]
    },
    {
      id: 's_gh_doi_no', title: 'Đòi nợ thuê', icon: '📒', age: [16, 60], weight: 2,
      req: gh(0),
      text: 'Bạn được giao đi đòi món nợ 200 triệu. Con nợ là một người đàn ông gầy gò, nhà chỉ có bà mẹ già ốm liệt giường và hai đứa con nhỏ.',
      scene: { loc: 'home', anim: 'angry', npcs: [{ role: 'neighbor', gender: 'm', anim: 'cry', say: 'Xin anh khất thêm…' }, { role: 'kid', anim: 'scared' }], fx: 'question' },
      choices: [
        { label: 'Hắt sơn, dọa nạt như mọi khi',
          outcomes: [
            { p: 0.6, text: 'Người đàn ông vay nóng chỗ khác trả nợ. Bạn có hoa hồng, nhưng đêm đó tiếng khóc của đứa bé cứ văng vẳng.', effects: { money: 10000000, perf: 8, karma: -10 }, scene: { anim: 'angry', fx: 'money' } },
            { p: 0.4, text: 'Hàng xóm quay clip đăng lên mạng. Ba ngày sau công an tới tận nhà bạn.', effects: { karma: -8, jail: 1, jailReason: 'đòi nợ thuê, khủng bố tinh thần người khác' }, scene: { anim: 'scared', npcs: [{ role: 'police', anim: 'point' }] } }
          ] },
        { label: 'Báo đại ca: “Nhà nó không còn gì”',
          text: 'Bạn bịa chuyện con nợ đã bỏ trốn. Đại ca nghi ngờ nhìn bạn rất lâu.',
          effects: { karma: 6, perf: -10 }, scene: { anim: 'shrug' } }
      ]
    },
    {
      id: 's_gh_buon_lau', title: 'Chuyến hàng đêm', icon: '📦', age: [18, 60], weight: 1.6,
      req: gh(1),
      text: 'Đại ca giao bạn lái xe chở “hàng” từ biên giới về trong đêm. Không được hỏi trong thùng có gì. Xong chuyến này, tiền công bằng cả năm làm thuê.',
      scene: { loc: 'street', time: 'night', anim: 'drive', npcs: [{ role: 'thug', anim: 'talk', say: 'Đừng dừng lại.' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Cầm lái, né các chốt kiểm tra', mini: 'drive',
          success: { stat: 'health', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Bạn chạy xuyên đêm, đổi ba cung đường, giao hàng trước khi trời sáng. Xấp tiền dày cộp, nhưng tay bạn vẫn run.', effects: { money: 50000000, perf: 15, karma: -10 }, scene: { anim: 'cheer', fx: 'money' } },
            { text: 'Chốt cảnh sát cơ động chặn ngay khúc cua. Trong thùng là hàng cấm. Bạn bị bắt quả tang.', effects: { karma: -10, jail: 6, jailReason: 'vận chuyển hàng cấm' }, scene: { anim: 'sad', npcs: [{ role: 'police', anim: 'point' }], fx: 'exclaim' } }
          ] },
        { label: 'Từ chối: “Cái này em không làm”',
          text: 'Đại ca im lặng hồi lâu: “Được. Nhớ cái miệng mày.” Từ đó bạn bị cho ra rìa.',
          effects: { perf: -15, karma: 5 }, scene: { anim: 'shake' } }
      ]
    },
    {
      id: 's_gh_phan_boi', title: 'Đàn em phản phé', icon: '🐍', age: [20, 70], weight: 1.4,
      req: gh(2),
      text: 'Thằng đàn em thân tín nhất ôm tiền của băng, dẫn theo nửa số anh em sang đầu quân cho băng đối thủ. Cả giới giang hồ đang chờ xem bạn xử lý thế nào.',
      scene: { loc: 'street', time: 'night', anim: 'angry', npcs: [{ role: 'thug', anim: 'laugh', say: 'Giờ tao làm chủ!' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Tự tay xử lý', mini: 'fight', foe: 'gang',
          success: { stat: 'health', base: 0.2, scale: 0.5 },
          outcomes: [
            { text: 'Bạn đánh bại kẻ phản bội trước mặt anh em. Uy tín của bạn lên đến đỉnh.', effects: { perf: 20, money: 20000000, karma: -6, job: 'promote' }, scene: { anim: 'cheer', fx: 'stars' } },
            { text: 'Bạn thua. Mất địa bàn, mất mặt, mất cả nửa băng.', effects: { perf: -25, health: -12, happy: -10 }, scene: { anim: 'sick', fx: 'tears' } }
          ] },
        { label: 'Cho qua, mỗi người một ngả',
          text: 'Bạn để nó đi. Có người bảo bạn già rồi, mềm rồi. Có lẽ đúng.',
          effects: { perf: -10, karma: 4 }, scene: { anim: 'sit' } }
      ]
    },
    {
      id: 's_gh_hoan_luong', title: 'Mẹ khóc', icon: '🕯️', age: [18, 70], weight: 1.5,
      req: gh(0),
      text: 'Mẹ đến tìm bạn ở quán nhậu của băng, dúi vào tay bạn hộp cơm, mắt đỏ hoe: “Mẹ già rồi, chỉ mong con về nhà, làm ăn lương thiện. Mẹ không cần tiền.”',
      scene: { loc: 'street', anim: 'sad', npcs: [{ role: 'mother', anim: 'cry', say: 'Con về với mẹ đi…' }, { role: 'thug', anim: 'idle' }], fx: 'tears', shot: 'close' },
      choices: [
        { label: 'Rửa tay gác kiếm, về với mẹ',
          outcomes: [
            { p: 0.7, text: 'Bạn bỏ băng. Đại ca bất ngờ không làm khó, chỉ bảo: “Mày còn có mẹ, đi đi.” Bạn về quê nuôi gà, chăm mẹ.', effects: { job: 'fire', karma: 15, happy: 8, rel: { mother: 20 } }, scene: { loc: 'home', anim: 'hug', fx: 'hearts' } },
            { p: 0.3, text: 'Bạn bỏ băng, nhưng phải “trả nợ” cho đại ca bằng một trận đòn nhừ tử. Nằm viện một tháng, bạn ra đi nhẹ nhõm.', effects: { job: 'fire', karma: 15, health: -15, rel: { mother: 20 } }, scene: { loc: 'hospital', anim: 'sick', fx: 'tears' } }
          ] },
        { label: '“Mẹ về đi, con lo được”',
          text: 'Mẹ lặng lẽ ra về. Bạn uống hết chai rượu, không nói với ai câu nào.',
          effects: { happy: -8, rel: { mother: -12 } }, scene: { anim: 'sad', npcAnim: { mother: 'walk' } } }
      ]
    },
    // ======================= TRONG TRẠI GIAM =======================
    {
      id: 's_jail_tham_nuoi', title: 'Ngày thăm nuôi', icon: '🍱', age: [14, 99], weight: 3,
      req: { jail: true, has: ['mother'] },
      text: 'Ngày thăm nuôi. Qua tấm kính, mẹ cố cười, đẩy về phía bạn túi đồ ăn khô và mấy hộp thuốc. Tóc mẹ bạc hơn lần trước.',
      scene: { loc: 'office', anim: 'sad', npcs: [{ role: 'mother', anim: 'cry', say: 'Con ăn uống đầy đủ nhé.' }, { role: 'police', anim: 'idle' }], fx: 'tears', shot: 'close' },
      choices: [
        { label: 'Hứa với mẹ sẽ làm lại cuộc đời',
          text: 'Bạn áp tay lên tấm kính, hứa sẽ cải tạo tốt. Mẹ gật đầu, nước mắt rơi lã chã.',
          effects: { happy: 4, karma: 4, rel: { mother: 10 } }, scene: { anim: 'cry', fx: 'hearts' } },
        { label: 'Bảo mẹ đừng đến nữa, xấu hổ lắm',
          text: 'Mẹ lặng người. Lần sau, chỉ có túi đồ ăn được gửi vào, không có mẹ.',
          effects: { happy: -6, rel: { mother: -12 } }, scene: { anim: 'sad' } }
      ]
    },
    {
      id: 's_jail_ban_tu', title: 'Bạn tù', icon: '🧑‍🤝‍🧑', age: [14, 99], weight: 3,
      req: { jail: true },
      text: 'Bạn tù nằm cạnh là một ông già án chung thân, đêm nào cũng kể chuyện đời mình, chuyện một phút nóng giận mất cả cuộc đời.',
      scene: { loc: 'office', time: 'night', anim: 'sit', npcs: [{ role: 'stranger', gender: 'm', anim: 'talk', say: 'Đừng như tao, nhóc.' }], fx: 'zzz' },
      choices: [
        { label: 'Lắng nghe, học cách sống chậm lại',
          text: 'Ông dạy bạn đọc sách, đánh cờ, kìm cơn nóng giận. Những đêm đó thay đổi bạn nhiều hơn mọi bản án.',
          effects: { smarts: 3, karma: 5, happy: 3 }, scene: { anim: 'study' } },
        { label: 'Kết bè với đám tù hung hãn',
          text: 'Bạn theo đám tù “có máu mặt”, được nể, nhưng sổ kỷ luật dày thêm.',
          effects: { karma: -5, happy: 2 }, scene: { anim: 'laugh' } }
      ]
    },
    {
      id: 's_jail_thu_tay', title: 'Lá thư từ bên ngoài', icon: '✉️', age: [14, 99], weight: 2,
      req: { jail: true, has: ['child'] },
      text: 'Cán bộ trại đưa bạn lá thư. Nét chữ nguệch ngoạc của con: “Bố/mẹ ơi, con được điểm mười. Bao giờ bố/mẹ về?”',
      scene: { loc: 'office', anim: 'cry', npcs: [{ role: 'police', anim: 'idle' }], fx: 'tears', shot: 'close' },
      choices: [
        { label: 'Viết thư trả lời thật dài',
          text: 'Bạn viết bốn trang, kể chuyện học nghề, hứa ngày về sẽ đưa con đi công viên.',
          effects: { happy: 6, karma: 3, rel: { child: 12 } }, scene: { anim: 'study', fx: 'hearts' } }
      ]
    }
  );
})();

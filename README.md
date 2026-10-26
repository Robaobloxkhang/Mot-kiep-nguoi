<p align="center">
  <img src="icons/icon-192.png" width="120" alt="Một Kiếp Người">
</p>

<h1 align="center">Một Kiếp Người</h1>

<p align="center">
  <b>Trò chơi mô phỏng cuộc đời 3D, chơi ngay trên trình duyệt.</b><br>
  Một trong tám tỷ cuộc đời — của riêng bạn.
</p>

<p align="center">
  <a href="https://mot-kiep-nguoi.vercel.app"><b>▶ Chơi ngay: mot-kiep-nguoi.vercel.app</b></a>
</p>

---

## Giới thiệu

**Một Kiếp Người** là game mô phỏng cuộc đời kiểu BitLife, nhưng mỗi tình huống đều diễn ra trong một
thế giới 3D thu nhỏ đậm chất Việt Nam: nhà ống, ngõ hẻm đầy xe máy, quán trà đá vỉa hè, lớp học,
bệnh viện, cánh đồng lúa, chùa, phòng karaoke…

Bạn sinh ra, lớn lên từng tuổi một, đi học, đi làm, yêu đương, lập gia đình, làm giàu (hoặc phá sản),
già đi và mất — rồi có thể sống tiếp bằng đời con cháu. Mỗi lựa chọn đều có hậu quả.

Không cần cài đặt, không cần tài khoản. Chạy được trên máy tính và điện thoại, có thể cài như một app (PWA).

## Tính năng nổi bật

**Cuộc đời**
- Hơn 770 tình huống đời thường và chuỗi câu chuyện nhiều hồi: học hành, tình yêu, gia đình, công việc, giang hồ, tai nạn, thời cuộc…
- Nhân vật 3D có biểu cảm, cử chỉ; tự tạo ngoại hình, lá số theo ngày sinh.
- Hàng chục nghề nghiệp có nhiệm vụ riêng, thăng chức, danh tiếng, mở doanh nghiệp, chuỗi nhượng quyền, tranh cử.
- Tài sản: nhà, xe, vàng (giá lên xuống thật), chứng khoán, bảo hiểm, xây nhà, làm nông, trang trí nhà 3D.
- Gia phả nhiều đời, thành tựu, nghĩa trang lưu lại những kiếp đã sống.

**Mạng xã hội**
- Đăng bài, chọn kênh chủ đề, tích xanh, hợp đồng quảng cáo, bóc phốt, giang hồ mạng.
- 📱 Phòng livestream như thật: trả lời câu hỏi, đọc bình luận, nhận quà.
- ⚔️ Live PK chia đôi màn hình kiểu TikTok: quà người xem quy ra điểm, bên thua chịu phạt.
- 📸 Tự cầm máy chụp ảnh, căn góc, chọn bộ lọc và mẫu CapCut "giật giật" rồi đăng.
- Lướt bảng tin dọc của bạn bè, KOL… và cẩn thận quảng cáo lừa đảo.

**Minigame & online**
- Hơn 25 minigame: sút penalty, ném rổ, đua xe máy, nấu ăn, mặc cả, phẫu thuật, phá án, câu cá, "Ai là triệu phú", thi hát…
- ⚽ Bóng đá / 🏀 bóng rổ kiểu HaxBall, nhiều bản đồ, **chơi online với bạn bè** (tối đa 8 người).
- 🏍️ Đua xe máy online.
- Solo online, dòng họ online, bảng xếp hạng, bảng tin "kiếp hay hôm nay", kết bạn với nhân vật của người chơi khác.

## Công nghệ

- HTML + CSS + JavaScript thuần (không framework, không bước build phức tạp).
- [three.js](https://threejs.org) r149 cho đồ hoạ 3D; nhân vật, nhà cửa, cảnh vật đều dựng bằng code.
- Online: Vercel Serverless Functions (`api/`) + Upstash Redis; trận Hax/đua xe nối trực tiếp giữa các máy bằng WebRTC.
- Lưu game trong trình duyệt (localStorage), hỗ trợ cài app và chơi khi mất mạng (service worker).

## Cấu trúc thư mục

```
index.html            Khung trang (được bọc thành trang đầy đủ khi đóng gói)
styles.css            Toàn bộ giao diện
js/
  game.js             Luật chơi, trạng thái cuộc đời, sự kiện
  data.js             Dữ liệu: nghề, đồ vật, tên, nhật ký cập nhật (CHANGELOG)
  events_*.js         Các tình huống và chuỗi câu chuyện
  characters.js       Nhân vật 3D + hoạt ảnh
  env_*.js, world.js  Cảnh 3D (trong nhà, ngoài trời, sân thể thao)
  ui.js               Giao diện, các tab, luồng chơi
  minigames.js        Minigame trong đời
  hax.js, race.js     Bóng đá/bóng rổ Hax, đua xe (có online)
  liveroom.js         Phòng livestream + PK
  photo.js            Studio chụp ảnh, mẫu CapCut, lướt MXH
  ...                 (online, dòng họ, nghĩa trang, trang trí nhà, minigame tổng hợp…)
api/                  Serverless functions cho các tính năng online
icons/                Icon app
dev/                  Công cụ phát triển (server chạy thử, kiểm tra lỗi, script deploy)
dist/                 Bản đã đóng gói — Vercel phục vụ thư mục này
```

## Chạy thử trên máy

Trên Windows (PowerShell), từ thư mục dự án:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File dev/serve.ps1 -Port 8791
```

Rồi mở:
- http://localhost:8791 — chơi game
- http://localhost:8791/dev/check.html — tự kiểm tra lỗi (phải báo `errors: 0`)

Các tính năng online cần máy chủ Vercel nên chỉ chạy đầy đủ trên bản đã deploy.

## Kiểm tra tự động

Trước khi đẩy bản mới, chạy bộ kiểm tra (cần Playwright; game thì không cần cài gì thêm):

```
npm i -D playwright && npx playwright install chromium
node dev/tests/run.mjs                 # kiểm tra toàn bộ (khá lâu vì chơi thử từng minigame và ca làm việc)
node dev/tests/run.mjs --quick         # chỉ lấy mẫu một phần
node dev/tests/run.mjs --only=boot,lazy,saves,a11y
node dev/tests/run.mjs --root=dist     # kiểm tra bản đã đóng gói
```

Gồm: mở trang không lỗi JS, nạp trễ tình huống (cả hai đường), mọi minigame mở được, mọi ca làm việc có minigame chạy được, **save của các phiên bản cũ** (`dev/tests/fixtures/`) vẫn nạp và chơi tiếp được, và quét truy cập ở khung điện thoại 390px. Trang `dev/check.html` vẫn dùng để kiểm tra dữ liệu/sự kiện bằng tay.

Sau khi sửa mã, đồng bộ bản đóng gói và đóng dấu phiên bản (để người chơi cũ nhận được bản mới) bằng `node dev/sync-dist.mjs`.

## Đưa lên mạng

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File dev/deploy-vercel.ps1
```

Script đóng gói game vào `dist/` rồi đưa lên Vercel. Repo này cũng đã liên kết với Vercel: mỗi lần
push lên nhánh `main`, Vercel tự deploy thư mục `dist/` (xem `vercel.json`) — vì vậy hãy chạy script
đóng gói trước khi commit.

Tính năng online cần các biến môi trường của Upstash Redis trên Vercel
(`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` hoặc `KV_REST_API_URL`, `KV_REST_API_TOKEN`).

## Tác giả

Made by **Bảo Khang**.
- Mô hình 3D minigame Hầm ngục: bộ DREADFALL — Dark Fantasy Dungeon Kit (assets/dread/).

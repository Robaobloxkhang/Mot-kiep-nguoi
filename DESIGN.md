# DESIGN.md — "Đèn lồng phố đêm"

Rút từ `styles.css` (token ở `:root`). Một giao diện tối duy nhất: kính navy mực trên cảnh 3D sáng, nhấn màu hổ phách đèn lồng.

## Màu
- Nền: `--ink-900 #0e1120` → `--ink-500 #3a4270`; viền `rgba(255,255,255,.08/.14)`.
- Chữ: `--fg #f2ede4` (16:1), `--fg-dim #a8a6bd` (≥6.4:1), `--fg-faint #8f8dab` (≥4.7:1 trên `--ink-800`, 3.9:1 trên `--ink-600`; chỉ dùng cho chữ phụ trên nền tối nhất).
- Nhấn: `--lantern #ffb347` (nút chính, số tuổi), `--jade #39cf98` (đạt/thành công), `--chili #ff5c5c` (lỗi/mất), `--sky #5cc8ff`, `--lotus #ff7eb6`.
- Chỉ số: happy `#ffcf4d`, health `#ff6b6b`, smarts `#5cc8ff`, looks `#c792ff`, money `#39cf98`, karma `#f5a3ff`.

## Chữ
- Tiêu đề/số: Baloo 2 (`--f-display`) 700–800. Nội dung: Be Vietnam Pro (`--f-body`) 400–700, cỡ gốc 15px, giãn dòng 1.5.
- Số liệu dùng `font-variant-numeric: tabular-nums`.

## Hình khối & chuyển động
- Bo góc: `--r-sm 10px`, `--r-md 14px`, `--r-lg 20px`; thẻ minigame bo 14px.
- Chuyển động: `--ease cubic-bezier(.2,.8,.2,1)`, `--spring` cho nhấn mạnh; mọi animation mới phải tắt dưới `prefers-reduced-motion`.
- Bố cục: máy tính = sân khấu 3D | bảng 420px; điện thoại = sân khấu trên, bảng dưới.

## Thành phần chính
- Nút: `.btn`, `.btn-primary` (hổ phách), `.btn-soft`, `.btn-ghost`, `.btn-sm`. Vùng chạm ≥44px trên màn cảm ứng (`@media (pointer: coarse)`).
- Khung minigame: `.mini-box` (+ `.mini-ring` vòng điểm, `.mini-bar`, `.mini-meta`, `.mini-quit`, `.mini-pause`). Canvas minigame có `role="img"` + `aria-label`.
- Màn Minigame: `.arc-card2/.arc-go`, `.arc-cats`, `.arc-daily`, sổ thành tựu `.ach-row`.
- Phòng HLV: tiền tố `.mx-*` (bảng màu riêng `--mx-*`).

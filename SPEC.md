# MỘT KIẾP NGƯỜI — technical spec (the contract every module codes against)

A browser life‑simulator in the spirit of BitLife / "1 in 8 billion", but with a live **3D diorama**
world: real 3D people (procedural, animated, with facial expressions) acting out each everyday
situation in a miniature Vietnamese setting (tube house, alley with motorbikes, street food stall,
classroom, hospital, rice fields, pagoda, karaoke room…). The player ages year by year, faces
everyday dilemmas, makes choices, studies, works, falls in love, raises a family, grows old and dies;
then can continue as their child (generations). Goal: so polished and alive that nobody wants to
close the tab.

All UI and game text is **Vietnamese with full, correct diacritics**. The player is addressed in the
second person as **"bạn"** ("Bạn nhặt được một chiếc ví…"). Tone: warm, witty, slice‑of‑life, very
Vietnamese (Tết, lì xì, họ hàng hỏi lương, kẹt xe, ngập nước, trà đá vỉa hè, thi vào lớp 10…).
No real brand names, no politics, no sexual content beyond hand‑holding/kissing/"âu yếm", no drug use.

---------------------------------------------------------------------------------------------------
## 1. Files, load order, conventions

Project root: `mot-kiep-nguoi/` (served at `http://localhost:8791/`). Published as a multi‑file
Artifact: `index.html` is the page (the host wraps it in `<!doctype html><html><head>…</head><body>`;
so **index.html must NOT contain doctype/html/head/body tags** — start with `<title>`, `<link>`s,
`<style>`/stylesheet link, markup, then `<script>` tags at the end).

Script load order (classic scripts, NOT ES modules; all in index.html, in this exact order):

| # | file | owner | global |
|---|------|-------|--------|
| 1 | `https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js` | — | `THREE` (r149 UMD) |
| 2 | `js/kn_boot.js` | **done** | `KN`, `KN.util`, `KN.store` |
| 3 | `js/data.js` | game agent | `KN.DATA` |
| 4 | `js/events_early.js` | events‑early agent | pushes into `KN.EVENTS` |
| 5 | `js/events_adult.js` | events‑adult agent | pushes into `KN.EVENTS` |
| 6 | `js/events_mature.js` | events‑mature agent | pushes into `KN.EVENTS` |
| 7 | `js/characters.js` | characters agent | `KN.Characters` |
| 8 | `js/fx.js` | characters agent | `KN.FX` |
| 9 | `js/env_core.js` | **done** | `KN.Env` (registry + helper kit) |
| 10 | `js/env_indoor.js` | env‑indoor agent | registers 8 locations |
| 11 | `js/env_outdoor.js` | env‑outdoor agent | registers 8 locations |
| 12 | `js/world.js` | world agent | `KN.World` |
| 13 | `js/audio.js` | UI agent | `KN.Audio` |
| 14 | `js/game.js` | game agent | `KN.Game` |
| 15 | `js/ui.js` | UI agent | `KN.UI` (boots itself) |

Plus `styles.css` (UI agent) linked from index.html.

Conventions for every JS file:
* Wrap in an IIFE: `(function () { 'use strict'; const KN = (window.KN = window.KN || {}); … })();`
* Modern JS (ES2020: `?.`, `??`, arrow fns, classes) is fine. No `import`/`export`, no bundler.
* No network access at runtime except the THREE script above + Google Fonts CSS. No external images,
  models, audio or JSON — everything procedural (geometry, CanvasTexture, WebAudio).
* **Fail soft**: public functions never throw on unknown ids/names — `console.warn` once and fall back
  (unknown anim → `idle`, unknown location → `home`, unknown fx → `sparkle`, missing role → skip).
* Never use `alert/confirm/prompt` (they are disabled in the host). Never `window.open`.
* Use `KN.util` helpers (see `js/kn_boot.js`) and `KN.store` for localStorage (it already try/catches).
* Coordinates: Y up, meters. Diorama ground top surface at y = 0, footprint x,z ∈ [-5, 5].
  Characters face **+Z** at `rotation.y = 0` (+Z points toward the default camera).
  `rotation.y = θ` makes forward = (sin θ, 0, cos θ).
* Colors in hex strings `'#rrggbb'`. `THREE.ColorManagement.legacyMode = false` is set by kn_boot.js,
  renderer uses `outputEncoding = THREE.sRGBEncoding` + ACESFilmic tone mapping. Any CanvasTexture
  holding colors must set `tex.encoding = THREE.sRGBEncoding`.

---------------------------------------------------------------------------------------------------
## 2. Shared data shapes

### 2.1 Appearance (humans)
```js
{
  skin: '#e6b48f',           // skin tone
  hair: '#1c1410',           // hair color (World/Characters greys it automatically with age ≥ 55)
  hairStyle: 'short',        // 'short'|'long'|'bun'|'ponytail'|'spiky'|'bob'|'curly'|'bald'|'buzz'
  eyes: '#2a1b12',
  top: '#d9534f',            // main garment color
  topStyle: 'tshirt',        // 'tshirt'|'shirt'|'hoodie'|'dress'|'aodai'|'suit'|'coat'|'uniform'|'school'|'polo'
  bottom: '#2f3b52',         // trousers/skirt color (dress/aodai: used for trousers under it)
  shoes: '#222222',
  glasses: false,
  beard: false,
  hat: null,                 // null|'cap'|'conical'(nón lá)|'helmet'(mũ bảo hiểm)|'beanie'
  build: 0.5,                // 0 slim … 1 heavy
  height: 0.5                // 0 short … 1 tall (±8% around the age‑based height)
}
```
`topStyle` meanings: `school` = white shirt + navy bottom, plus **red scarf (khăn quàng đỏ) when age 6‑11**;
`coat` = long white doctor coat; `uniform` = olive/green work/police style uniform with cap;
`aodai` = long tunic with side slits over (usually white) trousers.

### 2.2 Person (relationship member, owned by game.js)
```js
{ id:'p_xxx', role:'mother', firstName:'Lan', lastName:'Nguyễn', middleName:'Thị', gender:'f',
  age:31, alive:true, relation:72 /*0-100*/, kind:'human'|'dog'|'cat', appearance:{…}, petColor?:'#c08040',
  traits?:[] , since?: year }
```
Relationship **roles**: `mother, father, sibling, grandparent, friend, partner (người yêu), spouse,
child, grandchild, pet, ex`.

### 2.3 Scene (what the 3D world should show) — produced by game.js, consumed by world.js
```js
Scene = {
  loc: 'home',                // location id (see §4.3)
  decor: null,                // null|'tet'|'birthday'|'midautumn'|'christmas'|'funeral'
  time: 'day',                // 'dawn'|'day'|'dusk'|'night'
  weather: 'clear',           // 'clear'|'cloudy'|'rain'|'storm'|'fog'|'snow'
  player: { id:'player', name:'Minh', appearance:{…}, age: 7, gender:'m', anim:'idle', expr:null, say:null },
  npcs: [ SceneNPC, … ],      // 0–4 entries, already RESOLVED (appearance etc. filled in)
  fx: null,                   // null | fxName | [fxName,…]  (spawned at the player's head)
  npcFx: null,                // null | { [npcId]: fxName }
  shot: 'wide'                // 'wide'|'close'|'low'|'top'|'dramatic'|'orbit'
}
SceneNPC = { id:'p_xxx', name:'Lan', kind:'human'|'dog'|'cat', appearance:{…}|null, petColor:'#…'|null,
             age:31, gender:'f', anim:'talk', expr:null, say:'Con ăn cơm chưa?' | null }
```
`player.anim` / npc `anim` must be names from §4.1. `expr` optional (§4.2) — if null the anim's default
expression is used. `say` = speech bubble text (UI renders it over the head via `World.screenPos`).

### 2.4 Result (returned by every game action)
```js
Result = {
  ok: true,                   // false if action not allowed (then `reason` explains, nothing changed)
  reason: null,
  title: 'Đi tập gym',  icon: '🏋️',
  text: 'Bạn nâng tạ đến mức run cả tay…',      // already token‑resolved Vietnamese
  tone: 'good'|'bad'|'neutral'|'milestone',
  deltas: { happy: 3, health: 5, smarts: 0, looks: 2, money: -200000, karma: 0 },  // only non‑zero keys
  relDeltas: [ { personId, name, delta } ],     // relationship changes
  scene: Scene | null,        // full resolved scene to show (null = keep current)
  event: EventInstance | null,// a follow‑up interactive event to present right after
  achievements: [ { id, name, icon, desc } ],   // newly unlocked by this action
  goals: [ { id, text } ],                      // life goals completed by this action
  died: false
}
```

### 2.5 EventInstance (an interactive situation waiting for a choice)
```js
{ uid:'ev_…', id:'c_lost_wallet', title:'Chiếc ví rơi', icon:'👛', text:'…resolved…',
  choices:[ { index:0, label:'Trả lại', disabled:false, reason:null, hint:null }, … ],
  scene: Scene }
```

### 2.6 View (read‑only snapshot for the UI) — `KN.Game.view()`
```js
{
  alive:true, generation:1, year:2034, born:2026,
  name:'Minh', fullName:'Nguyễn Văn Minh', gender:'m', age:8,
  stage:'child', stageLabel:'Thiếu nhi',      // baby 0‑2 Sơ sinh · child 3‑10 Thiếu nhi · teen 11‑17 Thiếu niên · adult 18‑59 Trưởng thành · senior 60+ Cao tuổi
  city:'hanoi', cityName:'Hà Nội',
  stats:{ happy:72, health:88, smarts:61, looks:55 }, karma:50,
  money: 1500000, moneyText:'1,5 triệu ₫',
  occupation:'Học sinh lớp 3',               // or job title, 'Thất nghiệp', 'Nghỉ hưu', 'Sinh viên năm 2 — Y dược'
  appearance:{…},
  education:{ label:'Tiểu học — lớp 3', level:'primary', grade:3, performance:64,
              degrees:['Tốt nghiệp THPT'], actions:[{id:'study',label:'Học chăm hơn',icon:'📚',disabled,reason}] },
  job: { id:'laptrinh', title:'Lập trình viên', levelTitle:'Senior', salaryText:'35 triệu/tháng',
         performance:70, years:3, actions:[{id:'workhard',…},{id:'raise',…},{id:'quit',…},{id:'retire',…}] } | null,
  people:[ { id, name, fullName, role, roleLabel:'Mẹ', age, alive, relation, kind, gender, appearance, petColor,
             actions:[ { id:'talk', label:'Trò chuyện', icon:'💬', disabled:false, reason:null } ] } ],
  assets:[ { id, type, name, value, valueText, icon } ],
  illnesses:[ { id, name, severity } ],
  log:[ { age, year, text, tone, icon } ],     // chronological (oldest first)
  goals:[ { id, text, done } ],                // 3 life goals for this life
  achievements:[ { id, name, icon, desc, unlocked } ],  // all, with unlocked flags (meta, across lives)
  pendingCount: 0                              // interactive events waiting
}
```

---------------------------------------------------------------------------------------------------
## 3. Game API — `KN.Game` (js/game.js, with static data in js/data.js)

```js
KN.Game.newLife(opts?) -> Result
   // opts: { firstName, middleName, lastName, gender, city, appearance } — any missing → random.
   // Creates parents (appearances resembling the chosen one), maybe grandparents/siblings,
   // returns the birth Result: title 'Chào đời', scene at 'hospital' (player age 0 anim 'sleep',
   // mother 'love', father 'cheer', fx 'sparkle'). Picks 3 life goals.
KN.Game.hasLife() -> bool              // a living game is loaded
KN.Game.view() -> View
KN.Game.currentScene() -> Scene        // the calm "everyday" scene for the current year (stable within a year)
KN.Game.demoScene(n:int) -> Scene      // title‑screen showcase: random people doing things; cycles all locations as n grows
KN.Game.ageUp() -> AgeUpResult         // refuses (ok:false) while pending events exist or dead
   AgeUpResult = Result & { logs:[ {text, tone, icon} ], events:[EventInstance] }
   // .scene = the new year's scene (birthday flavor: player 'cheer' + fx; milestone birthdays get decor 'birthday')
KN.Game.pending() -> EventInstance[]   // events still waiting (also restored after reload)
KN.Game.choose(uid, index) -> Result   // resolve a choice; may contain .event (follow‑up) and .died
KN.Game.activities() -> [ { id, label, icon, category, categoryLabel, desc, costText, available, reason } ]
KN.Game.doActivity(id) -> Result
KN.Game.interact(personId, actionId) -> Result
KN.Game.eduAction(actionId) -> Result  // 'study' | 'dropout' | 'cheat' | …  (ids come from view.education.actions)
KN.Game.jobAction(actionId) -> Result  // 'workhard' | 'raise' | 'quit' | 'retire' | …
KN.Game.jobListings() -> [ { id, title, salaryText, reqText, eligible, reason, icon } ]
KN.Game.applyJob(id) -> Result
KN.Game.shopItems() -> [ { id, type, name, price, priceText, icon, desc, affordable, owned } ]
KN.Game.buy(itemId) -> Result
KN.Game.sell(assetId) -> Result
KN.Game.deathInfo() -> { fullName, name, born, died, age, cause, score, rank, epitaph, stats, moneyText,
                         highlights:[string], achievements:[{id,name,icon}], goals:[{text,done}],
                         heirs:[ {id, name, age} ] }
KN.Game.deathScene() -> Scene          // 'temple', decor 'funeral', dusk, family npcs crying
KN.Game.continueAs(personId) -> Result // play on as a child (generation+1, inherits a share of money)
KN.Game.meta() -> { lives:[ {fullName, born, died, age, cause, score, rank, generation} ], bestScore,
                    achievements:{ id: true } , totalLives }
KN.Game.save() / KN.Game.load() -> bool / KN.Game.reset()   // autosaves after every mutation
KN.Game.on(evt, fn)                    // evt: 'change' | 'achievement' | 'goal' | 'death'
```

Game behaviour requirements (owner: game agent):
* Stats 0–100 clamped. Natural drift per year: health declines after 35 (accelerating after 60),
  looks peaks ~18–30 then declines slowly, smarts grows with schooling/reading, happiness drifts toward
  a baseline set by relationships, money and health. Death chance per year rises with age and low
  health (typical lifespan 70–90; health 0 = death). Illnesses (cảm cúm, sốt xuất huyết, đau dạ dày,
  tiểu đường, cao huyết áp, ung thư…) drain health until treated (activity "Đi khám bệnh").
* Education auto‑progression: Mầm non 3‑5, Tiểu học 6‑10 (lớp 1‑5), THCS 11‑14 (lớp 6‑9),
  THPT 15‑17 (lớp 10‑12). **Reserved milestone events implemented inside game.js** (events files must
  not duplicate them): first day of school, entrance exam to grade 10 (age 15), THPT national exam +
  university admission with major choice (age 18), university graduation, first salary,
  wedding (via proposal), birth of a child, grandparent/parent death & funeral, retirement, the player's
  own death. University: 4 years (y dược 6), tuition each year; graduates gain degree.
* Careers (ids are a contract — events may reference them in `req.jobId`):
  `phucvu` Phục vụ quán, `shipper` Shipper, `congnhan` Công nhân, `taixe` Tài xế công nghệ,
  `banhang` Nhân viên bán hàng, `thocattoc` Thợ cắt tóc, `daubep` Đầu bếp, `laptrinh` Lập trình viên,
  `bacsi` Bác sĩ, `giaovien` Giáo viên, `ketoan` Kế toán, `marketing` Chuyên viên marketing,
  `kysu` Kỹ sư xây dựng, `luatsu` Luật sư, `nhabao` Nhà báo, `thietke` Nhà thiết kế, `casi` Ca sĩ,
  `streamer` Nhà sáng tạo nội dung, `cauthu` Cầu thủ bóng đá, `kinhdoanh` Chủ kinh doanh,
  `congchuc` Công chức. Each has levels (titles), monthly salary (VND), requirements.
* Majors: `cntt` Công nghệ thông tin, `yduoc` Y dược, `supham` Sư phạm, `kinhte` Kinh tế,
  `kythuat` Kỹ thuật, `luat` Luật, `baochi` Báo chí, `nghethuat` Nghệ thuật.
* Asset types: `phone, motorbike, car, house, land, gold` (shop items in data.js; prices in VND:
  motorbike ~20–300 triệu, car 600 triệu–2 tỷ, house 2,5–20 tỷ, gold price fluctuates yearly).
* Money in VND (đồng). Adults pay yearly living costs; children get pocket money / lì xì.
  `KN.DATA.fmtMoney(n)` → `'850.000 ₫'`, `'12,5 triệu ₫'`, `'1,2 tỷ ₫'`, negative with `-`.
* Activities (age‑gated, with per‑year use limits / diminishing returns), e.g. Tập gym, Chạy bộ công
  viên, Thiền, Đi khám bệnh, Đọc sách, Học tiếng Anh, Chơi game, Đi cà phê, Hát karaoke, Đi du lịch
  (Đà Lạt / Phú Quốc / Sa Pa / Nhật Bản / Hàn Quốc…), Đi biển, Hẹn hò qua app, Mua vé số, Làm thêm,
  Đầu tư chứng khoán, Livestream bán hàng, Đi spa / làm tóc, Phẫu thuật thẩm mỹ, Đi chùa, Làm từ thiện,
  Nhận nuôi thú cưng. Every activity Result carries a fitting Scene (loc + anim + fx).
* Interactions per role (ids): parents/grandparents: `talk, hug, meal, gift, ask_money, argue`;
  sibling/friend: `talk, hangout, gift, argue, borrow`; partner: `date, gift, love, propose, breakup`;
  spouse: `date, gift, love, baby, argue, divorce`; child/grandchild: `play, teach, gift, argue`;
  pet: `play, walk, feed`; ex: `talk`. Each returns a Result with a scene featuring that person.
* Achievements (persist across lives in meta, ~40), life goals (3 per life), score + rank at death,
  "Nghĩa trang" (list of past lives), generations via `continueAs`.
* Event selection each year: eligible events from `KN.EVENTS` (age range + req + once/cooldown),
  weighted random, 0–1 for babies, ~1–2 for others (sometimes 3). Auto‑detect required roles from
  scene npcs + text tokens (an event mentioning `{partner}` is only eligible with a partner).
* Persist: `KN.store` keys `kn_save_v1` (current life) and `kn_meta_v1` (meta). Autosave on change.

---------------------------------------------------------------------------------------------------
## 4. 3D contract

### 4.1 Animation names (Characters must implement all; World passes them through)
Looping: `idle, walk, run, dance, cry, sad, talk, think, sit, sleep, eat, drink, study, type, phone,
sick, crawl, lift, pray, swim, drive, cook, sing, dead`
One‑shot (play once, then return to the previous looping anim, default `idle`): `wave, cheer, jump,
angry, laugh, shrug, hug, love, fall, bow, clap, point, facepalm, scared, nod, shake`
Props appear automatically: study→book, type→laptop, phone→phone, eat→bowl+chopsticks,
drink→cup, lift→dumbbell, sing→microphone, cook→wok/pan, drive→scooter (xe máy) under the character,
pray→incense sticks. Age < 2 maps unsupported anims to `crawl`/`sleep`/`cry`/`laugh`/`idle`.
Seated family (`sit, eat, drink, study, type`): sitting pose with hips ≈ 0.45 m (adult; scaled by age)
above the root, thighs toward +Z; a red/blue **plastic stool prop** (ghế nhựa) appears under the
character unless `play(anim, { noStool:true })` (World passes that when it uses an env `seat` anchor).
Lying family (`sleep, dead`): lying on the back, centered on the root, **head toward local −X**, feet +X.
Pets (`kind:'dog'|'cat'`) support `idle, walk, run, sit, sleep, jump` (+ `cheer` → excited tail wag/jump);
everything else → `idle`.

### 4.2 Expressions
`neutral, happy, sad, angry, surprised, sleepy, love, sick, scared`. Defaults per anim: cry/sad → sad;
laugh/cheer/dance/jump/clap/sing/love → happy (love → love); angry → angry; sleep/dead → sleepy (eyes
closed); sick → sick; scared/fall → scared; think/study/type → neutral.

### 4.3 Location ids (16)
Indoor (env_indoor.js): `home` (phòng khách nhà ống: bộ bàn ghế gỗ, TV, bàn thờ, quạt cây, xe máy dựng
trong nhà), `bedroom` (giường + màn, bàn học), `hospital`, `school` (lớp học, bảng đen), `office`,
`gym`, `karaoke`, `cafe` (quán cà phê: phin, ghế gỗ, đèn dây).
Outdoor (env_outdoor.js): `street` (hẻm phố: nhà ống, dây điện chằng chịt, xe máy chạy, quán vỉa hè
ghế nhựa), `market` (chợ), `park` (hồ, cầu, liễu), `beach` (biển, dừa, thúng chai), `countryside`
(đồng lúa, trâu, tre), `temple` (chùa), `university` (giảng đường + sân trường + cây lớn),
`wedding` (tiệc cưới đỏ‑vàng, sân khấu, cổng hoa).

### 4.4 `KN.Characters` (js/characters.js)
```js
KN.Characters.create({ kind:'human'|'dog'|'cat', appearance, age, gender, petColor, name }) -> Character
KN.Characters.ANIMS        // array of all anim names
KN.Characters.EXPRESSIONS  // array
Character = {
  root: THREE.Group,       // origin at feet center, faces +Z; World sets position/rotation/scale
  kind, height,            // height = approx head‑top y in local units (adult ≈ 1.65)
  setAppearance(app), setAge(age),          // update in place (rebuild meshes if needed)
  play(anim, { loop?, speed? }) -> Promise  // resolves when a one‑shot finishes (loops: after ~1 cycle)
  setExpression(expr|null),                 // null = use anim default
  lookAt(vec3|null),                        // head turns toward a world point (clamped)
  update(dt, t),                            // World calls every frame
  getHeadWorldPosition(target:THREE.Vector3) -> target   // top of head
  dispose()
}
```
Quality bar: semi‑realistic proportions (adult head ≈ 1/7 height; kids progressively bigger heads),
smooth shading, joint hierarchy (hips→spine→chest→neck→head; shoulder→upper arm→forearm→hand;
hip→thigh→shin→foot), procedural animations with ~0.25 s cross‑fades, breathing + blinking + subtle
weight shifts in idle, facial features (eyes with whites/iris/highlight, brows, nose, mouth shapes per
expression, blush for `love`), hair styles, clothing variants, age (baby crawl, child, teen, adult,
senior with grey hair, slight hunch and a cane after 75), build/height params, Vietnamese touches
(nón lá, mũ bảo hiểm, áo dài, khăn quàng đỏ).

### 4.5 `KN.FX` (js/fx.js)
```js
KN.FX.NAMES = ['confetti','hearts','heartbreak','money','sparkle','tears','zzz','fireworks','smoke',
  'anger','question','exclaim','idea','sweat','music','stars','petals','bubbles','levelup','sick',
  'steam','flash','dust']
KN.FX.create(scene, camera) -> { spawn(name, worldPos:THREE.Vector3, opts?), update(dt), clear(), dispose() }
```
Particles via sprites/points with procedurally drawn CanvasTextures (emoji drawn on canvas is fine for
symbolic ones: 💡 ❓ ❗ 💢 💦 🎵 💤 🤒). Each burst self‑cleans; cap total particles (~600).

### 4.6 `KN.Env` (js/env_core.js — done; locations registered by env_indoor.js / env_outdoor.js)
See the doc comment at the top of `js/env_core.js` for the helper kit `H` and the registration API.
```js
KN.Env.register(id, { name:'Bệnh viện', indoor:true, sky:['#9ec9ff','#fbe3c8'] }, build(H, opts) -> {
   group,                                   // THREE.Group (the whole diorama incl. its base slab)
   playerSpot?: { pos:[x,y,z], rotY },      // default [0,0,0.8], 0
   npcSpots?: [ {pos, rotY} ×4 ],           // default ring around the player (see env_core.js)
   camera?: { wide|close|low|top|dramatic: { pos:[…], target:[…] } },  // overrides of defaults
   anchors?: { bed?: { pos:[x,y,z], rotY }, seat?: { pos:[x,y,z], rotY } },
        // bed: where the player lies for `sleep`/`dead` (pos.y = mattress top; head toward local −X after rotY)
        // seat: a real chair/sofa the player sits on for `sit/eat/drink/study/type` (pos.y = floor under
        //       the chair, the character's own sit pose puts hips at ≈0.45 m — so the chair seat must be ≈0.45 high)
   update?(dt, t), setTime?(time)            // ambient animation; extra night handling
})
KN.Env.build(id, { decor }) -> EnvInstance { id, meta, group, playerSpot, npcSpots, camera, anchors, update, setTime, dispose }
KN.Env.list() / has(id) / meta(id)
```
Each diorama: a 10×10 floating miniature tile (H.slab) with charming, dense, recognisably Vietnamese
detail, ≤ ~180 meshes (use InstancedMesh for repeats), clear floor area around the player spot and
NPC spots (radius ~3 around (0,0,0.8) kept free of tall props in front so the camera sees people).
Indoor = cut‑away room (back + left walls only, so camera at +X/+Z sees in). Support `opts.decor`:
`tet` (cành đào/mai, câu đối đỏ, đèn lồng, bánh chưng), `birthday` (bóng bay, bánh kem), `midautumn`
(đèn ông sao, bánh trung thu), `christmas` (cây thông nhỏ), `funeral` (hoa trắng, nhang, khung ảnh).
Decor may be ignored where it makes no sense but must not error.

### 4.7 `KN.World` (js/world.js)
```js
KN.World.init(containerEl) -> boolean   // creates the canvas (fills container, handles resize & DPR),
                                        // starts the loop; returns false if WebGL unavailable (then every
                                        // method is a harmless no‑op returning resolved promises)
KN.World.playScene(scene) -> Promise    // apply a full Scene: location (+decor) transition if changed,
                                        // time/weather, player (create/update appearance/age), NPC diff by id
                                        // (new ones walk in or pop in with 'dust'; missing ones shrink out),
                                        // anims/expressions, fx, camera shot. Resolves when settled (≤1.6 s).
KN.World.setLocation(id, { decor, instant }) -> Promise
KN.World.setAmbience({ time, weather })
KN.World.setPlayer({ appearance, age, gender, name })
KN.World.playerAnim(anim, opts) -> Promise ; KN.World.npcAnim(id, anim, opts) -> Promise
KN.World.setExpression(id /*'player'|npcId*/, expr)
KN.World.setNPCs(sceneNpcs) ; KN.World.clearNPCs()
KN.World.fx(name, { target:'player'|npcId } ) ; KN.World.shot(name)
KN.World.screenPos(id) -> { x, y, visible }   // CSS px relative to the container, just above the head
KN.World.setQuality('high'|'low') ; KN.World.setReducedMotion(bool) ; KN.World.setPaused(bool)
KN.World.onFrame(cb)                          // cb(dt) every frame (UI uses it to move speech bubbles)
KN.World.isReady() -> bool
```
Anchors: when the player's anim is in the lying family and the env has `anchors.bed`, World moves the
player there (tween); seated family + `anchors.seat` → moves there and plays with `{ noStool:true }`;
otherwise the player stands on `playerSpot`. NPCs always use `npcSpots[slot]` (slot = order in
`scene.npcs`). World owns every character's `root` transform (position/rotation/scale for pop‑in);
Characters must keep its own age scaling on an inner group. FX are spawned at the head (World passes
`getHeadWorldPosition`), except `dust` which spawns at the feet.
Look: floating diorama over a soft sky‑gradient void (gradient by location `sky` + time of day),
soft shadows (one shadow‑casting directional "sun" + hemisphere light), gentle fog, slow breathing
camera sway, smooth 1.2 s shot tweens, aspect‑aware framing (portrait phones zoom out). Location change
= old diorama sinks/fades, new one rises with ease‑out‑back. Night: dark‑blue sky, warm lamp glows
(`EnvInstance.setTime`). Rain/storm streak particles (+ lightning flashes), snow, fog density.
Performance: DPR ≤ 2 (low: 1, no shadows), 60 fps on a laptop.

---------------------------------------------------------------------------------------------------
## 5. Events DSL — `KN.EVENTS` (events_early.js 0‑17, events_adult.js 18‑45, events_mature.js 40+)

```js
KN.EVENTS = KN.EVENTS || [];
KN.EVENTS.push(
{
  id: 'c_lost_wallet',            // unique; prefix: c_ early, a_ adult, m_ mature
  title: 'Chiếc ví rơi',
  icon: '👛',
  age: [9, 17],                   // inclusive age range (required)
  weight: 1,                      // relative frequency (default 1; rare 0.2–0.4; common 1.5–2)
  once: true,                     // default true; if false give cooldown (years)
  cooldown: 4,
  req: { … },                     // optional, see below
  text: 'Trên đường đi học về, bạn nhặt được một chiếc ví dày cộp, bên trong có {money:2500000} và căn cước của một {stranger.k} lạ.',
  scene: { loc:'street', time:'day', weather:'clear', decor:null, anim:'think', expr:'surprised', say:null,
           npcs:[ { role:'stranger', anim:'phone', gender:'f', say:null } ], fx:'question', shot:'close' },
  choices: [
    { label: 'Mang ví đến đồn công an',
      text: 'Chủ ví tìm đến tận nhà cảm ơn và tặng bạn {money:300000}.',
      effects: { karma: 10, happy: 4, money: 300000 },
      scene: { anim:'cheer', fx:'sparkle', npcAnim:{ stranger:'bow' }, npcSay:{ stranger:'Cảm ơn cháu nhiều lắm!' } } },
    { label: 'Lấy tiền, vứt ví',
      success: { stat:'karma', base:0.75, scale:-0.5 },   // optional: p(outcomes[0]) = clamp(base + scale*stat/100, .05, .95)
      outcomes: [
        { text: 'Không ai biết. Nhưng đêm đó bạn trằn trọc mãi.', effects:{ money:2500000, karma:-15, happy:-3 }, scene:{ anim:'think', fx:'sweat' } },
        { text: 'Camera đầu hẻm ghi lại tất cả. Bố mẹ bạn phải đi xin lỗi.', effects:{ karma:-20, happy:-10, rel:{ mother:-15, father:-15 } }, scene:{ anim:'sad', fx:'tears' } }
      ] },
    { label: 'Đứng chờ người mất quay lại', req: { minStat:{ happy: 20 } },
      outcomes: [ { p:0.5, text:'…', effects:{…} }, { p:0.5, text:'…', effects:{…} } ] }
  ]
});
```
* `outcomes` with `p` (weights summing ~1) for random branches, or `success` (exactly 2 outcomes:
  [success, failure]) when a stat should drive the odds. Stats usable in `success.stat`:
  `happy, health, smarts, looks, karma, money` (money is mapped to 0‑100 on a log scale).
  Choice‑level `text/effects/scene` are used when there are no `outcomes`.
* **req keys** (all AND‑ed): `stage:[…]`, `gender:'m'|'f'`, `has:[roles]`, `lacks:[roles]`,
  `flag:'x'|[…]`, `notFlag:'x'|[…]`, `school:true|false` (currently enrolled), `eduLevel:[…]`
  (`preschool,primary,secondary,highschool,university`), `degree:true` (has university degree),
  `job:true|false`, `jobId:[ids]`, `minMoney`, `maxMoney`, `minStat:{stat:n}`, `maxStat:{stat:n}`,
  `asset:'motorbike'|…`, `noAsset:'car'|…`, `married:true|false`, `minKarma`, `maxKarma`,
  `city:[ids]`, `illness:true|false`, `cond:(s, h) => bool` (escape hatch; `s` = raw state, `h` = helpers).
* **effects keys**: `happy, health, smarts, looks, karma` (deltas), `money` (đồng, ±), `moneyPct`
  (fraction of current money, e.g. -0.1), `rel:{ role|'all': delta }` (applies to the person bound to
  that role in this event instance, or a random one of that role), `flag:'x'|[…]`, `unflag:'x'|[…]`,
  `addPerson:{ role:'friend'|'partner'|'pet'|'sibling', fromScene:'stranger'?, kind?:'dog'|'cat' }`
  (fromScene converts that scene NPC into a real person, keeping looks), `removePerson:'partner'|'pet'|…`
  (partner → becomes `ex`; pet → lost), `kill:'grandparent'|'pet'` (that person dies; game adds funeral
  log), `marry:true`, `divorce:true`, `baby:true`, `job:'fire'|'promote'|'raise'|{ hire:'taixe' }`,
  `school:'expel'|'dropout'|'honor'`, `asset:{ add:{ type, name, value } } | { lose:'motorbike' }`,
  `illness:'Sốt xuất huyết'`, `cure:true`, `die:'cause text'` (very rare, only for genuinely deadly
  choices), `achievement:'id'`, `log:'override log text'`, `followUp:{ id:'a_xxx', delay:0|1 }`
  (delay 0 = present immediately after this outcome; 1 = force next year).
* **scene** (event level) keys as in §2.3 but npcs use `role` instead of resolved data:
  `{ role, anim, expr, say, gender?, age?, kind? }`. Roles = relationship roles (§2.2) or generic roles
  generated on the fly: `stranger, kid, baby, teacher, classmate, boss, coworker, doctor, police, vendor,
  neighbor, relative, crowd` (crowd spawns 2–3 extras). Max 4 npcs.
  **Outcome scene** (choice or outcome level) is merged over the event scene:
  `{ anim, expr, say, fx, shot, loc, time, weather, decor, npcAnim:{ role|'all': anim }, npcSay:{ role: text },
     npcExpr:{ role: expr }, npcFx:{ role: fx } }`.
* **Text tokens** (in title, text, labels, outcome text, say): `{name}` player given name,
  `{fullname}`, `{age}`, `{city}`, `{job}` job title, `{school}` school level name, `{money:N}` formatted
  money; for any role R (relationship or generic): `{R}` given name ("Lan"), `{R.k}` kin/title word
  lower‑case (mother→"mẹ", father→"bố", sibling→"anh"/"chị"/"em", grandparent→"ông"/"bà",
  spouse→"vợ"/"chồng", partner→"người yêu", child→"con", friend→"bạn", teacher→"thầy"/"cô",
  boss→"sếp", doctor→"bác sĩ", police→"chú công an"/"anh công an", vendor→"cô"/"chú",
  stranger→"anh"/"chị"/"cô"/"chú"/"bác"/"em" by age, pet→"bé"), `{R.K}` same capitalised,
  `{R.full}` full name. Example: `'{sibling.K} {sibling} giành mất cái điều khiển TV.'` →
  "Chị Hoa giành mất cái điều khiển TV."
* Write events as vivid little scenes (2–4 sentences), choices with genuinely different flavors
  (kind / selfish / funny / risky), outcomes with consequences that make sense, and scenes that SHOW
  the situation in 3D (right location, right people, fitting anims + fx + short `say` lines).

### 5.1 Ngoại truyện — multi‑chapter story arcs (files `js/events_story_*.js`, id prefix `s_`)
An arc is a chain of ordinary events linked by flags and follow‑ups. Engine features for arcs:
* `followUp: { id, delay }` on a choice or outcome (or inside `effects`). `delay: 0` = the next chapter
  is presented immediately after this outcome. `delay: N` (N ≥ 1) = the chapter is scheduled for N
  years later (it is added to that year's events, on top of the random ones). The **role binding is
  kept**: the same `{partner}`, `{friend}`, `{thief}`… appear in the later chapter (people who died or
  changed role meanwhile are re‑bound or the chapter is dropped). A scheduled chapter ignores its own
  `age` range but its event‑level `req` is re‑checked when it fires (drop it if no longer true).
* `chainOnly: true` (event level) = never picked at random; only reachable through a `followUp`.
  Use it for middle/late chapters. The first chapter of an arc is a normal random event (with `req`
  `notFlag` so it does not repeat).
* `req.since: { flagName: minYears }` = the flag was set at least N years ago (flags store the year
  they were set). Good for "a few years after you opened the shop…" chapters that stay random.
* Generic roles added: `thief` (kẻ gian — hoodie, cap/helmet; `{thief.k}` = "kẻ gian") and `thug`
  (gã giang hồ / đòi nợ thuê; `{thug.k}` = "gã giang hồ"). Use `police` for the aftermath.
* `asset: { lose: 'all' }` (bankruptcy: everything is seized) or `asset: { lose: ['car','house'] }`.
  Money may go negative (= debt), e.g. `money: -800000000`.
* `die: 'Tai nạn giao thông'` ends the life at once (any age) — cause text shown in the obituary.
  Deadly outcomes must be rare (p ≤ 0.25, only on reckless choices); always offer a safe choice;
  never graphic; ages ≥ 13 only.

---------------------------------------------------------------------------------------------------
## 6. UI (index.html, styles.css, js/ui.js, js/audio.js)

`KN.Audio`: `unlock()` (call on first user gesture), `sfx(name)` with names
`click, hover, age, good, bad, coin, achievement, birth, death, pop, whoosh, love, fail, cheer, tick,
notify, page`, `setSfx(bool)`, `setMusic(bool)`, `mood('calm'|'happy'|'sad'|'tense'|'festive')` —
all procedural WebAudio (soft generative pentatonic music, gentle volume). Fail soft without audio.

Visual identity "Đèn lồng phố đêm" (single deliberate dark look, `color-scheme: dark` on :root, every
color explicit): ink‑indigo glass chrome over the bright 3D diorama, lantern‑amber accent.
```
--ink-900 #0e1120  --ink-800 #151a2e  --ink-700 #1e2440  --ink-600 #2a3156  --line rgba(255,255,255,.08)
--fg #f2ede4  --fg-dim #a8a6bd  --lantern #ffb347  --lantern-deep #f0841f
--jade #39cf98 (good)  --chili #ff5c5c (bad)  --sky #5cc8ff (info)  --lotus #ff7eb6 (love)
stats: happy #ffcf4d · health #ff6b6b · smarts #5cc8ff · looks #c792ff · money #39cf98
fonts: display "Baloo 2" 600/700/800, body "Be Vietnam Pro" 400/500/600/700 (both have Vietnamese)
```
Layout: one‑screen app (`html,body{height:100%}`; no page scroll). Desktop ≥ 980px: 3D stage left
(flexible) + right panel 420px. Phone: stage on top (~44% height, min 240px) + panel below; the big
round **"+1 tuổi"** button floats bottom‑center (safe‑area aware). Stage overlays: identity card
(name, big age, occupation, money), menu/sound buttons, speech bubbles following heads
(`World.onFrame` + `World.screenPos`), floating stat‑delta chips. Panel: 4 stat bars, tabs
**Nhật ký · Hoạt động · Quan hệ · Học & Làm · Tài sản**. Event card slides over the panel (desktop) /
up as a bottom sheet over the panel (phone) so the 3D scene stays visible while reading; text types in
(skippable), choices stagger in, outcome shows delta chips, "Tiếp tục". Screens: title (3D demo
slideshow via `Game.demoScene(n)`, logo, Bắt đầu / Tiếp tục / Nghĩa trang / Thành tựu), character
creator (name re‑roll, gender, city, skin/hair/outfit pickers with live 3D preview at age 20), death
(funeral scene + obituary card with score/rank/highlights, "Sống tiếp làm con" / "Kiếp mới"),
settings (sound, music, graphics quality, delete save with in‑page confirm). First‑run coach marks.
Keyboard: Space = +1 tuổi, 1–4 = choices, Enter = continue. Respect `prefers-reduced-motion`.
Hot reload: `window.claude?.hot?.snapshot?.(() => ({ save: KN.store.get('kn_save_v1') }))`;
boot via `window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {})`.

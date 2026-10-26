// Ghép dev/lang/<tên>*.json thành js/lang_en_<tên>.js.   node dev/lang/build.mjs ui|data|minigames|events
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(dir, '..', '..');
const group = process.argv[2] || 'ui';
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && f.startsWith(group === 'ui' ? 'b' : group + '_')).sort();
const map = {}; files.forEach((f) => Object.assign(map, JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))));
const regs = fs.existsSync(path.join(dir, group + '_regs.js')) ? fs.readFileSync(path.join(dir, group + '_regs.js'), 'utf8') : '[]';
const out = `/* Từ điển Việt → Anh (${group}). Sinh bởi dev/lang/build.mjs — sửa ở dev/lang/*.json rồi chạy lại. */\n(function () { 'use strict'; if (window.KN && KN.I18n) KN.I18n.add(${JSON.stringify(map)}, ${regs}); })();\n`;
fs.writeFileSync(path.join(root, 'js', 'lang_en_' + group + '.js'), out);
console.log(group, Object.keys(map).length, 'mục từ', files.join(','));

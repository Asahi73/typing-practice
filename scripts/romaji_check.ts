// romaji.ts の逐次判定を確認する手動テスト。
// 実行: node --experimental-strip-types scripts/romaji_check.ts
import { toRomajiUnits, matchUnit } from '../src/lib/romaji.ts';

// 1つの入力文字列でユニット列を完走できるか検証する。
// useTypingSession.handleChar と同じ確定保留ロジックを再現する。
function typeThrough(text: string, input: string): boolean {
  const units = toRomajiUnits(text);
  let buf = '';
  let ui = 0;
  for (const ch of input) {
    if (ui >= units.length) return false; // 余分な入力
    const unit = units[ui];
    const cand = buf + ch;
    const m = matchUnit(unit.patterns, cand);
    if (m.valid) {
      if (m.complete && !m.extendable) {
        ui++;
        buf = '';
      } else {
        buf = cand;
      }
      continue;
    }
    // 確定保留の繰り越し（n+子音 等）
    if (buf !== '' && unit.patterns.includes(buf) && ui + 1 < units.length) {
      const next = units[ui + 1];
      const m2 = matchUnit(next.patterns, ch);
      if (m2.valid) {
        if (m2.complete && !m2.extendable) {
          ui += 2;
          buf = '';
        } else {
          ui += 1;
          buf = ch;
        }
        continue;
      }
    }
    return false;
  }
  return ui === units.length && buf === '';
}

const cases: [string, string, boolean][] = [
  ['し', 'shi', true],
  ['し', 'si', true],
  ['し', 'su', false],
  ['がっこう', 'gakkou', true], // 促音
  ['しゃしん', 'syashinn', true], // 拗音＋撥音(nn)
  ['しゃしん', 'shashin', false], // 語末の ん は nn が必要（仕様）
  ['きっぷ', 'kippu', true], // 促音(p重ね)
  ['ほん', 'hon', false], // 語末の ん は nn が必要（仕様）
  ['ほん', 'honn', true],
  ['つづく', 'tsuduku', true],
  ['つづく', 'tuduku', true],
  ['ねこ', 'neko', true],
  ['げんき', 'genki', true], // ん の前が子音 → 単独 n でOK
  ['げんき', 'gennki', true], // nn でもOK
  ['しんかんせん', 'shinkansenn', true],
  ['、', ',', true],
];

let pass = 0;
for (const [text, input, expected] of cases) {
  const got = typeThrough(text, input);
  const ok = got === expected;
  if (ok) pass++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${text} <= "${input}" => ${got} (expected ${expected})`);
}
console.log(`\n${pass}/${cases.length} passed`);
if (pass !== cases.length) process.exit(1);

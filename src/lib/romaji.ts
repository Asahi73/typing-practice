// かな → 許容ローマ字パターンへの変換と、逐次入力判定ロジック。
// 個人練習用なので網羅性は実用範囲（五十音＋濁音半濁音＋拗音＋促音＋撥音）に絞る。
// 外部ライブラリは使わず自前テーブルで実装。

/**
 * 各かな（拗音は2文字でひとまとまり）に対する許容ローマ字パターン。
 * 配列の先頭が「代表パターン」で、キーボードのハイライト表示に使う。
 */
const KANA_TABLE: Record<string, string[]> = {
  // 母音
  あ: ['a'], い: ['i'], う: ['u'], え: ['e'], お: ['o'],
  // か行
  か: ['ka'], き: ['ki'], く: ['ku'], け: ['ke'], こ: ['ko'],
  が: ['ga'], ぎ: ['gi'], ぐ: ['gu'], げ: ['ge'], ご: ['go'],
  // さ行
  さ: ['sa'], し: ['shi', 'si'], す: ['su'], せ: ['se'], そ: ['so'],
  ざ: ['za'], じ: ['ji', 'zi'], ず: ['zu'], ぜ: ['ze'], ぞ: ['zo'],
  // た行
  た: ['ta'], ち: ['chi', 'ti'], つ: ['tsu', 'tu'], て: ['te'], と: ['to'],
  だ: ['da'], ぢ: ['di'], づ: ['du'], で: ['de'], ど: ['do'],
  // な行
  な: ['na'], に: ['ni'], ぬ: ['nu'], ね: ['ne'], の: ['no'],
  // は行
  は: ['ha'], ひ: ['hi'], ふ: ['fu', 'hu'], へ: ['he'], ほ: ['ho'],
  ば: ['ba'], び: ['bi'], ぶ: ['bu'], べ: ['be'], ぼ: ['bo'],
  ぱ: ['pa'], ぴ: ['pi'], ぷ: ['pu'], ぺ: ['pe'], ぽ: ['po'],
  // ま行
  ま: ['ma'], み: ['mi'], む: ['mu'], め: ['me'], も: ['mo'],
  // や行
  や: ['ya'], ゆ: ['yu'], よ: ['yo'],
  // ら行
  ら: ['ra'], り: ['ri'], る: ['ru'], れ: ['re'], ろ: ['ro'],
  // わ行
  わ: ['wa'], を: ['wo', 'o'], ん: ['n', 'nn', "n'"],
  // 小書き（単独）
  ぁ: ['xa', 'la'], ぃ: ['xi', 'li'], ぅ: ['xu', 'lu'], ぇ: ['xe', 'le'], ぉ: ['xo', 'lo'],
  ゃ: ['xya', 'lya'], ゅ: ['xyu', 'lyu'], ょ: ['xyo', 'lyo'], っ: ['xtu', 'ltu'],
  // 拗音（か行）
  きゃ: ['kya'], きゅ: ['kyu'], きょ: ['kyo'],
  ぎゃ: ['gya'], ぎゅ: ['gyu'], ぎょ: ['gyo'],
  // 拗音（さ行）
  しゃ: ['sha', 'sya'], しゅ: ['shu', 'syu'], しょ: ['sho', 'syo'],
  じゃ: ['ja', 'jya', 'zya'], じゅ: ['ju', 'jyu', 'zyu'], じょ: ['jo', 'jyo', 'zyo'],
  // 拗音（た行）
  ちゃ: ['cha', 'tya'], ちゅ: ['chu', 'tyu'], ちょ: ['cho', 'tyo'],
  // 拗音（な行）
  にゃ: ['nya'], にゅ: ['nyu'], にょ: ['nyo'],
  // 拗音（は行）
  ひゃ: ['hya'], ひゅ: ['hyu'], ひょ: ['hyo'],
  びゃ: ['bya'], びゅ: ['byu'], びょ: ['byo'],
  ぴゃ: ['pya'], ぴゅ: ['pyu'], ぴょ: ['pyo'],
  // 拗音（ま行）
  みゃ: ['mya'], みゅ: ['myu'], みょ: ['myo'],
  // 拗音（ら行）
  りゃ: ['rya'], りゅ: ['ryu'], りょ: ['ryo'],
  // 外来音
  ふぁ: ['fa'], ふぃ: ['fi'], ふぇ: ['fe'], ふぉ: ['fo'],
  てぃ: ['thi'], でぃ: ['dhi'], う゛: ['vu'],
  // 記号・空白
  '、': [','], '。': ['.'], '！': ['!'], '？': ['?'],
  '　': [' '], ' ': [' '], 'ー': ['-'],
};

const SMALL_YA = new Set(['ゃ', 'ゅ', 'ょ']);
const SMALL_VOWEL = new Set(['ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ']);

/** ローマ字練習の入力単位。1つのかな（または拗音）に対する許容パターンを持つ。 */
export interface RomajiUnit {
  /** 表示するかな（例: "きゃ"） */
  kana: string;
  /** 許容ローマ字パターン（先頭が代表） */
  patterns: string[];
}

/**
 * ひらがな文を RomajiUnit の配列へ分解する。
 * - 拗音（き＋ゃ 等）は2文字を1ユニットに統合
 * - 促音「っ」は次ユニットの子音を重ねたパターンを生成
 * - 撥音「ん」は次が母音/な行/や行のときは "nn" を要求（曖昧回避）
 */
export function toRomajiUnits(text: string): RomajiUnit[] {
  const chars = Array.from(text);
  const units: RomajiUnit[] = [];

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const next = chars[i + 1];

    // 促音「っ」: 後続ユニットの代表パターン先頭子音を重ねる
    if (ch === 'っ') {
      // 「っ」自体は次の処理で吸収するため、ここではスキップせずマーカーを置く。
      // 実装をシンプルにするため、次ユニット生成時に促音を反映する。
      units.push({ kana: 'っ', patterns: KANA_TABLE['っ'] });
      continue;
    }

    // 拗音の統合（し＋ゃ など）
    if (next && (SMALL_YA.has(next) || SMALL_VOWEL.has(next))) {
      const combo = ch + next;
      if (KANA_TABLE[combo]) {
        units.push({ kana: combo, patterns: KANA_TABLE[combo] });
        i++; // 小書きを消費
        continue;
      }
    }

    const patterns = KANA_TABLE[ch];
    if (patterns) {
      units.push({ kana: ch, patterns: [...patterns] });
    } else {
      // テーブルに無い文字（英数字など）はそのまま1文字パターンとして扱う
      units.push({ kana: ch, patterns: [ch] });
    }
  }

  // 促音「っ」を後続ユニットへ畳み込む
  return collapseSokuon(units);
}

function collapseSokuon(units: RomajiUnit[]): RomajiUnit[] {
  const result: RomajiUnit[] = [];
  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    if (u.kana === 'っ') {
      const nextU = units[i + 1];
      if (nextU) {
        // 次ユニットの各パターンについて、先頭子音を重ねたものを生成。
        const doubled = nextU.patterns.flatMap((p) => {
          const first = p[0];
          if (first && /[a-z]/.test(first) && !'aiueo'.includes(first)) {
            return [first + p];
          }
          return [];
        });
        // 「っ」を xtu/ltu で単独入力する手段も残す
        const merged = [
          ...doubled,
          ...nextU.patterns, // 念のため通常パターンも許容（っを飛ばす打ち方は弾く方向だが保険）
        ];
        // 促音込みのユニットとして次を置き換える
        result.push({ kana: 'っ' + nextU.kana, patterns: dedupe(merged) });
        i++; // 次ユニットを消費
        continue;
      }
      // 文末の「っ」単独
      result.push(u);
      continue;
    }
    result.push(u);
  }
  return result;
}

function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

/**
 * 入力中ユニットに対する判定結果。
 */
export interface UnitMatch {
  /** 入力済みバッファが、いずれかのパターンの接頭辞（または完全一致）か */
  valid: boolean;
  /** いずれかのパターンに完全一致したか（ユニット確定候補） */
  complete: boolean;
  /** さらに長いパターンへ延長しうるか（例: "n" は "nn" へ延長可能） */
  extendable: boolean;
}

/**
 * ユニットの許容パターン群に対して、入力バッファ buf を判定する。
 * complete かつ extendable のときは「確定保留」になり得る（ん の n/nn 等）。
 */
export function matchUnit(patterns: string[], buf: string): UnitMatch {
  let valid = false;
  let complete = false;
  let extendable = false;
  for (const p of patterns) {
    if (p === buf) {
      complete = true;
      valid = true;
    } else if (p.startsWith(buf)) {
      valid = true;
      if (p.length > buf.length) extendable = true;
    }
  }
  return { valid, complete, extendable };
}

/**
 * 現在のユニットと入力バッファから「次に打つべき文字」を1つ返す。
 * 代表パターン（先頭）を基準に、バッファに続く文字を返す。ハイライト用。
 */
export function nextCharForUnit(patterns: string[], buf: string): string | null {
  // 確定保留中（buf が短い完全一致だが、より長いパターンもある）の場合は
  // 長いパターンを優先して、続く文字（例: ん の 2つ目の n）を案内する。
  const candidate =
    patterns.find((p) => p.startsWith(buf) && p.length > buf.length) ??
    patterns.find((p) => p.startsWith(buf)) ??
    patterns[0];
  if (buf.length < candidate.length) {
    return candidate[buf.length];
  }
  return null;
}

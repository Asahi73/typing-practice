// QWERTY 配列の定義と、各キーの担当指マッピング。
// ブラインドタッチ練習の「次に押すキー＋担当指」ハイライトに使う。

export type Finger =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky'
  | 'thumb';

export interface KeyDef {
  /** 通常打鍵で出力される文字（小文字・記号）。Space は ' ' */
  key: string;
  /** Shift 同時押しで出力される文字（あれば） */
  shift?: string;
  /** 担当指 */
  finger: Finger;
  /** ホームポジションのキーか */
  home?: boolean;
  /** 表示用ラベル（指定が無ければ key を大文字化して表示） */
  label?: string;
  /** 表示上の横幅（1 = 標準キー幅の倍率） */
  width?: number;
}

// 段（row）ごとのキー配列。物理的な並びに近い形で定義。
export const KEY_ROWS: KeyDef[][] = [
  [
    { key: '`', shift: '~', finger: 'left-pinky' },
    { key: '1', shift: '!', finger: 'left-pinky' },
    { key: '2', shift: '@', finger: 'left-ring' },
    { key: '3', shift: '#', finger: 'left-middle' },
    { key: '4', shift: '$', finger: 'left-index' },
    { key: '5', shift: '%', finger: 'left-index' },
    { key: '6', shift: '^', finger: 'right-index' },
    { key: '7', shift: '&', finger: 'right-index' },
    { key: '8', shift: '*', finger: 'right-middle' },
    { key: '9', shift: '(', finger: 'right-ring' },
    { key: '0', shift: ')', finger: 'right-pinky' },
    { key: '-', shift: '_', finger: 'right-pinky' },
    { key: '=', shift: '+', finger: 'right-pinky' },
    { key: 'Backspace', finger: 'right-pinky', label: '⌫', width: 1.8 },
  ],
  [
    { key: 'Tab', finger: 'left-pinky', label: 'Tab', width: 1.5 },
    { key: 'q', shift: 'Q', finger: 'left-pinky' },
    { key: 'w', shift: 'W', finger: 'left-ring' },
    { key: 'e', shift: 'E', finger: 'left-middle' },
    { key: 'r', shift: 'R', finger: 'left-index' },
    { key: 't', shift: 'T', finger: 'left-index' },
    { key: 'y', shift: 'Y', finger: 'right-index' },
    { key: 'u', shift: 'U', finger: 'right-index' },
    { key: 'i', shift: 'I', finger: 'right-middle' },
    { key: 'o', shift: 'O', finger: 'right-ring' },
    { key: 'p', shift: 'P', finger: 'right-pinky' },
    { key: '[', shift: '{', finger: 'right-pinky' },
    { key: ']', shift: '}', finger: 'right-pinky' },
    { key: '\\', shift: '|', finger: 'right-pinky', width: 1.3 },
  ],
  [
    { key: 'CapsLock', finger: 'left-pinky', label: 'Caps', width: 1.8 },
    { key: 'a', shift: 'A', finger: 'left-pinky', home: true },
    { key: 's', shift: 'S', finger: 'left-ring', home: true },
    { key: 'd', shift: 'D', finger: 'left-middle', home: true },
    { key: 'f', shift: 'F', finger: 'left-index', home: true },
    { key: 'g', shift: 'G', finger: 'left-index' },
    { key: 'h', shift: 'H', finger: 'right-index' },
    { key: 'j', shift: 'J', finger: 'right-index', home: true },
    { key: 'k', shift: 'K', finger: 'right-middle', home: true },
    { key: 'l', shift: 'L', finger: 'right-ring', home: true },
    { key: ';', shift: ':', finger: 'right-pinky', home: true },
    { key: "'", shift: '"', finger: 'right-pinky' },
    { key: 'Enter', finger: 'right-pinky', label: '⏎', width: 2.0 },
  ],
  [
    { key: 'ShiftLeft', finger: 'left-pinky', label: 'Shift', width: 2.3 },
    { key: 'z', shift: 'Z', finger: 'left-pinky' },
    { key: 'x', shift: 'X', finger: 'left-ring' },
    { key: 'c', shift: 'C', finger: 'left-middle' },
    { key: 'v', shift: 'V', finger: 'left-index' },
    { key: 'b', shift: 'B', finger: 'left-index' },
    { key: 'n', shift: 'N', finger: 'right-index' },
    { key: 'm', shift: 'M', finger: 'right-index' },
    { key: ',', shift: '<', finger: 'right-middle' },
    { key: '.', shift: '>', finger: 'right-ring' },
    { key: '/', shift: '?', finger: 'right-pinky' },
    { key: 'ShiftRight', finger: 'right-pinky', label: 'Shift', width: 2.5 },
  ],
  [
    { key: ' ', finger: 'thumb', label: 'Space', width: 10 },
  ],
];

// 指ごとの表示色（ホームポジション学習の定番カラー分け）。
export const FINGER_COLORS: Record<Finger, string> = {
  'left-pinky': '#f06595',
  'left-ring': '#cc5de8',
  'left-middle': '#5c7cfa',
  'left-index': '#22b8cf',
  'right-index': '#51cf66',
  'right-middle': '#fcc419',
  'right-ring': '#ff922b',
  'right-pinky': '#ff6b6b',
  thumb: '#adb5bd',
};

export const FINGER_LABELS: Record<Finger, string> = {
  'left-pinky': '左小指',
  'left-ring': '左薬指',
  'left-middle': '左中指',
  'left-index': '左人差し指',
  'right-index': '右人差し指',
  'right-middle': '右中指',
  'right-ring': '右薬指',
  'right-pinky': '右小指',
  thumb: '親指',
};

// 文字 → その文字を打つために必要な情報（通常キー、Shift要否、担当指）を引くためのインデックス。
export interface CharInfo {
  /** 物理キーの基準文字（key プロパティ） */
  baseKey: string;
  /** Shift が必要か */
  needsShift: boolean;
  finger: Finger;
}

const CHAR_INDEX: Map<string, CharInfo> = (() => {
  const map = new Map<string, CharInfo>();
  for (const row of KEY_ROWS) {
    for (const k of row) {
      // 通常文字（1文字キーのみ対象。Tab/Enter 等の機能キーは除外）
      if (k.key.length === 1) {
        if (!map.has(k.key)) {
          map.set(k.key, { baseKey: k.key, needsShift: false, finger: k.finger });
        }
        if (k.shift && k.shift.length === 1 && !map.has(k.shift)) {
          map.set(k.shift, { baseKey: k.key, needsShift: true, finger: k.finger });
        }
      }
    }
  }
  return map;
})();

/** 1文字を打つのに必要なキー情報を返す（未知の文字は undefined）。 */
export function lookupChar(ch: string): CharInfo | undefined {
  return CHAR_INDEX.get(ch);
}

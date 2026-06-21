// ホームポジション練習用の段階別データ。
// 段階ごとに使う文字集合を定義し、ランダムな文字列を生成する。

export interface HomeStage {
  id: string;
  label: string;
  /** この段階で使う文字 */
  chars: string;
}

export const HOME_STAGES: HomeStage[] = [
  { id: 'home', label: 'ホーム段 (asdf jkl;)', chars: 'asdfjkl;' },
  { id: 'home-g-h', label: 'ホーム段＋gh', chars: 'asdfghjkl;' },
  { id: 'top', label: '上段 (qwerty...)', chars: 'qwertyuiop' },
  { id: 'bottom', label: '下段 (zxcvbnm...)', chars: 'zxcvbnm,./' },
  { id: 'all-letters', label: '全アルファベット', chars: 'abcdefghijklmnopqrstuvwxyz' },
];

/**
 * 指定文字集合から、空白区切りの「単語」列をランダム生成する。
 * @param chars 使用する文字
 * @param wordCount 単語数
 * @param wordLen 1単語の文字数
 */
export function generateHomeText(chars: string, wordCount = 12, wordLen = 4): string {
  const words: string[] = [];
  for (let w = 0; w < wordCount; w++) {
    let word = '';
    for (let i = 0; i < wordLen; i++) {
      word += chars[Math.floor(Math.random() * chars.length)];
    }
    words.push(word);
  }
  return words.join(' ');
}

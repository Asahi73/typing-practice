// 英単語・英文の練習お題集。短文中心で実用的なタイピング練習向け。

export const ENGLISH_TEXTS: string[] = [
  'the quick brown fox jumps over the lazy dog',
  'practice makes perfect when you type every day',
  'keep your fingers on the home row and relax',
  'a journey of a thousand miles begins with a single step',
  'good code is easy to read and simple to change',
  'never look down at the keyboard while you type',
  'speed will come naturally once accuracy is solid',
  'small steps each day lead to big results over time',
  'focus on rhythm rather than rushing each key',
  'consistency beats intensity for building any skill',
];

/** お題をランダムに1つ返す。 */
export function randomEnglishText(): string {
  return ENGLISH_TEXTS[Math.floor(Math.random() * ENGLISH_TEXTS.length)];
}

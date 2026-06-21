// WPM・正確率の計算と、モード別ベストスコアの localStorage 保存。

export interface SessionStats {
  /** 正解打鍵数（正しく入力された文字数） */
  correct: number;
  /** ミス打鍵数 */
  mistakes: number;
  /** 経過ミリ秒 */
  elapsedMs: number;
}

export interface ScoreResult {
  wpm: number;
  accuracy: number; // 0..1
  correct: number;
  mistakes: number;
  elapsedMs: number;
}

/** WPM = (正解打鍵数 / 5) ÷ 経過分。標準的な定義。 */
export function computeScore(s: SessionStats): ScoreResult {
  const minutes = s.elapsedMs / 1000 / 60;
  const wpm = minutes > 0 ? s.correct / 5 / minutes : 0;
  const total = s.correct + s.mistakes;
  const accuracy = total > 0 ? s.correct / total : 1;
  return {
    wpm: Math.round(wpm * 10) / 10,
    accuracy,
    correct: s.correct,
    mistakes: s.mistakes,
    elapsedMs: s.elapsedMs,
  };
}

export interface BestRecord {
  wpm: number;
  accuracy: number;
  updatedAt: number;
}

const KEY_PREFIX = 'typing-best:';

export function loadBest(mode: string): BestRecord | null {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + mode);
    return raw ? (JSON.parse(raw) as BestRecord) : null;
  } catch {
    return null;
  }
}

/**
 * 今回のスコアがベスト（WPM 基準）を上回れば保存する。
 * @returns ベスト更新したら true
 */
export function saveBestIfBetter(mode: string, result: ScoreResult): boolean {
  const prev = loadBest(mode);
  if (prev && prev.wpm >= result.wpm) {
    return false;
  }
  const record: BestRecord = {
    wpm: result.wpm,
    accuracy: result.accuracy,
    updatedAt: Date.now(),
  };
  try {
    localStorage.setItem(KEY_PREFIX + mode, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

// 入力判定と統計を扱うカスタムフック。
// ホーム/英語モードは「1文字＝1ユニット」、日本語モードはローマ字ユニットとして
// 同じ仕組みで扱えるよう、入力単位を TypingUnit に抽象化している。

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { matchUnit, nextCharForUnit, toRomajiUnits } from './romaji';
import { computeScore, type ScoreResult } from './stats';

export interface TypingUnit {
  /** 画面表示する文字（かな or 英字） */
  display: string;
  /** 許容ローマ字（英語/ホームは [文字そのもの]） */
  patterns: string[];
}

export type TypingMode = 'home' | 'pinky' | 'english' | 'japanese';

/** お題テキストとモードから入力ユニット列を作る。 */
export function buildUnits(text: string, mode: TypingMode): TypingUnit[] {
  if (mode === 'japanese') {
    return toRomajiUnits(text).map((u) => ({ display: u.kana, patterns: u.patterns }));
  }
  // 英語・ホーム・小指特訓: 1文字ずつ。文字そのものを唯一の許容パターンにする。
  return Array.from(text).map((ch) => ({ display: ch, patterns: [ch] }));
}

export interface TypingSessionState {
  units: TypingUnit[];
  /** 現在のユニット index */
  unitIndex: number;
  /** 現在ユニットに対して入力済みの文字列 */
  buffer: string;
  correct: number;
  mistakes: number;
  /** 直前の打鍵がミスだったか（UIフィードバック用） */
  lastError: boolean;
  done: boolean;
  startedAt: number | null;
  elapsedMs: number;
  /** 次に打つべき1文字（ハイライト用、無ければ null） */
  nextChar: string | null;
  result: ScoreResult | null;
}

export interface TypingSession extends TypingSessionState {
  /** 1文字の打鍵を処理する */
  handleChar: (ch: string) => void;
  /** セッションを初期状態に戻す（同じお題でやり直す場合は同じ units を維持） */
  reset: () => void;
}

export function useTypingSession(
  text: string,
  mode: TypingMode,
): TypingSession {
  const units = useMemo(() => buildUnits(text, mode), [text, mode]);

  const [unitIndex, setUnitIndex] = useState(0);
  const [buffer, setBuffer] = useState('');
  const [correct, setCorrect] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [lastError, setLastError] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [nowTick, setNowTick] = useState(0);

  const done = unitIndex >= units.length;

  // 経過時間の表示更新用タイマー（実行中のみ）。
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (startedAt === null || done) return;
    const tick = () => {
      setNowTick(Date.now());
      rafRef.current = window.setTimeout(tick, 200);
    };
    rafRef.current = window.setTimeout(tick, 200);
    return () => {
      if (rafRef.current !== null) window.clearTimeout(rafRef.current);
    };
  }, [startedAt, done]);

  const elapsedMs = useMemo(() => {
    if (startedAt === null) return 0;
    const end = endedAt ?? nowTick ?? Date.now();
    return Math.max(0, end - startedAt);
  }, [startedAt, endedAt, nowTick]);

  const reset = useCallback(() => {
    setUnitIndex(0);
    setBuffer('');
    setCorrect(0);
    setMistakes(0);
    setLastError(false);
    setStartedAt(null);
    setEndedAt(null);
    setNowTick(0);
  }, []);

  // お題が変わったらリセット。
  useEffect(() => {
    reset();
  }, [units, reset]);

  const handleChar = useCallback(
    (ch: string) => {
      if (unitIndex >= units.length) return; // 完了済み
      const unit = units[unitIndex];

      // 初回打鍵で計測開始。
      const started = startedAt ?? Date.now();
      if (startedAt === null) setStartedAt(started);

      const advanceTo = (nextIndex: number, nextBuf: string) => {
        setUnitIndex(nextIndex);
        setBuffer(nextBuf);
        if (nextIndex >= units.length) {
          setEndedAt(Date.now());
        }
      };

      const candidate = buffer + ch;
      const m = matchUnit(unit.patterns, candidate);

      if (m.valid) {
        setLastError(false);
        setCorrect((x) => x + 1);
        if (m.complete && !m.extendable) {
          // 確定（延長余地なし）→ 次ユニットへ。
          advanceTo(unitIndex + 1, '');
        } else {
          // 未確定、または「確定保留」（例: ん の n は nn へ延長しうる）。
          setBuffer(candidate);
        }
        return;
      }

      // candidate は無効。直前バッファが現ユニットを完成していた「確定保留」状態なら、
      // ここでユニットを確定し、今回の文字は次ユニットの先頭として扱う（n+子音 等）。
      if (buffer !== '' && unit.patterns.includes(buffer) && unitIndex + 1 < units.length) {
        const next = units[unitIndex + 1];
        const m2 = matchUnit(next.patterns, ch);
        if (m2.valid) {
          setLastError(false);
          setCorrect((x) => x + 1);
          if (m2.complete && !m2.extendable) {
            advanceTo(unitIndex + 2, '');
          } else {
            advanceTo(unitIndex + 1, ch);
          }
          return;
        }
      }

      // ミス: バッファは進めない。
      setMistakes((x) => x + 1);
      setLastError(true);
    },
    [units, unitIndex, buffer, startedAt],
  );

  const nextChar = useMemo(() => {
    if (done) return null;
    const unit = units[unitIndex];
    return nextCharForUnit(unit.patterns, buffer);
  }, [units, unitIndex, buffer, done]);

  const result = useMemo<ScoreResult | null>(() => {
    if (!done || startedAt === null) return null;
    return computeScore({ correct, mistakes, elapsedMs });
  }, [done, startedAt, correct, mistakes, elapsedMs]);

  return {
    units,
    unitIndex,
    buffer,
    correct,
    mistakes,
    lastError,
    done,
    startedAt,
    elapsedMs,
    nextChar,
    result,
    handleChar,
    reset,
  };
}

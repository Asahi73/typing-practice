// アプリ全体の状態管理とレイアウト。
// モード/お題の選択、タイピングセッション、結果表示を束ねる。

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ModeSelector } from './components/ModeSelector';
import { StatsBar } from './components/StatsBar';
import { TypingArea } from './components/TypingArea';
import { Keyboard } from './components/Keyboard';
import { ResultModal } from './components/ResultModal';
import { generateHomeText, HOME_STAGES } from './data/homeRow';
import { randomEnglishText } from './data/englishTexts';
import { randomJapaneseText } from './data/japaneseTexts';
import { useTypingSession, type TypingMode } from './lib/useTypingSession';
import { computeScore, loadBest, saveBestIfBetter, type BestRecord } from './lib/stats';
import './App.css';

/** モードと段階から新しいお題を1つ生成する。 */
function newText(mode: TypingMode, homeStageId: string): string {
  if (mode === 'home') {
    const stage = HOME_STAGES.find((s) => s.id === homeStageId) ?? HOME_STAGES[0];
    return generateHomeText(stage.chars);
  }
  if (mode === 'english') return randomEnglishText();
  return randomJapaneseText();
}

/** ベスト保存に使うキー（ホームは段階別に分ける）。 */
function bestKey(mode: TypingMode, homeStageId: string): string {
  return mode === 'home' ? `home:${homeStageId}` : mode;
}

export default function App() {
  const [mode, setMode] = useState<TypingMode>('home');
  const [homeStageId, setHomeStageId] = useState<string>(HOME_STAGES[0].id);
  const [text, setText] = useState<string>(() => newText('home', HOME_STAGES[0].id));

  const session = useTypingSession(text, mode);
  const { wpm, accuracy } = useMemo(() => {
    const s = computeScore({
      correct: session.correct,
      mistakes: session.mistakes,
      elapsedMs: session.elapsedMs,
    });
    return { wpm: s.wpm, accuracy: s.accuracy };
  }, [session.correct, session.mistakes, session.elapsedMs]);

  const [best, setBest] = useState<BestRecord | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);

  // モード/段階を変えたらお題を作り直す。
  const refreshText = useCallback((m: TypingMode, stage: string) => {
    setText(newText(m, stage));
  }, []);

  const handleModeChange = (m: TypingMode) => {
    setMode(m);
    refreshText(m, homeStageId);
  };

  const handleStageChange = (id: string) => {
    setHomeStageId(id);
    refreshText('home', id);
  };

  // 現在のベストを読み込む。
  useEffect(() => {
    setBest(loadBest(bestKey(mode, homeStageId)));
  }, [mode, homeStageId]);

  // セッション完了時にベスト判定・保存。
  useEffect(() => {
    if (!session.result) return;
    const key = bestKey(mode, homeStageId);
    const updated = saveBestIfBetter(key, session.result);
    setIsNewBest(updated);
    setBest(loadBest(key));
  }, [session.result, mode, homeStageId]);

  const handleNext = useCallback(() => {
    setIsNewBest(false);
    refreshText(mode, homeStageId);
  }, [mode, homeStageId, refreshText]);

  const handleRetry = useCallback(() => {
    setIsNewBest(false);
    session.reset();
  }, [session]);

  // 練習を中止して今のお題を最初からに戻す。
  const handleAbort = useCallback(() => {
    setIsNewBest(false);
    session.reset();
  }, [session]);

  // 練習中（開始済みかつ未完了）のときだけ中止ボタンを出す。
  const inProgress = session.startedAt !== null && !session.done;

  // 完了画面で Enter → 次のお題。
  useEffect(() => {
    if (!session.done) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [session.done, handleNext]);

  return (
    <div className="app">
      <header className="header">
        <h1 className="logo">タッチタイピング練習</h1>
        <p className="subtitle">手元を見ずに、画面のキーガイドだけで打ってみよう</p>
      </header>

      <ModeSelector
        mode={mode}
        onModeChange={handleModeChange}
        homeStageId={homeStageId}
        onHomeStageChange={handleStageChange}
      />

      <StatsBar
        wpm={wpm}
        accuracy={accuracy}
        elapsedMs={session.elapsedMs}
        mistakes={session.mistakes}
      />

      <TypingArea session={session} mode={mode} paused={session.done} />

      <div className="toolbar">
        <button
          className="abort"
          onClick={handleAbort}
          disabled={!inProgress}
        >
          中止
        </button>
        <button className="skip" onClick={handleNext}>
          別のお題に変える
        </button>
      </div>

      <Keyboard nextChar={session.nextChar} />

      {session.done && session.result && (
        <ResultModal
          result={session.result}
          best={best}
          isNewBest={isNewBest}
          onRetry={handleRetry}
          onNext={handleNext}
        />
      )}
    </div>
  );
}

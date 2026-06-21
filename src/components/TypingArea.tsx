// お題テキストの表示と打鍵入力の受け取り。
// window の keydown を購読し、印字可能な1文字をセッションへ渡す。

import { useEffect } from 'react';
import { FINGER_COLORS, FINGER_LABELS, lookupChar } from '../data/keyLayout';
import type { TypingMode, TypingSession } from '../lib/useTypingSession';
import styles from './TypingArea.module.css';

interface Props {
  session: TypingSession;
  mode: TypingMode;
  /** 完了済みなど、入力を受け付けない場合 true */
  paused: boolean;
}

export function TypingArea({ session, mode, paused }: Props) {
  const { units, unitIndex, buffer, lastError, handleChar, nextChar } = session;

  useEffect(() => {
    if (paused) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // 印字可能な1文字のみ対象（Enter/Backspace 等の制御キーは無視）。
      if (e.key.length !== 1) return;
      e.preventDefault();
      handleChar(e.key);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleChar, paused]);

  // 日本語モードでは、現在ユニットの代表ローマ字をヒント表示する。
  const currentUnit = units[unitIndex];
  const romajiHint =
    mode === 'japanese' && currentUnit
      ? currentUnit.patterns.find((p) => p.startsWith(buffer) && p.length > buffer.length) ??
        currentUnit.patterns.find((p) => p.startsWith(buffer)) ??
        currentUnit.patterns[0]
      : null;

  // 次に打つ1文字から担当指を引く（全モード共通）。お題のすぐ下に表示する。
  const fingerInfo = nextChar ? lookupChar(nextChar) : undefined;

  return (
    <div className={styles.area}>
      <div className={styles.text}>
        {units.map((u, i) => {
          let cls = styles.pending;
          if (i < unitIndex) cls = styles.done;
          else if (i === unitIndex) cls = lastError ? styles.errorChar : styles.current;
          // 空白は視認できるよう専用クラス。
          const isSpace = u.display === ' ' || u.display === '　';
          return (
            <span key={i} className={`${cls} ${isSpace ? styles.space : ''}`}>
              {isSpace ? '␣' : u.display}
            </span>
          );
        })}
      </div>

      {romajiHint && (
        <div className={styles.romaji}>
          {Array.from(romajiHint).map((c, i) => (
            <span key={i} className={i < buffer.length ? styles.romajiDone : styles.romajiPending}>
              {c}
            </span>
          ))}
        </div>
      )}

      {fingerInfo && (
        <div className={styles.finger}>
          <span
            className={styles.swatch}
            style={{ background: FINGER_COLORS[fingerInfo.finger] }}
          />
          <span>
            <strong>{FINGER_LABELS[fingerInfo.finger]}</strong>
            {fingerInfo.needsShift && '（反対の手で Shift）'}
          </span>
        </div>
      )}
    </div>
  );
}

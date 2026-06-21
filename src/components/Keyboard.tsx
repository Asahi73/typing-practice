// 画面上のキーボード図。次に押すキーと担当指をハイライトする。

import {
  FINGER_COLORS,
  KEY_ROWS,
  lookupChar,
  type Finger,
  type KeyDef,
} from '../data/keyLayout';
import styles from './Keyboard.module.css';

interface Props {
  /** 次に打つべき文字（無ければ null） */
  nextChar: string | null;
}

export function Keyboard({ nextChar }: Props) {
  const info = nextChar ? lookupChar(nextChar) : undefined;
  const targetBaseKey = info?.baseKey ?? null;
  const needsShift = info?.needsShift ?? false;
  const targetFinger: Finger | null = info?.finger ?? null;

  const isHighlighted = (k: KeyDef): boolean => {
    if (!targetBaseKey) return false;
    if (k.key === targetBaseKey) return true;
    // Shift が必要なら、ハイライトする側の Shift キーも光らせる。
    if (needsShift && (k.key === 'ShiftLeft' || k.key === 'ShiftRight')) {
      // ターゲット文字が左手なら右 Shift、右手なら左 Shift（反対の手）を使う。
      const useRightShift = targetFinger?.startsWith('left');
      return useRightShift ? k.key === 'ShiftRight' : k.key === 'ShiftLeft';
    }
    return false;
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.keyboard}>
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className={styles.row}>
            {row.map((k) => {
              const highlighted = isHighlighted(k);
              const color = FINGER_COLORS[k.finger];
              return (
                <div
                  key={k.key}
                  className={[
                    styles.key,
                    k.home ? styles.home : '',
                    highlighted ? styles.active : '',
                  ].join(' ')}
                  style={{
                    flexGrow: k.width ?? 1,
                    borderBottomColor: color,
                    ...(highlighted
                      ? { background: color, borderColor: color }
                      : {}),
                  }}
                >
                  {k.label ?? k.key.toUpperCase()}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

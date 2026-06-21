// モード選択（ホーム / 英語 / 日本語）と、ホーム段階の選択 UI。

import { HOME_STAGES } from '../data/homeRow';
import type { TypingMode } from '../lib/useTypingSession';
import styles from './ModeSelector.module.css';

interface Props {
  mode: TypingMode;
  onModeChange: (mode: TypingMode) => void;
  homeStageId: string;
  onHomeStageChange: (id: string) => void;
}

const MODES: { id: TypingMode; label: string }[] = [
  { id: 'home', label: 'ホームポジション' },
  { id: 'english', label: '英単語・英文' },
  { id: 'japanese', label: '日本語ローマ字' },
];

export function ModeSelector({ mode, onModeChange, homeStageId, onHomeStageChange }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.tabs}>
        {MODES.map((m) => (
          <button
            key={m.id}
            className={`${styles.tab} ${mode === m.id ? styles.activeTab : ''}`}
            onClick={() => onModeChange(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'home' && (
        <div className={styles.stages}>
          {HOME_STAGES.map((s) => (
            <button
              key={s.id}
              className={`${styles.stage} ${homeStageId === s.id ? styles.activeStage : ''}`}
              onClick={() => onHomeStageChange(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

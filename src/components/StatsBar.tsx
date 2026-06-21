// 練習中の統計表示（WPM / 正確率 / 経過時間 / ミス数）。

import styles from './StatsBar.module.css';

interface Props {
  wpm: number;
  accuracy: number; // 0..1
  elapsedMs: number;
  mistakes: number;
}

export function StatsBar({ wpm, accuracy, elapsedMs, mistakes }: Props) {
  const seconds = (elapsedMs / 1000).toFixed(1);
  return (
    <div className={styles.bar}>
      <Stat label="WPM" value={wpm.toFixed(0)} />
      <Stat label="正確率" value={`${Math.round(accuracy * 100)}%`} />
      <Stat label="時間" value={`${seconds}s`} />
      <Stat label="ミス" value={String(mistakes)} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}

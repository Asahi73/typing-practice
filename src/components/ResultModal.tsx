// セッション終了時の結果表示。ベスト更新の有無も示す。

import type { ScoreResult, BestRecord } from '../lib/stats';
import styles from './ResultModal.module.css';

interface Props {
  result: ScoreResult;
  best: BestRecord | null;
  isNewBest: boolean;
  onRetry: () => void;
  onNext: () => void;
}

export function ResultModal({ result, best, isNewBest, onRetry, onNext }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>完了！{isNewBest && ' 🎉 ベスト更新'}</h2>

        <div className={styles.grid}>
          <Metric label="WPM" value={result.wpm.toFixed(0)} highlight />
          <Metric label="正確率" value={`${Math.round(result.accuracy * 100)}%`} />
          <Metric label="時間" value={`${(result.elapsedMs / 1000).toFixed(1)}s`} />
          <Metric label="ミス" value={String(result.mistakes)} />
        </div>

        {best && (
          <p className={styles.best}>
            ベスト: {best.wpm.toFixed(0)} WPM / 正確率 {Math.round(best.accuracy * 100)}%
          </p>
        )}

        <div className={styles.actions}>
          <button className={styles.retry} onClick={onRetry}>
            同じお題でやり直す
          </button>
          <button className={styles.next} onClick={onNext}>
            次のお題へ
          </button>
        </div>
        <p className={styles.hint}>Enter キーでも「次のお題へ」</p>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={styles.metric}>
      <span className={`${styles.metricValue} ${highlight ? styles.highlight : ''}`}>
        {value}
      </span>
      <span className={styles.metricLabel}>{label}</span>
    </div>
  );
}

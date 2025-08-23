"use client";

import { useEffect, useMemo, useRef } from "react";
import styles from "../_styles/NumberField.module.css";

type Props = {
  value: string;                 // 例: "22:30" / "01:00"
  onChange: (v: string) => void; // 常に "HH:MM" で親へ返す
};

export default function SleepTimeField({ value, onChange }: Props) {
  // 設定
  const STEP_MIN = 30;                 // 30分刻み
  const MIN_MIN = 18 * 60;             // 18:00 → 1080
  const MAX_MIN = 28 * 60;             // 翌日3:30(=1650分) ←★修正
  const DEFAULT_MIN = 23 * 60;         // 23:00

  // "HH:MM" → 分
  const toMinutes = (time: string): number => {
    const [h, m] = time.split(":").map(Number);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return DEFAULT_MIN;
    let total = h * 60 + m;
    // 0〜4:00 までは翌日扱いで+24hして計算 ←★<= に修正
    if (total <= 4 * 60) total += 24 * 60;
    return total;
  };

  // 分 → "HH:MM"（常に24時間表記）
  const toTimeString = (minutes: number): string => {
    const mm = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60); // 0..1439
    const h = Math.floor(mm / 60);
    const m = mm % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  // 現在の分数値（clampで範囲内に）
  const currentMinutes = useMemo(() => {
    if (!value) return DEFAULT_MIN;
    let m = toMinutes(value);
    if (m < MIN_MIN) m = MIN_MIN;
    if (m > MAX_MIN) m = MAX_MIN;
    return m;
  }, [value]);

  // clamp & step
  const clamp = (n: number) => Math.min(MAX_MIN, Math.max(MIN_MIN, n));
  const roundToStep = (n: number) => Math.round(n / STEP_MIN) * STEP_MIN;

  // スライダー変更
  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = clamp(roundToStep(parseInt(e.target.value, 10)));
    onChange(toTimeString(next));
  };

  // 長押し対応
  const intervalRef = useRef<number | null>(null);

  const changeBy = (deltaMin: number) => {
    const next = clamp(roundToStep(currentMinutes + deltaMin));
    onChange(toTimeString(next));
  };

  const startHold = (deltaMin: number) => {
    changeBy(deltaMin);
    stopHold();
    intervalRef.current = window.setInterval(() => {
      changeBy(deltaMin);
    }, 100);
  };

  const stopHold = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopHold();
  }, []);

  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor="sleep-range">
        就寝時間
      </label>

      {/* 現在値の表示 */}
      <div className={styles.valueRow} aria-live="polite">
        <span className={styles.valueBadge}>
          {toTimeString(currentMinutes)}
        </span>
      </div>

      {/* スライダー */}
      <input
        id="sleep-range"
        className={styles.range}
        type="range"
        min={MIN_MIN}
        max={MAX_MIN}              
        step={STEP_MIN}
        value={currentMinutes}
        onChange={handleSlider}
        aria-label="就寝時間スライダー"
      />

      {/* ±30分ボタン */}
      <div className={styles.stepperRow}>
        <button
          type="button"
          className={styles.btn}
          onMouseDown={() => startHold(-STEP_MIN)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold(-STEP_MIN)}
          onTouchEnd={stopHold}
          onTouchCancel={stopHold}
        >
          −30分
        </button>

        <button
          type="button"
          className={styles.btn}
          onMouseDown={() => startHold(STEP_MIN)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold(STEP_MIN)}
          onTouchEnd={stopHold}
          onTouchCancel={stopHold}
        >
          +30分
        </button>
      </div>
    </div>
  );
}

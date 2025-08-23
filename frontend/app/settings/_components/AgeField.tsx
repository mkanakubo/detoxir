"use client";

import { useEffect, useRef } from "react";
import styles from "../_styles/NumberField.module.css";

type Props = {
  value: string;                 // 親から受け取る値（文字列でOK）
  onChange: (v: string) => void; // 親へ返す変更ハンドラ
};

export default function AgeField({ value, onChange }: Props) {
  // 年齢用のしきい値
  const MIN = 0;     // 0 歳から
  const MAX = 100;   // 120 歳まで
  const STEP = 1;    // 1 歳刻み
  const DEFAULT = 20; // 初期表示（valueが空のとき）

  // 文字列の value を数値に変換（空なら DEFAULT）
  const current: number = (() => {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : DEFAULT;
  })();

  const clamp = (n: number) => Math.min(MAX, Math.max(MIN, n));
  const roundToStep = (n: number) => Math.round(n / STEP) * STEP;

  // 年齢は整数表示に固定
  const format = (n: number) => String(Math.round(n));

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value); // スライダーは string を返すのでそのまま親へ
  };

  // 長押しで連続加減算
  const intervalRef = useRef<number | null>(null);

  const changeBy = (delta: number) => {
    const next = clamp(roundToStep(current + delta));
    onChange(String(next));
  };

  const startHold = (delta: number) => {
    // 1回分すぐに反映
    changeBy(delta);
    // その後は100ms毎に連続反映
    stopHold();
    intervalRef.current = window.setInterval(() => {
      changeBy(delta);
    }, 100);
  };

  const stopHold = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    // アンマウント時に確実に停止
    return () => stopHold();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor="age-range">
        年齢
      </label>

      {/* 現在値の表示 */}
      <div className={styles.valueRow} aria-live="polite">
        <span className={styles.valueBadge}>{format(current)}</span>
        <span className={styles.unit}>歳</span>
      </div>

      {/* スライダー（手打ち不要） */}
      <input
        id="age-range"
        className={styles.range}
        type="range"
        min={MIN}
        max={MAX}
        step={STEP}
        value={current}
        onChange={handleSlider}
        aria-label="年齢スライダー"
      />

      {/* ± ボタン（クリック・長押し対応 / タッチ対応） */}
      <div className={styles.stepperRow}>
        <button
          type="button"
          className={styles.btn}
          aria-label="年齢を 1歳 減らす"
          onMouseDown={() => startHold(-1)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold(-1)}
          onTouchEnd={stopHold}
          onTouchCancel={stopHold}
        >
          −1 歳
        </button>

        <button
          type="button"
          className={styles.btn}
          aria-label="年齢を 1歳 増やす"
          onMouseDown={() => startHold(1)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold(1)}
          onTouchEnd={stopHold}
          onTouchCancel={stopHold}
        >
          +1 歳
        </button>
      </div>
    </div>
  );
}

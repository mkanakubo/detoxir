// app/_components/Chart.tsx
"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";


// "HH:MM" を [hour, minute] にする
function splitHM(hhmm: string): { h: number; m: number } {
  const [h, m] = hhmm.split(":").map((v) => parseInt(v, 10));
  return { h, m };
}

// a,b の時刻差(分)を「a から b まで前に進む」方向で計算（翌日跨ぎ対応）
function diffMinutesForward(fromHHMM: string, toHHMM: string): number {
  const a = splitHM(fromHHMM);
  const b = splitHM(toHHMM);
  const aMin = a.h * 60 + a.m;
  let bMin = b.h * 60 + b.m;
  // 翌日に回す必要があれば 24h 足す
  if (bMin < aMin) bMin += 24 * 60;
  return bMin - aMin;
}

// 0分からの経過分を "HH:MM" として表示（開始は startHHMM ）
function addMinutesAsHHMM(startHHMM: string, offsetMin: number): string {
  const s = splitHM(startHHMM);
  let total = s.h * 60 + s.m + offsetMin;
  total = ((total % (24 * 60)) + (24 * 60)) % (24 * 60); // 0..1439 に正規化
  const h = Math.floor(total / 60);
  const m = total % 60;
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return `${hh}:${mm}`;
}

// 毎時 60 分刻みの tick（0,60,120, ...）を作る
function buildHourlyTicks(maxOffsetMin: number): number[] {
  const ticks: number[] = [];
  for (let t = 0; t <= maxOffsetMin; t += 60) ticks.push(t);
  // 端がちょうど 60 の倍数でないとき、最後の端も追加
  if (ticks[ticks.length - 1] !== maxOffsetMin) ticks.push(maxOffsetMin);
  return ticks;
}

// === 2) 入力データ（例） ===
// 抜けがあってもOK！ 等間隔表示にします
const rawData = [
  { time: "18:00", concentration: 0.5 },
  { time: "19:00", concentration: 1.2 },
  { time: "20:53", concentration: 2.8 },
  { time: "21:12", concentration: 3.5 },
  { time: "22:00", concentration: 4.0 },
  // 23:00, 24:00, 01:00, 02:00, 03:00 は欠けている
  { time: "04:46", concentration: 0.3 },
  { time: "05:12", concentration: 0.1 },
  { time: "06:00", concentration: 0.0 },
];

type Props = {
  // 就寝時間（例 "22:00"）
  sleepTime?: string;
  // タイムラインの開始時刻（例 "18:00"）— 明示する方が安定
  startTime?: string;
};

export default function Chart({ sleepTime = "22:00", startTime = "18:00" }: Props) {
  // === 3) データを「開始からの分数」に変換 ===
  const dataWithOffset = rawData.map((d) => ({
    ...d,
    // x 軸用の数値キー t: startTime から d.time までの経過分
    t: diffMinutesForward(startTime, d.time),
  }));

  // グラフ範囲の右端：データ中の最大オフセット
  const maxOffset = dataWithOffset.reduce((mx, d) => Math.max(mx, d.t), 0);

  // X軸の毎時 tick（0, 60, 120, ...）
  const ticks = buildHourlyTicks(maxOffset);

  // 就寝縦線の位置
  const sleepOffset = diffMinutesForward(startTime, sleepTime);

  return (
    <div
      style={{
        width: "90%",
        marginLeft: "5%",
        marginBottom: "60px",
        borderRadius: "10px",
        border: "2px solid #39FF14",
        backgroundColor: "#1e1e1e",
        color: "#888",
        padding: "8px",
        boxSizing: "border-box",
        height: 380,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={dataWithOffset}
          margin={{ top: 20, right: 20, bottom: 10, left: -40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />

          {/* ★ X軸は "数値" として扱い、等間隔（毎時）tick を自前で指定 */}
          <XAxis
            dataKey="t"          // 数値キー
            type="number"        // 数値軸にするのがコツ
            domain={[0, maxOffset]}
            ticks={ticks}        // 0,60,120... の等間隔
            stroke="#bbb"
            tickFormatter={(v) => addMinutesAsHHMM(startTime, Number(v))} // 表示は HH:MM
          />

          <YAxis
            stroke="#bbb"
            domain={[0, 4.5]}
            ticks={[1.0, 2.0, 3.0, 4.0]}
          />

          <Tooltip
            contentStyle={{ background: "#121212", border: "1px solid #2a2a2a", borderRadius: 8 }}
            labelStyle={{ color: "#ddd" }}
            itemStyle={{ color: "#ddd" }}
            // ラベル（X）の表示を HH:MM に
            labelFormatter={(value) => addMinutesAsHHMM(startTime, Number(value))}
          />

          {/* 濃度の折れ線（データが飛んでいてもXは等間隔） */}
          <Line
            type="monotone"
            dataKey="concentration"
            stroke="#39FF14"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#39FF14" }}
            activeDot={{ r: 6 }}
          />

          {/* 就寝時間の縦線：X も分数（sleepOffset）で指定 */}
          <ReferenceLine
            x={sleepOffset}
            stroke="red"
            strokeWidth={2}
            label={{ value: "就寝", position: "top", fill: "#888" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

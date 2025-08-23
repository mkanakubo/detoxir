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
  { time: "20:53", concentration: 4.8 },
  { time: "21:12", concentration: 3.5 },
  { time: "22:00", concentration: 3.0 },
  // 23:00, 24:00, 01:00, 02:00, 03:00 は欠けている
  { time: "04:46", concentration: 0.3 },
  { time: "05:12", concentration: 2.1 },
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
    <div className="relative">
      {/* グロー効果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-blue-500/10 rounded-2xl blur-xl"></div>
      
      {/* メインチャート容器 */}
      <div className="relative bg-gray-800/40 backdrop-blur-lg border border-gray-600/30 rounded-2xl p-6 shadow-2xl">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-3 animate-pulse"></div>
              カフェイン濃度推移
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>濃度レベル</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>就寝時間</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-400">体内のカフェイン濃度の変化をリアルタイムで確認</p>
        </div>

        {/* チャートエリア */}
        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/30" style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dataWithOffset}
              margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
            >
              {/* グラデーション定義 */}
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="50%" stopColor="#34D399" />
                  <stop offset="100%" stopColor="#6EE7B7" />
                </linearGradient>
              </defs>

              {/* グリッド */}
              <CartesianGrid 
                strokeDasharray="2 4" 
                stroke="#374151" 
                strokeOpacity={0.3}
                vertical={false}
              />

              {/* X軸 */}
              <XAxis
                dataKey="t"
                type="number"
                domain={[0, maxOffset]}
                ticks={ticks}
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => addMinutesAsHHMM(startTime, Number(v))}
              />

              {/* Y軸 */}
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                domain={[0, 3.0]}
                ticks={[0, 1.0, 2.0, 3.0]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}mg/L`}
              />

              {/* ツールチップ */}
              <Tooltip
                contentStyle={{ 
                  background: 'rgba(17, 24, 39, 0.95)', 
                  border: '1px solid rgba(75, 85, 99, 0.5)', 
                  borderRadius: '12px',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
                labelStyle={{ color: "#F3F4F6", fontWeight: '600' }}
                itemStyle={{ color: "#10B981" }}
                labelFormatter={(value) => `時刻: ${addMinutesAsHHMM(startTime, Number(value))}`}
                formatter={(value) => [`${value} mg/L`, 'カフェイン濃度']}
              />

              {/* メインライン */}
              <Line
                type="monotone"
                dataKey="concentration"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{ 
                  r: 5, 
                  fill: "#10B981", 
                  strokeWidth: 2, 
                  stroke: "#065F46" 
                }}
                activeDot={{ 
                  r: 7, 
                  fill: "#34D399",
                  strokeWidth: 3,
                  stroke: "#065F46",
                  filter: "drop-shadow(0 0 8px rgba(52, 211, 153, 0.5))"
                }}
              />

              {/* 就寝時間の縦線 */}
              <ReferenceLine
                x={sleepOffset}
                stroke="#EF4444"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{ 
                  value: "💤 就寝", 
                  position: "top", 
                  fill: "#EF4444",
                  fontSize: 12,
                  fontWeight: 600
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* フッター情報 */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>🎯 目標: 2.0mg/L以下</span>
            <span>⚡ 代謝率: 85%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>リアルタイム更新</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-cyan-500/10 rounded-2xl blur-xl"></div>
      
      {/* メインチャート容器 */}
      <div className="relative bg-slate-700/20 backdrop-blur-lg border border-slate-600/25 rounded-2xl p-4 shadow-2xl">
        {/* ヘッダー - よりコンパクトに */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full mr-2 animate-pulse"></div>
              カフェイン濃度推移
            </h3>
            <div className="flex items-center space-x-3 text-xs text-slate-400">
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                <span>濃度</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                <span>就寝</span>
              </div>
            </div>
          </div>
        </div>

        {/* チャートエリア - 大幅に拡大 */}
        <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/30" style={{ height: 480 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dataWithOffset}
              margin={{ top: 17, right: 15, bottom: 10, left: 3 }}
            >
              {/* グラデーション定義 */}
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="50%" stopColor="#06D6A0" />
                  <stop offset="100%" stopColor="#0891B2" />
                </linearGradient>
              </defs>

              {/* グリッド */}
              <CartesianGrid 
                strokeDasharray="2 4" 
                stroke="#475569" 
                strokeOpacity={0.3}
                vertical={false}
              />

              {/* X軸 */}
              <XAxis
                dataKey="t"
                type="number"
                domain={[0, maxOffset]}
                ticks={ticks}
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => addMinutesAsHHMM(startTime, Number(v))}
              />

              {/* Y軸 */}
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                width={40}
                domain={[0, 5.0]}
                ticks={[0, 1.0, 2.0, 3.0, 4.0, 5.0]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}mg/L`}
                tick={{ dx: -5 }}
              />

              {/* ツールチップ */}
              <Tooltip
                contentStyle={{ 
                  background: 'rgba(15, 23, 42, 0.95)', 
                  border: '1px solid rgba(71, 85, 105, 0.5)', 
                  borderRadius: '12px',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
                labelStyle={{ color: "#F1F5F9", fontWeight: '600' }}
                itemStyle={{ color: "#10B981" }}
                labelFormatter={(value) => `時刻: ${addMinutesAsHHMM(startTime, Number(value))}`}
                formatter={(value) => [`${value} mg/L`, 'カフェイン濃度']}
              />

              {/* メインライン */}
              <Line
                type="monotone"
                dataKey="concentration"
                stroke="url(#lineGradient)"
                strokeWidth={4}
                dot={{ 
                  r: 6, 
                  fill: "#10B981", 
                  strokeWidth: 3, 
                  stroke: "#064E3B" 
                }}
                activeDot={{ 
                  r: 10, 
                  fill: "#06D6A0",
                  strokeWidth: 4,
                  stroke: "#064E3B",
                  filter: "drop-shadow(0 0 15px rgba(6, 214, 160, 0.7))"
                }}
              />

              {/* 就寝時間の縦線 */}
              <ReferenceLine
                x={sleepOffset}
                stroke="#EF4444"
                strokeWidth={3}
                strokeDasharray="6 6"
                label={{ 
                  value: "💤 就寝", 
                  position: "top", 
                  fill: "#EF4444",
                  fontSize: 14,
                  fontWeight: 600
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* フッター情報 - コンパクトに */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span>🎯</span>
              <span>目標: 2.0mg/L以下</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>⚡</span>
              <span>代謝率: 85%</span>
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
            <span>リアルタイム更新</span>
          </div>
        </div>
      </div>
    </div>
  );
}

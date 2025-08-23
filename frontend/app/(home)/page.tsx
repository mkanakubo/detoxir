'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from '@auth0/nextjs-auth0';
import MeasureStartButton from './_components/MeasureStartButton';
import DrinkImage from '../_shared/DrinkImage';
import TimerDisplay from '../_shared/TimerDisplay';
import Chart from '../_shared/Chart';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading) {               // ローディングが終わったら
      if (!user) {                  // ユーザーがいなければ
        router.push("/auth/login"); // ログインページへ
      }
    }
  }, [isLoading, user, router]);

  // ログイン済みの場合だけ本来の画面を表示
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 pb-24">
      {/* ヘッダーエリア */}
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Detoxir
          </h1>
          <p className="text-gray-400 text-sm">カフェイン摂取量を管理しよう</p>
        </div>

        {/* START ボタン */}
        <MeasureStartButton />

        {/* 現在の状態表示エリア */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-gray-700/50 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <DrinkImage src={""} alt={""} />
            <TimerDisplay />
          </div>
          
          {/* ステータス表示 */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-700/50 rounded-xl p-3">
              <div className="text-green-400 text-lg font-bold">0mg</div>
              <div className="text-gray-400 text-xs">今日の摂取量</div>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-3">
              <div className="text-blue-400 text-lg font-bold">2</div>
              <div className="text-gray-400 text-xs">回数</div>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-3">
              <div className="text-purple-400 text-lg font-bold">85%</div>
              <div className="text-gray-400 text-xs">代謝率</div>
            </div>
          </div>
        </div>

        {/* チャートエリア */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            カフェイン濃度推移
          </h2>
          <Chart />
        </div>
      </div>
    </main>
  );
}

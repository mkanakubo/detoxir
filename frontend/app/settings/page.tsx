"use client";

import { useState } from "react";
import Link from "next/link";
import { Undo2, Save, User, Clock, Weight } from "lucide-react";
import { toast } from "react-hot-toast";
import WeightField from "./_components/WeightField";
import AgeField from "./_components/AgeField";
import SleepTimeField from "./_components/SleepTimeField";

export default function SettingsPage() {
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [sleepTime, setSleepTime] = useState("23:00");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // 仮のユーザーID（Auth0実装時に user.sub に変更）
    const userSub = "demo-user-" + Date.now();

    if (!weight || !age || !sleepTime) {
      toast.error("すべての項目を入力してください");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sub: userSub,
          weight,
          age,
          sleepTime,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("設定を保存しました！");
      } else {
        toast.error(data.error || "保存に失敗しました");
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error("保存中にエラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-4 pb-24">
      <div className="max-w-md mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              設定
            </h1>
            <p className="text-slate-400 text-sm mt-1 font-medium">あなたの情報を管理</p>
          </div>
          <Link 
            href="/" 
            aria-label="ホームへ戻る" 
            className="group relative p-3 bg-slate-700/40 hover:bg-slate-600/50 rounded-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-slate-600/30"
          >
            <Undo2 size={20} className="text-slate-300 group-hover:text-emerald-400 transition-colors duration-200" />
          </Link>
        </div>

        {/* メイン設定カード */}
        <div className="relative">
          {/* グロー効果 */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/8 to-cyan-500/8 rounded-3xl blur-2xl"></div>
          
          {/* メインカード */}
          <div className="relative bg-slate-800/40 backdrop-blur-xl border border-slate-600/40 rounded-3xl p-8 shadow-2xl">
            {/* 設定項目 */}
            <div className="space-y-8">
              {/* 体重設定 */}
              <div className="bg-slate-700/20 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/25 hover:border-emerald-500/30 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mr-3">
                    <Weight size={20} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-100">体重</h3>
                </div>
                <WeightField value={weight} onChange={setWeight} />
                <p className="text-sm text-slate-400 mt-3 font-medium">カフェイン代謝計算に使用されます</p>
              </div>

              {/* 年齢設定 */}
              <div className="bg-slate-700/20 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/25 hover:border-cyan-500/30 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mr-3">
                    <User size={20} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-100">年齢</h3>
                </div>
                <AgeField value={age} onChange={setAge} />
                <p className="text-sm text-slate-400 mt-3 font-medium">代謝速度の算出に影響します</p>
              </div>

              {/* 就寝時間設定 */}
              <div className="bg-slate-700/20 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/25 hover:border-purple-500/30 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                    <Clock size={20} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-100">就寝時間</h3>
                </div>
                <SleepTimeField value={sleepTime} onChange={setSleepTime} />
                <p className="text-sm text-slate-400 mt-3 font-medium">睡眠に影響するカフェイン摂取を管理</p>
              </div>
            </div>

            {/* 保存ボタン */}
            <div className="mt-8">
              <button  
                className="w-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 hover:from-emerald-600 hover:via-cyan-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center space-x-3 border border-emerald-400/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                onClick={handleSave}
                disabled={isSaving}
              >
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Save size={16} />
                  )}
                </div>
                <span className="text-lg">
                  {isSaving ? "保存中..." : "設定を保存"}
                </span>
              </button>
            </div>

            {/* 追加情報 */}
            <div className="mt-6 p-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-600/25">
              <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center">
                <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mr-3"></div>
                データ管理について
              </h4>
              <div className="space-y-2 text-sm text-slate-400 leading-relaxed">
                <p>• 入力された情報はバックエンドサーバーに安全に保存されます</p>
                <p>• カフェイン代謝計算と個人の健康管理にのみ使用されます</p>
                <p>• データは暗号化されて保護されます</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

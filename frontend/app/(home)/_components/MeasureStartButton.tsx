"use client";
import { useRouter } from "next/navigation";
import { Camera, Zap } from "lucide-react";

export default function MeasureStartButton() {
  const router = useRouter();

  return (
    <button
      className="relative w-full mb-8 group"
      onClick={() =>router.push("/camera")}
    >
      {/* グラデーション背景 */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
      
      {/* メインボタン */}
      <div className="relative bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 text-gray-900 font-bold py-6 px-8 rounded-2xl shadow-2xl transform group-hover:scale-105 group-active:scale-95 transition-all duration-200">
        <div className="flex items-center justify-center space-x-3">
          <Camera size={28} className="group-hover:animate-pulse" />
          <span className="text-xl">商品をスキャン</span>
          <Zap size={24} className="group-hover:animate-bounce" />
        </div>
        <div className="text-sm font-medium opacity-80 mt-1">
          バーコードを読み取ってカフェイン量を測定
        </div>
      </div>
    </button>
  );
}

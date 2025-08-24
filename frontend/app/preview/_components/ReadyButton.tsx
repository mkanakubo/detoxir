"use client";
import { useRouter } from "next/navigation";

export default function ReadyButton() {
  const router = useRouter();

  return (
    <div className="w-[90%] ml-[5%] flex gap-3">
      {/* Cancel ボタン（左側） */}
      <button
        className="relative flex-1 group"
        onClick={() => router.push("/")}
      >
        {/* グラデーション背景 */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-pink-500 to-red-600 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>

        {/* メインボタン */}
        <div className="relative bg-gradient-to-r from-red-400 via-pink-500 to-red-600 text-gray-900 font-bold py-3 rounded-xl shadow-2xl transform group-hover:scale-105 group-active:scale-95 transition-all duration-200 text-center">
          Cancel
        </div>
      </button>

      {/* Start ボタン */}
      <button
        className="relative flex-1 group"
        onClick={() => router.push("/")}
      >
        {/* グラデーション背景 */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>

        {/* メインボタン */}
        <div className="relative bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 text-gray-900 font-bold py-3 rounded-xl shadow-2xl transform group-hover:scale-105 group-active:scale-95 transition-all duration-200 text-center">
          Start
        </div>
      </button>
    </div>
  );
}

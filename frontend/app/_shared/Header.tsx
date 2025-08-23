"use client";
import Link from "next/link";
import { Zap, User } from "lucide-react";

export default function Header() {
  return (
    <header className="relative bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
      {/* グラデーション背景 */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"></div>
      
      <div className="relative flex items-center justify-between px-6 py-4">
        {/* ロゴエリア */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative">
            {/* アイコンのグロー効果 */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-gradient-to-r from-green-400 to-blue-500 p-2 rounded-xl">
              <Zap size={24} className="text-gray-900" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Detoxir
            </h1>
            <p className="text-xs text-gray-400 -mt-1">Caffeine Tracker</p>
          </div>
        </Link>

        {/* ユーザーエリア */}
        <div className="flex items-center space-x-4">
          {/* ユーザーアバター */}
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center border-2 border-gray-600 hover:border-green-400/50 transition-colors">
              <User size={20} className="text-gray-300" />
            </div>
            {/* オンラインインジケーター */}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    </header>
  );
}

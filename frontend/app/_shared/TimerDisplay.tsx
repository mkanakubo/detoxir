// TimerDisplay.tsx
"use client";
import { Clock, Activity } from "lucide-react";

export default function TimerDisplay() {
  return (
    <div className="flex-1 ml-4">
      {/* メインタイマー表示 */}
      <div className="bg-gradient-to-r from-gray-700/60 to-gray-600/60 backdrop-blur-lg border border-gray-600/50 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-blue-400" />
            <span className="text-gray-300 text-sm font-medium">最後の摂取から</span>
          </div>
          <Activity size={16} className="text-green-400 animate-pulse" />
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-mono font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            00:12:34
          </div>
          <div className="text-xs text-gray-400 mt-1">
            代謝進行中
          </div>
        </div>
        
        {/* プログレスバー */}
        <div className="mt-3 bg-gray-800/50 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-1000"
            style={{ width: '34%' }}
          ></div>
        </div>
      </div>
    </div>
  );
}

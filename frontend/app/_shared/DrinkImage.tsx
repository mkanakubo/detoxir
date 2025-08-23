// DrinkImage.tsx
"use client";
import Image from "next/image";
import { Coffee } from "lucide-react";

type DrinkImageProps = {
  src: string;   // 画像のURL
  alt: string;   // 代替テキスト
};

export default function DrinkImage({ src, alt }: DrinkImageProps) {
  return (
    <div className="relative">
      {/* グロー効果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-2xl blur-xl"></div>
      
      {/* メイン容器 */}
      <div className="relative bg-gray-700/60 backdrop-blur-lg border border-gray-600/50 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-green-400/50">
        {src ? (
          <Image 
            src={src} 
            alt={alt} 
            width={80}
            height={80}
            className="rounded-xl object-cover"
          />
        ) : (
          <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center">
            <Coffee size={32} className="text-gray-400" />
          </div>
        )}
        
        {/* インジケーター */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-gray-800 shadow-lg"></div>
      </div>
    </div>
  );
}

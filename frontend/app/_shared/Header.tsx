"use client";
import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import { useUser } from '@auth0/nextjs-auth0';

export default function Header() {
  const { user, isLoading } = useUser();

  return (
    <header className="relative bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
      {/* グラデーション背景 */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"></div>
      
      <div className="relative flex items-center justify-between px-6 py-4">
        {/* ロゴエリア */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative">
            {/* ロゴ画像のグロー効果 */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-gradient-to-r from-green-400 to-blue-500 p-3 rounded-xl">
              <Image
                src="/detoxir/logo.webp"
                alt="Detoxir Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Detoxir
            </h1>
          </div>
        </Link>

        {/* ユーザーエリア */}
        <div className="flex items-center space-x-4">
          {/* ユーザーアバター */}
          <div className="relative">
            {!isLoading && user ? (
              <div className="relative group">
                {user.picture ? (
                  <Image
                    src={user.picture}
                    alt={user.name || 'User avatar'}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full border-2 border-gray-600 hover:border-green-400/50 transition-colors object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center border-2 border-gray-600 hover:border-green-400/50 transition-colors">
                    <User size={20} className="text-gray-300" />
                  </div>
                )}
                {/* オンラインインジケーター */}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-gray-900"></div>
                
                {/* ユーザー名のツールチップ */}
                {user.name && (
                  <div className="absolute top-12 right-0 bg-gray-800/95 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    {user.name}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center border-2 border-gray-600 animate-pulse">
                <User size={20} className="text-gray-300" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

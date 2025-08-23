// Footer.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, LayoutDashboard, ChartLine, Camera } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      icon: LayoutDashboard,
      label: "ホーム",
      ariaLabel: "Dashboard"
    },
    {
      href: "/analyze",
      icon: ChartLine,
      label: "分析",
      ariaLabel: "Analyze"
    },
    {
      href: "/settings",
      icon: Settings,
      label: "設定",
      ariaLabel: "Settings"
    }
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50">
      {/* グラデーション背景とブラー効果 */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-800/95 to-gray-800/80 backdrop-blur-xl border-t border-gray-700/50"></div>
      
      {/* メイン容器 */}
      <div className="relative px-4 py-3">
        <nav>
          <ul className="flex justify-around items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    aria-label={item.ariaLabel}
                    className="group relative flex flex-col items-center justify-center p-3 min-h-[60px] min-w-[60px] transition-all duration-200"
                  >
                    {/* アクティブ状態のグロー背景 */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-2xl blur-sm"></div>
                    )}
                    
                    {/* アイコン容器 */}
                    <div className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-green-400 to-blue-500 shadow-lg shadow-green-400/25' 
                        : 'bg-gray-700/50 group-hover:bg-gray-600/60 group-hover:scale-105'
                    }`}>
                      <Icon 
                        size={24} 
                        className={`transition-colors duration-200 ${
                          isActive ? 'text-gray-900' : 'text-gray-300 group-hover:text-green-400'
                        }`}
                      />
                    </div>
                    
                    {/* ラベル */}
                    <span className={`text-xs font-medium mt-1 transition-colors duration-200 ${
                      isActive 
                        ? 'text-green-400' 
                        : 'text-gray-400 group-hover:text-gray-300'
                    }`}>
                      {item.label}
                    </span>
                    
                    {/* アクティブインジケーター */}
                    {isActive && (
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
                    )}
                    
                    {/* ホバー時のリップル効果 */}
                    <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/5 transition-colors duration-200"></div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      
      {/* ボトムセーフエリア */}
      <div className="h-safe-area-inset-bottom bg-gradient-to-t from-gray-900 to-transparent"></div>
    </footer>
  );
}

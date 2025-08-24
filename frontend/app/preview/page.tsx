"use client";

import DrinkImage from  "../_shared/DrinkImage";
import TimerDisplay from "../_shared/TimerDisplay";
import Chart from "@/app/_shared/Chart";
import ReadyButton from "./_components/ReadyButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 pb-24">
      <div className="max-w-md mx-auto">
      
      <section
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        
      </section>
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  カフェイン濃度推移
                </h2>
                <Chart />
              </div>
      <div className="my-8">
        <ReadyButton />
　　　  </div>
      </div>
    </main>
  );
}

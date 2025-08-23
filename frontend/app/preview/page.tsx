"use client";

import DrinkImage from  "../_shared/DrinkImage";
import TimerDisplay from "../_shared/TimerDisplay";
import Chart from "@/app/_shared/Chart";
import ReadyButton from "./_components/ReadyButton";

export default function Home() {
  return (
    <main>
      
      <section
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <DrinkImage src={""} alt={""} />
        <TimerDisplay />
        
      </section>
      <Chart />
      <ReadyButton />
    </main>
  );
}

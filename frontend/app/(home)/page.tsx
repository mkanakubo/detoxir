'use client';

import MeasureStartButton from './_components/MeasureStartButton';
import DrinkImage from './_components/DrinkImage';
import TimerDisplay from './_components/TimerDisplay';
import Chart from './_components/Chart';


export default function Home() {
  return (
    <main>
      <MeasureStartButton />
      <section
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <DrinkImage />
        <TimerDisplay />
        
      </section>
      <Chart />
    </main>
  );
}

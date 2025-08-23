'use client';

import Header from '../_shared/Header';
import MeasureStartButton from './_components/MeasureStartButton';
import DrinkImage from './_components/DrinkImage';
import TimerDisplay from './_components/TimerDisplay';
import Chart from './_components/Chart';
import Footer from '../_shared/Footer';

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

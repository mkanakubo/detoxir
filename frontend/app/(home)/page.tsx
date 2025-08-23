'use client';

import Header from './_components/Header';
import MeasureStartButton from './_components/MeasureStartButton';
import DrinkImage from './_components/DrinkImage';
import TimerDisplay from './_components/TimerDisplay';
import Chart from './_components/Chart';
import Footer from './_components/Footer';

export default function Home() {
  return (
    <main>
      <Header />
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
      <Footer />
    </main>
  );
}

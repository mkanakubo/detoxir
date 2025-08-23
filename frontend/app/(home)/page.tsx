'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from '@auth0/nextjs-auth0';
import MeasureStartButton from './_components/MeasureStartButton';
import DrinkImage from '../_shared/DrinkImage';
import TimerDisplay from '../_shared/TimerDisplay';
import Chart from '../_shared/Chart';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading) {               // ローディングが終わったら
      if (!user) {                  // ユーザーがいなければ
        router.push("/auth/login"); // ログインページへ
      }
    }
  }, [isLoading, user, router]);

  // ログイン済みの場合だけ本来の画面を表示
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

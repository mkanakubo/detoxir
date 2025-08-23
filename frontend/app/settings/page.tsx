"use client";

import { useState } from "react";
import Link from "next/link";
import { Undo2 } from "lucide-react";   // ← 戻るアイコン
import page from "./_styles/Page.module.css";
import WeightField from "./_components/WeightField";
import AgeField from "./_components/AgeField";
import SleepTimeField from "./_components/SleepTimeField";

export default function SettingsPage() {
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [sleepTime, setSleepTime] = useState("23:00");

  return (
    <main className={page.page}>
      <section className={page.card}>
        {/* カード右上のホームボタン */}
        <Link href="/" aria-label="ホームへ戻る" className={page.homeBtn}>
          <Undo2 size={18} />
        </Link>
        <WeightField value={weight} onChange={setWeight} />
        <AgeField value={age} onChange={setAge} />
        <SleepTimeField value={sleepTime} onChange={setSleepTime} />

        {/* カード右下の保存ボタン */}
       <button  
          className={page.saveBtn}
          onClick={() => {
           alert("保存しました！");
           }}
          >
        保存
       </button>
      </section>
    </main>
  );
}

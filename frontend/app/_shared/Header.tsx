"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem",
        backgroundColor: "black",
        height: "64px", // ヘッダーはそのまま
        overflow: "visible", // ← アイコンがはみ出しても見えるようにする
      }}
    >
      {/* アイコンをクリックするとホームに戻る */}
      <Link href="/" style={{ display: "inline-block" }}>
        <img
          src="/favicon.ico"
          style={{
            height: "80px", // ヘッダーより大きいサイズ
            width: "auto",  // アスペクト比を保つ
          }}
          alt="Logo"
        />
      </Link>
    </header>
  );
}

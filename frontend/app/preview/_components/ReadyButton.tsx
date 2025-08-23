"use client";
import { useRouter } from "next/navigation";

export default function ReadyButton() {
  const router = useRouter();

  return (
    <div
      style={{
        width: "90%",
        marginLeft: "5%",
        display: "flex",
        gap: 12, // ボタンの間隔
      }}
    >
      <button
        style={{
          flex: 1,
          height: "50px",
          fontSize: "0.9rem",
          borderRadius: "10px",
          fontWeight: 700,
          border: "2px solid #39FF14",
          backgroundColor: "#1e1e1eff",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onClick={() => router.push("/")}
      >
        Start
      </button>

      <button
        style={{
          flex: 1,
          height: "50px",
          fontSize: "0.9rem",
          borderRadius: "10px",
          fontWeight: 700,
          border: "2px solid #39FF14",
          backgroundColor: "#1e1e1eff",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onClick={() => router.push("/")}
      >
        Cancel
      </button>
    </div>
  );
}

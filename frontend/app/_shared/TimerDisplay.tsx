// TimerDisplay.tsx
"use client";

export default function TimerDisplay() {
  return (
    <div
      style={{
        backgroundColor: "#1e1e1eff",
        width: "95%",
        height: "60px",
        color: "white",
        padding: "0.75rem 1rem",
        fontSize: "1.4rem",
        textAlign: "center",
        marginLeft: "10px",
        marginRight: "5%",
        borderRadius: "10px",
        border: "2px solid #39FF14",
      }}
    >
      <div>00:12:34</div> {/* 仮の固定表示 */}
    </div>
  );
}

// app/_components/Chart.tsx
"use client";
import { useEffect, useState } from "react";


export default function Chart() {
    const [isMobile, setIsMobile] = useState(false);
     useEffect(() => {
    // 初期判定
    const checkScreen = () => setIsMobile(window.innerWidth < 1050);
    checkScreen();

    // 画面サイズが変わったら再判定
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);
  return (
    
    <div
      style={{
        width: isMobile ? "90%" : "300px",
        aspectRatio: "5/6", 
        marginLeft: "5%",
        marginBottom: "50px",
        borderRadius: "10px",
        border: "2px solid #39FF14",
        backgroundColor: "#1e1e1eff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#888",       
      }}
    >
      グラフ
    </div>
  );
}

// Footer.tsx
"use client";
import Link from "next/link";
import { Settings, LayoutDashboard, ChartLine } from "lucide-react"; 
// ※ ChartSpline が無い版でも動くように一旦 ChartLine を使用

export default function Footer() {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor: "black",
        padding: "0.5rem 0",
      }}
    >
      <nav>
        <ul
          style={{
            display: "flex",
            justifyContent: "space-around",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          <li>
            <Link href="/" aria-label="Dashboard" style={{ color: "#39FF14" }}>
              <LayoutDashboard size={28} />
            </Link>
          </li>
          <li>
            <Link href="/analyze" aria-label="Analyze" style={{ color: "#39FF14" }}>
              <ChartLine size={28} />
            </Link>
          </li>
          <li>
            <Link href="/settings" aria-label="Settings" style={{ color: "#39FF14" }}>
              <Settings size={28} />
            </Link>
          </li>
        </ul>
      </nav>
    </footer>
  );
}

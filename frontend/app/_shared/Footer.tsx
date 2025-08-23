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
        padding: "1rem 0",
        minHeight: "70px",
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
            <Link 
              href="/" 
              aria-label="Dashboard" 
              style={{ 
                color: "#39FF14",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.75rem",
                minHeight: "48px",
                minWidth: "48px"
              }}
            >
              <LayoutDashboard size={32} />
            </Link>
          </li>
          <li>
            <Link 
              href="/analyze" 
              aria-label="Analyze" 
              style={{ 
                color: "#39FF14",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.75rem",
                minHeight: "48px",
                minWidth: "48px"
              }}
            >
              <ChartLine size={32} />
            </Link>
          </li>
          <li>
            <Link 
              href="/settings" 
              aria-label="Settings" 
              style={{ 
                color: "#39FF14",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.75rem",
                minHeight: "48px",
                minWidth: "48px"
              }}
            >
              <Settings size={32} />
            </Link>
          </li>
        </ul>
      </nav>
    </footer>
  );
}

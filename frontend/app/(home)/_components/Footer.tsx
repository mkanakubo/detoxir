// Footer.tsx
"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      position: "fixed",   
      bottom: 0,
      left: 0,
      width: "100%",
      backgroundColor: "#95D600", 
      padding: "0.5rem 0",
      color: "black"
    }}>
      <nav>
        <ul style={{
          display: "flex",
          justifyContent: "space-around",
          listStyle: "none",
          margin: 0,
          padding: 0
        }}>
          <li>
            <Link href="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link href="/analyze">Analyze</Link>
          </li>
          <li>
            <Link href="/setting">Settings</Link>
          </li>
        </ul>
      </nav>
    </footer>
  );
}

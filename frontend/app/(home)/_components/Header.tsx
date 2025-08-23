"use client"; 
import Link from "next/link";

export default function Header() {
  return (
    <header style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1rem",
      backgroundColor: "#95D600", 
      color: "black"
    }}>
      <h1>detoxir</h1>
    </header>
  );
}

"use client";
import { useRouter } from "next/navigation";

export default function MeasureStartButton() {
  const router = useRouter();

  return (
    <button
      style={{
        width: "90%",
        height: "50px",
        marginLeft: "5%",
        marginTop: "10px",               
        fontSize: "0.9rem", 
        borderRadius: "10px",           
        fontWeight: 700,               
        border: "2px solid #39FF14",   
        backgroundColor: "#1e1e1eff",    
        cursor: "pointer",             
        transition: "all 0.2s ease",  
      }}
      onClick={() =>router.push("/camera")}
    >
      START
    </button>
  );
}

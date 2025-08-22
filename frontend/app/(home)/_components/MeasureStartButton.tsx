"use client";

export default function MeasureStartButton() {
  return (
    <button
      style={{
        width: "90%",
        height: "50px",
        marginLeft: "5%",
        marginTop: "10px",               
        fontSize: "0.9rem",            
        fontWeight: 700,               
        border: "2px solid #95D600",   
        backgroundColor: "black",    
        cursor: "pointer",             
        transition: "all 0.2s ease",  
      }}
      onClick={() => alert("（ダミー）計測開始しました")}
    >
      START
    </button>
  );
}

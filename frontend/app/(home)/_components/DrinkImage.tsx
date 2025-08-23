// DrinkImage.tsx
"use client";
import Image from "next/image";

type DrinkImageProps = {
  src: string;   // 画像のURL
  alt: string;   // 代替テキスト
};

export default function DrinkImage({ src, alt }: DrinkImageProps) {
  return (
    <div
      style={{
        display: "inline-flex",         // 枠を画像サイズに合わせる
        justifyContent: "center",
        alignItems: "center",
        marginLeft: "5%",
        marginTop: "10px",
        marginBottom: "10px",
        border: "2px solid #39FF14",    // 枠線
        borderRadius: "8px",            // 角を丸く（任意）                
        backgroundColor: "#1e1e1eff",       // 枠内の背景を黒に（ネオン映え）
      }}
    >
      <Image 
        src={src} 
        alt={alt} 
        width={90}   // 画像の幅
        height={90}  // 画像の高さ
      />
    </div>
  );
}

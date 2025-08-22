// DrinkImage.tsx
"use client";
import Image from "next/image";

type DrinkImageProps = {
  src: string;   // 画像のURL
  alt: string;   // 代替テキスト（画像が表示されないときの説明）
};

export default function DrinkImage({ src, alt }: DrinkImageProps) {
  return (
    <div style={{
      display: "flex",
      marginLeft: "5%",
      marginTop: "10px",
      marginBottom:"10px",
      justifyContent: "flex-start", 
    }}>
      <Image 
        src={src} 
        alt={alt} 
        width={100}   // 画像の幅
        height={100}  // 画像の高さ
      />
    </div>
  );
}

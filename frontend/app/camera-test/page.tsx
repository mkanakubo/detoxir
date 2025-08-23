// pages/index.tsx または app/page.tsx
'use client';

import { useState } from 'react';

export default function Home() {
  const [janCode, setJanCode] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage('解析中です...');
    setJanCode(null);

    // ファイルをBase64に変換
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const imageBase64 = base64String.split(',')[1];

      // APIエンドポイントにPOSTリクエストを送信
      try {
        const response = await fetch('/api/v2/detect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageBase64 }),
        });

        const data = await response.json();
        console.log('APIレスポンス:', data);

        if (response.ok) {
          setMessage(data.jancode);
        } else {
          setMessage('JANコードが見つかりませんでした。');
        }
      } catch (error) {
        console.error('API呼び出しエラー:', error);
        setMessage('API呼び出し中にエラーが発生しました。');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h1>画像からJANコードを抽出</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {message && <p>{message}</p>}
      {janCode && <h2>抽出されたJANコード: {janCode}</h2>}
    </div>
  );
}
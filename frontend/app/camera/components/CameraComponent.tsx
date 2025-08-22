'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Webcam from 'react-webcam';
import { toast } from 'react-hot-toast';

interface CameraComponentProps {
  onImageUpload?: (success: boolean) => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onImageUpload }) => {
  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'environment'
  };

  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImage(imageSrc);
    }
  };

  const handleUpload = async () => {
    if (!image) return;

    try {
      setIsUploading(true);
      // Base64文字列からBlobを作成
      const base64Data = image.split(',')[1];
      const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());
      
      // FormDataの作成
      const formData = new FormData();
      formData.append('image', blob, 'barcode.jpg');

      // APIエンドポイントに画像を送信
      const response = await fetch('/api/detect', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'アップロードに失敗しました');
      }

      toast.success(data.message || '画像の送信が完了しました');
      onImageUpload?.(true);
      setImage(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('アップロードに失敗しました');
      onImageUpload?.(false);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">バーコードスキャン</h1>
        <div className="space-y-4">
          {image ? (
            <>
              <div className="relative w-[640px] h-[480px]">
                <Image
                  src={image}
                  alt="撮影した画像"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setImage(null)}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  disabled={isUploading}
                >
                  再撮影
                </button>
                <button
                  onClick={handleUpload}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  disabled={isUploading}
                >
                  {isUploading ? '送信中...' : '確定して送信'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="rounded-lg border"
                />
                {/* バーコードガイドライン */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-blue-500 w-64 h-32 rounded-lg"></div>
                </div>
              </div>
              <p className="text-gray-600 text-center">
                バーコードを枠内に合わせて撮影してください
              </p>
              <div className="flex justify-center">
                <button
                  onClick={capture}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  撮影
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraComponent;

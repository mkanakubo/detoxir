'use client';

import React, { useRef, useState } from 'react';
import NextImage from 'next/image';
import Webcam from 'react-webcam';
import { toast } from 'react-hot-toast';

export type CameraComponentProps = {
  onImageUpload?: (success: boolean, janCode?: string) => void;
};

export default function CameraComponent() {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    janCode?: string;
    message: string;
  } | null>(null);
  const [serverJanCode, setServerJanCode] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // iOS判定
  React.useEffect(() => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOSDevice(isIOS);
  }, []);

  // ビデオの設定（iOS対応）
  const [videoConstraints, setVideoConstraints] = useState<MediaTrackConstraints>({
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
    facingMode: { exact: "environment" },
    aspectRatio: 16/9
  });

  // カメラエラーハンドリング
  const handleCameraError = (error: string | DOMException) => {
    console.error('Camera error:', error);
    setCameraError(typeof error === 'string' ? error : error.message);
    
    // iOS Safari でよくある問題への対処
    if (typeof error === 'object' && error.name === 'OverconstrainedError') {
      // constraintsを緩くしてリトライ
      setVideoConstraints({
        width: { ideal: 640, max: 1280 },
        height: { ideal: 480, max: 720 },
        facingMode: "environment",
        aspectRatio: 4/3
      } as MediaTrackConstraints);
      toast.error('カメラの設定を調整しています...');
    } else {
      toast.error('カメラにアクセスできません。ファイル選択を使用してください。');
    }
  };

  // ファイル選択からの画像読み込み
  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 画像のキャプチャ
  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImage(imageSrc);
    }
  };

  // 画像の前処理

  // JANコードの検証
  
  // 再撮影
  const handleRetake = () => {
    setImage(null);
    setResult(null);
    setServerJanCode(null);
    setServerError(null);
  };

  // サーバでOCR解析
  const handleServerAnalyze = async () => {
    if (!image) return;
    setServerJanCode(null);
    setServerError(null);
    try {
      // base64からヘッダー除去
      const imageBase64 = image.replace(/^data:image\/jpeg;base64,/, '');
      const response = await fetch('/api/v2/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
      });
      const data = await response.json();
      if (response.ok && data.jancode) {
        // 数字以外の文字を除去
        const janCodeOnlyDigits = String(data.jancode).replace(/[^\d]/g, '');
        setServerJanCode(janCodeOnlyDigits);
        toast.success('サーバOCR成功: ' + janCodeOnlyDigits);
      } else {
        setServerError(data.message || data.error || 'サーバ解析失敗');
        toast.error('サーバOCR失敗');
      }
    } catch (err) {
      setServerError('通信エラー: ' + (err instanceof Error ? err.message : String(err)));
      toast.error('サーバ通信エラー');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-2 sm:p-4">
      <div className="bg-black p-3 sm:p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center text-white">バーコードスキャン</h1>
        <div className="space-y-4">
          {image ? (
            <>
              <div className="relative w-4/5 sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 aspect-video max-w-lg mx-auto mb-4">
                <NextImage
                  src={image}
                  alt="撮影した画像"
                  fill
                  className="object-contain rounded-lg shadow-md"
                />
              </div>
              <div className="space-y-4 w-full max-w-lg mx-auto px-4">
                {result && (
                  <div className={`text-center p-4 rounded-lg text-sm sm:text-base ${
                    result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <p className="font-bold break-words">{result.message}</p>
                    {result.janCode && (
                      <p className="mt-2 text-xs sm:text-sm font-mono">JANコード: {result.janCode}</p>
                    )}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={handleRetake}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg w-full sm:w-auto"
                  >
                    再撮影
                  </button>
                  {/* バーコードを解析ボタンは削除 */}
                  <button
                    onClick={handleServerAnalyze}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg w-full sm:w-auto"
                  >
                    サーバで解析
                  </button>
                </div>
                {/* サーバOCR結果表示 */}
                {serverJanCode && (
                  <div className="bg-blue-100 text-blue-800 p-4 rounded mt-4 text-center">
                    <p className="font-bold">サーバOCR結果</p>
                    <p className="mt-2">JANコード: {serverJanCode}</p>
                  </div>
                )}
                {serverError && (
                  <div className="bg-red-100 text-red-800 p-4 rounded mt-4 text-center">
                    <p className="font-bold">サーバOCRエラー</p>
                    <p className="mt-2">{serverError}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* カメラエラーまたはiOSの場合の代替UI */}
              {(cameraError || isIOSDevice) && (
                <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg max-w-lg mx-auto">
                  <p className="font-bold text-sm sm:text-base">カメラが利用できません</p>
                  <p className="text-xs sm:text-sm mt-1 break-words">
                    {isIOSDevice 
                      ? 'iOS端末では、ファイル選択機能をご利用ください。' 
                      : cameraError
                    }
                  </p>
                </div>
              )}
              
              {/* ファイル選択UI */}
              <div className="mb-4">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handleFileInput}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-sm bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg mb-4 text-lg shadow-lg mx-auto"
                >
                  📷 写真を撮影 / 選択
                </button>
              </div>

              {/* Webカメラコンポーネント（エラーがない場合のみ表示） */}
              {!cameraError && (
                <div className="relative w-full max-w-lg mx-auto">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    className="rounded-lg border w-full h-auto"
                    onUserMediaError={handleCameraError}
                  />
                  {/* バーコードガイドライン */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-4 border-lime-400 w-4/5 max-w-sm h-24 rounded-lg"></div>
                  </div>
                </div>
              )}
              
              <p className="text-gray-300 text-center text-sm sm:text-base px-4">
                バーコードを枠内に合わせて撮影してください
              </p>
              
              {/* 撮影ボタン（カメラが利用可能な場合のみ） */}
              {!cameraError && (
                <div className="flex justify-center">
                  <button
                    onClick={capture}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg w-full max-w-xs"
                  >
                    📷 撮影
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


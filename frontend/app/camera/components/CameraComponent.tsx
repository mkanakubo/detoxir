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
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            バーコードスキャン
          </h1>
          <p className="text-slate-400 text-sm font-medium">商品のバーコードを読み取ってカフェイン量を確認</p>
        </div>

        <div className="bg-slate-700/20 backdrop-blur-lg rounded-2xl p-6 border border-slate-600/25 shadow-2xl">
          <div className="space-y-6">
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
                  <div className={`text-center p-4 rounded-xl text-sm sm:text-base backdrop-blur-sm border ${
                    result.success 
                      ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30' 
                      : 'bg-red-500/20 text-red-100 border-red-400/30'
                  }`}>
                    <p className="font-bold break-words">{result.message}</p>
                    {result.janCode && (
                      <p className="mt-2 text-xs sm:text-sm font-mono opacity-90">JANコード: {result.janCode}</p>
                    )}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={handleRetake}
                    className="bg-slate-600/50 hover:bg-slate-500/60 text-white font-semibold py-3 px-6 rounded-xl w-full sm:w-auto backdrop-blur-sm border border-slate-500/30 transition-all duration-300 hover:scale-105"
                  >
                    再撮影
                  </button>
                  {/* バーコードを解析ボタンは削除 */}
                  <button
                    onClick={handleServerAnalyze}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl w-full sm:w-auto transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-emerald-500/25"
                  >
                    サーバで解析
                  </button>
                </div>
                {/* サーバOCR結果表示 */}
                {serverJanCode && (
                  <div className="bg-cyan-500/20 text-cyan-100 p-4 rounded-xl mt-4 text-center backdrop-blur-sm border border-cyan-400/30">
                    <p className="font-bold">サーバOCR結果</p>
                    <p className="mt-2 font-mono">JANコード: {serverJanCode}</p>
                  </div>
                )}
                {serverError && (
                  <div className="bg-red-500/20 text-red-100 p-4 rounded-xl mt-4 text-center backdrop-blur-sm border border-red-400/30">
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
                <div className="mb-4 p-4 bg-amber-500/20 text-amber-100 rounded-xl max-w-lg mx-auto backdrop-blur-sm border border-amber-400/30">
                  <p className="font-bold text-sm sm:text-base">カメラが利用できません</p>
                  <p className="text-xs sm:text-sm mt-1 break-words opacity-90">
                    {isIOSDevice 
                      ? 'iOS端末では、ファイル選択機能をご利用ください。' 
                      : cameraError
                    }
                  </p>
                </div>
              )}
              
              {/* ファイル選択UI */}
              <div className="mb-6">
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
                  className="w-full max-w-sm bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold py-4 px-6 rounded-xl mb-4 text-lg shadow-lg mx-auto transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span className="text-xl">📷</span>
                  <span>写真を撮影 / 選択</span>
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
                    className="rounded-xl border border-slate-600/30 w-full h-auto shadow-lg"
                    onUserMediaError={handleCameraError}
                  />
                  {/* バーコードガイドライン */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-4 border-emerald-400 w-4/5 max-w-sm h-24 rounded-lg shadow-lg">
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-slate-300 text-center text-sm sm:text-base px-4 font-medium">
                バーコードを枠内に合わせて撮影してください
              </p>
              
              {/* 撮影ボタン（カメラが利用可能な場合のみ） */}
              {!cameraError && (
                <div className="flex justify-center">
                  <button
                    onClick={capture}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg w-full max-w-xs transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <span className="text-xl">�</span>
                    <span>撮影</span>
                  </button>
                </div>
              )}
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}


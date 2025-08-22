'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function CameraPage() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      setError(
        'カメラにアクセスできませんでした。ブラウザでカメラの使用を許可してください。',
      );
      console.error('カメラアクセスエラー:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/png');
    setCapturedImage(imageData);
  }, []);

  const downloadPhoto = useCallback(() => {
    if (!capturedImage) return;

    const link = document.createElement('a');
    link.download = `camera-photo-${new Date().getTime()}.png`;
    link.href = capturedImage;
    link.click();
  }, [capturedImage]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            📸 Detoxir Camera
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <p className="font-medium">エラー:</p>
              <p>{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* カメラプレビュー */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">
                カメラプレビュー
              </h2>

              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ display: isStreaming ? 'block' : 'none' }}
                />

                {!isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📹</div>
                      <p className="text-lg">カメラが停止中です</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-center">
                {!isStreaming ? (
                  <button
                    onClick={startCamera}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    📹 カメラ開始
                  </button>
                ) : (
                  <>
                    <button
                      onClick={capturePhoto}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      📸 写真撮影
                    </button>
                    <button
                      onClick={stopCamera}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      ⏹ 停止
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 撮影した写真 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">
                撮影した写真
              </h2>

              <div className="relative bg-gray-200 rounded-lg overflow-hidden aspect-video">
                {capturedImage ? (
                  <Image
                    src={capturedImage}
                    alt="撮影した写真"
                    className="w-full h-full object-cover"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🖼️</div>
                      <p className="text-lg">写真が撮影されていません</p>
                    </div>
                  </div>
                )}
              </div>

              {capturedImage && (
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={downloadPhoto}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    💾 ダウンロード
                  </button>
                  <button
                    onClick={retakePhoto}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    🔄 再撮影
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 使用方法 */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">
              📋 使用方法
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-700">
              <li>「カメラ開始」ボタンをクリックしてカメラを起動</li>
              <li>
                ブラウザがカメラアクセスの許可を求めたら「許可」をクリック
              </li>
              <li>
                カメラプレビューが表示されたら「写真撮影」ボタンをクリック
              </li>
              <li>撮影した写真は右側に表示され、ダウンロードも可能</li>
              <li>再撮影したい場合は「再撮影」ボタンをクリック</li>
            </ol>
          </div>

          {/* 戻るボタン */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-block bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              ← ホームに戻る
            </Link>
          </div>
        </div>
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

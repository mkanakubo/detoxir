// frontend/app/camera-test/page.jsx

// クライアントコンポーネントとして動作させるためのディレクティブ
"use client";

import React, { useRef } from 'react';
import CameraView from '../(camera)/components/cameraview.jsx';

const CameraTestPage = () => {
  // カメラのrefを保持する
  const webcamRef = useRef(null);
  
  // 撮影機能は今回は実装しないが、refは渡しておく
  // const handleCapture = () => {
  //   if (webcamRef.current) {
  //     const screenshot = webcamRef.current.getScreenshot();
  //     console.log(screenshot);
  //   }
  // };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>カメラ機能の単独テスト</h1>
      <p>カメラ映像が表示されれば成功です。</p>
      
      {/* カメラコンポーネントを直接レンダリング */}
      <CameraView ref={webcamRef} />
      
      {/* <button onClick={handleCapture}>撮影</button> */}
    </div>
  );
};

export default CameraTestPage;
import React from 'react';
import Webcam from 'react-webcam';

// Webcamの表示に関する設定
const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: 'environment'
};

// カメラ映像の表示に特化したコンポーネント
const CameraView = React.forwardRef(({ width = 640 }, ref) => {
  return (
    <Webcam
      audio={false}
      ref={ref}
      screenshotFormat="image/jpeg"
      width={width}
      videoConstraints={videoConstraints}
    />
  );
});
CameraView.displayName = 'CameraView';
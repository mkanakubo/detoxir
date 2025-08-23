import React, { useRef, useState, useEffect } from 'react';
import NextImage from 'next/image';
import { toast } from 'react-hot-toast';
const ScanPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  type ScanResult = {
    success: boolean;
    code?: string;
    format?: string;
    error?: string;
  };
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

    const preprocessImage = async (imageData: string | null) => {
      if (!imageData) return false;
      return new Promise((resolve) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          // You can add your image preprocessing logic here if needed
          resolve(true);
        };
        img.src = imageData;
      });
    };
  
    // ...rest of your ScanPage component logic goes here...
  
    // At the end of your file, make sure to only have one export default
  };
  
  export default ScanPage;
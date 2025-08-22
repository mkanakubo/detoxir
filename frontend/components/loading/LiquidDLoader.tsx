'use client';

import { useEffect, useState } from 'react';

interface LiquidDLoaderProps {
  size?: number;
  duration?: number;
  className?: string;
}

export function LiquidDLoader({
  size = 200,
  duration = 6000,
  className = '',
}: LiquidDLoaderProps) {
  const [fillLevel, setFillLevel] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const intervalTime = 50;
    const totalSteps = duration / intervalTime;
    const incrementPerStep = 100 / totalSteps;

    const interval = setInterval(() => {
      setFillLevel((prev) => {
        const newLevel = prev + incrementPerStep;
        if (newLevel >= 100) {
          setIsComplete(true);
          return 100;
        }
        return newLevel;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div
      className={`inline-flex items-center justify-center bg-black min-h-screen w-full ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 500 500"
        className="overflow-visible"
      >
        <defs>
          <clipPath id="d-inner-space">
            <path d="M190.00,147.00 L249.00,147.00 L316.00,209.00 L316.00,290.00 L250.00,351.00 L189.00,350.00 Z" />
          </clipPath>

          {/* Gradient for liquid effect */}
          <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7AD61F" />
            <stop offset="50%" stopColor="#47C22F" />
            <stop offset="100%" stopColor="#7AD61F" />
          </linearGradient>

          <pattern
            id="wavePattern"
            x="0"
            y="0"
            width="120"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0,15 Q30,5 60,15 T120,15 V30 H0 Z"
              fill="#7AD61F"
              opacity="0.9"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; -60,0; 0,0"
                dur="3s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M0,15 Q20,25 40,15 T80,15 T120,15 V30 H0 Z"
              fill="#47C22F"
              opacity="0.7"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; 40,0; 0,0"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </path>
          </pattern>
        </defs>

        <path
          d="M150.00,112.00 L150.00,387.00 L265.00,387.00 L355.00,304.00 L355.00,194.00 L265.00,112.00 Z M190.00,147.00 L249.00,147.00 L316.00,209.00 L316.00,290.00 L250.00,351.00 L189.00,350.00 Z"
          fill="white"
          stroke="white"
          strokeWidth="2"
          fillRule="evenodd"
        />

        <g clipPath="url(#d-inner-space)">
          <rect
            x="0"
            y={351 - (fillLevel / 100) * (351 - 147)}
            width="500"
            height={(fillLevel / 100) * (351 - 147)}
            fill="url(#liquidGradient)"
            style={{
              transition: 'y 0.2s ease-out, height 0.2s ease-out',
            }}
          />

          <rect
            x="0"
            y={351 - (fillLevel / 100) * (351 - 147) - 15}
            width="500"
            height="30"
            fill="url(#wavePattern)"
            opacity="0.8"
            style={{
              transition: 'y 0.2s ease-out',
            }}
          />

          {!isComplete &&
            Array.from({ length: 15 }).map((_, i) => (
              <circle
                key={i}
                cx={200 + (i % 5) * 20 + Math.sin(i + fillLevel * 0.1) * 12}
                cy={351 - (fillLevel / 100) * (351 - 147) + 40 + (i % 4) * 15}
                r={1 + Math.random() * 2.5}
                fill="rgba(255, 255, 255, 0.9)"
                opacity="0.7"
                style={{
                  animation: `risingBubble ${2 + (i % 4) * 0.5}s ease-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}

          {isComplete &&
            Array.from({ length: 20 }).map((_, i) => (
              <circle
                key={`ceiling-${i}`}
                cx={190 + i * 6 + Math.sin(i) * 8}
                cy={147 + Math.random() * 10}
                r={0.8 + Math.random() * 1.5}
                fill="rgba(255, 255, 255, 0.8)"
                opacity="0.6"
                style={{
                  animation: `ceilingBubble ${3 + Math.random() * 2}s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}

          {Array.from({ length: 10 }).map((_, i) => (
            <circle
              key={`small-${i}`}
              cx={210 + i * 12 + Math.cos(i + fillLevel * 0.05) * 8}
              cy={351 - (fillLevel / 100) * (351 - 147) + 20 + i * 3}
              r={0.5 + Math.random() * 1}
              fill="rgba(255, 255, 255, 0.9)"
              opacity="0.5"
              style={{
                animation: `smallBubble ${1.5 + i * 0.2}s linear infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </g>
      </svg>

      <style jsx>{`
        @keyframes risingBubble {
          0% {
            transform: translateY(0) scale(0.3);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-20px) scale(1);
            opacity: 0.9;
          }
          70% {
            transform: translateY(-80px) scale(1.3);
            opacity: 0.5;
          }
          100% {
            transform: translateY(-120px) scale(0.2);
            opacity: 0;
          }
        }

        @keyframes ceilingBubble {
          0%,
          100% {
            transform: translateY(0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-3px) scale(1.2);
            opacity: 0.8;
          }
        }

        @keyframes smallBubble {
          0% {
            transform: translateY(0) scale(0.2);
            opacity: 0.5;
          }
          60% {
            transform: translateY(-40px) scale(0.9);
            opacity: 0.7;
          }
          100% {
            transform: translateY(-70px) scale(0.1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

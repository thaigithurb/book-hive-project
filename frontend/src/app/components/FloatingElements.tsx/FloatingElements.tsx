"use client";

import { useEffect, useState } from "react";

interface FloatingElement {
  id: number;
  left: number;
  delay: number;
  duration: number;
}

export default function FloatingElements() {
  const [elements, setElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    const newElements = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 6 + Math.random() * 4,
    }));
    setElements(newElements);
  }, []);

  return (
    <>
      <style>{`
        @keyframes float-down {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes bee-fly {
          0% {
            transform: translateY(-10vh) translateX(0px) rotate(0deg);
            opacity: 1;
          }
          25% {
            transform: translateY(25vh) translateX(30px) rotate(10deg);
          }
          50% {
            transform: translateY(50vh) translateX(-20px) rotate(-10deg);
          }
          75% {
            transform: translateY(75vh) translateX(25px) rotate(10deg);
          }
          100% {
            transform: translateY(100vh) translateX(0px) rotate(0deg);
            opacity: 0;
          }
        }
      `}</style>
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute pointer-events-none text-5xl"
          style={{
            left: `${el.left}%`,
            top: "-20px",
            animation:
              el.id % 2 === 0
                ? `float-down ${el.duration}s linear infinite`
                : `bee-fly ${el.duration}s ease-in-out infinite`,
            animationDelay: `${el.delay}s`,
          }}
        >
          {el.id % 2 === 0 ? "🍃" : "🐝"}
        </div>
      ))}
    </>
  );
}

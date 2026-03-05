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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Kiểm tra kích thước màn hình
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Giảm số lượng element trên mobile
    const count = isMobile ? 8 : 15;
    const newElements = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: isMobile ? 4 + Math.random() * 2 : 6 + Math.random() * 4,
    }));
    setElements(newElements);
  }, [isMobile]);

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

        @keyframes bee-fly-mobile {
          0% {
            transform: translateY(-10vh) translateX(0px) rotate(0deg);
            opacity: 1;
          }
          25% {
            transform: translateY(25vh) translateX(15px) rotate(10deg);
          }
          50% {
            transform: translateY(50vh) translateX(-10px) rotate(-10deg);
          }
          75% {
            transform: translateY(75vh) translateX(12px) rotate(10deg);
          }
          100% {
            transform: translateY(100vh) translateX(0px) rotate(0deg);
            opacity: 0;
          }
        }

        /* Mobile - text size nhỏ hơn */
        @media (max-width: 767px) {
          .floating-element {
            font-size: 1.5rem;
          }
        }

        /* Tablet và desktop - text size lớn hơn */
        @media (min-width: 768px) {
          .floating-element {
            font-size: 2.25rem;
          }
        }
      `}</style>
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute pointer-events-none floating-element"
          style={{
            left: `${el.left}%`,
            top: "-20px",
            animation:
              el.id % 2 === 0
                ? `float-down ${el.duration}s linear infinite`
                : isMobile
                  ? `bee-fly-mobile ${el.duration}s ease-in-out infinite`
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

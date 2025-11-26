// src/components/RewardConfetti.jsx
import { useEffect, useState } from "react";

export default function RewardConfetti({ show }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;

    setVisible(true);

    // hilang setelah 1.2 detik
    const t = setTimeout(() => {
      setVisible(false);
    }, 1200);

    return () => clearTimeout(t);
  }, [show]);

  if (!visible) return null;

  const particles = Array.from({ length: 25 });

  return (
    <div className="fixed inset-0 z-[999] pointer-events-none flex items-start justify-center">
      {particles.map((_, i) => (
        <span
          key={i}
          className="absolute text-lg animate-confetti"
          style={{
            left: Math.random() * 100 + "vw",
            animationDelay: Math.random() * 0.5 + "s",
          }}
        >
          {["🎉", "💸", "🪙", "✨", "💰"][i % 5]}
        </span>
      ))}
    </div>
  );
}

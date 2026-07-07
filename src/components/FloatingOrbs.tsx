"use client";

import { motion } from "motion/react";

type Orb = {
  size: number;
  color: string;
  top: string;
  left: string;
  x: number[];
  y: number[];
  duration: number;
  delay: number;
};

const ORBS: Orb[] = [
  { size: 340, color: "rgba(255, 45, 208, 0.22)", top: "5%", left: "8%", x: [0, 60, -20, 0], y: [0, 50, 90, 0], duration: 22, delay: 0 },
  { size: 260, color: "rgba(34, 211, 238, 0.2)", top: "60%", left: "3%", x: [0, 40, 10, 0], y: [0, -60, -10, 0], duration: 26, delay: 2 },
  { size: 240, color: "rgba(168, 85, 247, 0.22)", top: "8%", left: "72%", x: [0, -50, -10, 0], y: [0, 60, 100, 0], duration: 24, delay: 1 },
  { size: 300, color: "rgba(250, 204, 21, 0.16)", top: "65%", left: "68%", x: [0, -40, 30, 0], y: [0, -40, -10, 0], duration: 28, delay: 3 },
  { size: 200, color: "rgba(74, 222, 128, 0.18)", top: "35%", left: "40%", x: [0, 30, -50, 0], y: [0, 60, 20, 0], duration: 24, delay: 4 },
];

export default function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            filter: "blur(30px)",
            mixBlendMode: "screen",
          }}
          animate={{ x: orb.x, y: orb.y, opacity: [0.3, 0.6, 0.4, 0.3] }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

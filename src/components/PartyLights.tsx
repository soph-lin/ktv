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
  { size: 320, color: "rgba(255, 45, 208, 0.45)", top: "8%", left: "10%", x: [0, 70, -20, 0], y: [0, 40, 80, 0], duration: 16, delay: 0 },
  { size: 260, color: "rgba(34, 211, 238, 0.4)", top: "55%", left: "5%", x: [0, 50, 10, 0], y: [0, -60, -20, 0], duration: 20, delay: 2 },
  { size: 220, color: "rgba(168, 85, 247, 0.45)", top: "15%", left: "80%", x: [0, -60, -10, 0], y: [0, 50, 90, 0], duration: 18, delay: 1 },
  { size: 300, color: "rgba(250, 204, 21, 0.35)", top: "70%", left: "75%", x: [0, -40, 30, 0], y: [0, -50, -10, 0], duration: 22, delay: 3 },
  { size: 200, color: "rgba(74, 222, 128, 0.35)", top: "35%", left: "45%", x: [0, 30, -50, 0], y: [0, 60, 20, 0], duration: 24, delay: 4 },
];

type Beam = {
  color: string;
  left: string;
  rotate: number[];
  duration: number;
  delay: number;
};

const BEAMS: Beam[] = [
  { color: "rgba(255, 45, 208, 0.35)", left: "12%", rotate: [-30, 25, -30], duration: 9, delay: 0 },
  { color: "rgba(34, 211, 238, 0.3)", left: "38%", rotate: [20, -25, 20], duration: 11, delay: 1.2 },
  { color: "rgba(250, 204, 21, 0.28)", left: "64%", rotate: [-25, 30, -25], duration: 10, delay: 0.6 },
  { color: "rgba(168, 85, 247, 0.32)", left: "88%", rotate: [30, -20, 30], duration: 12, delay: 2 },
];

export default function PartyLights() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {BEAMS.map((beam, i) => (
        <motion.div
          key={`beam-${i}`}
          className="absolute top-0 h-full w-[140px] origin-top"
          style={{
            left: beam.left,
            background: `linear-gradient(to bottom, ${beam.color}, transparent 70%)`,
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            filter: "blur(12px)",
            mixBlendMode: "screen",
          }}
          animate={{ rotate: beam.rotate }}
          transition={{
            duration: beam.duration,
            delay: beam.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {ORBS.map((orb, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            filter: "blur(20px)",
            mixBlendMode: "screen",
          }}
          animate={{ x: orb.x, y: orb.y, opacity: [0.4, 0.8, 0.5, 0.4] }}
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

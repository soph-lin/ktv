"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactionEvent } from "@/types/reaction";

interface Bubble extends ReactionEvent {
  left: number;
}

export default function ReactionOverlay({ reaction }: { reaction: ReactionEvent | null }) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const seenId = useRef<string | null>(null);

  useEffect(() => {
    if (!reaction || reaction.id === seenId.current) return;
    seenId.current = reaction.id;
    const left = 15 + Math.random() * 70;
    setBubbles((prev) => [...prev, { ...reaction, left }]);
    const timer = setTimeout(() => {
      setBubbles((prev) => prev.filter((b) => b.id !== reaction.id));
    }, 4200);
    return () => clearTimeout(timer);
  }, [reaction]);

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      <AnimatePresence>
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            className="absolute bottom-4 flex flex-col items-center gap-1"
            style={{ left: `${bubble.left}%` }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -420, opacity: [0, 1, 1, 0], x: [0, -18, 16, -10, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4, ease: "easeOut" }}
          >
            <span className="text-4xl leading-none drop-shadow-lg">{bubble.emoji}</span>
            <span className="whitespace-nowrap rounded-full border border-white/15 bg-black/70 px-3 py-1 text-xs font-medium opacity-90 shadow-lg backdrop-blur-sm">
              {bubble.profile.name}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

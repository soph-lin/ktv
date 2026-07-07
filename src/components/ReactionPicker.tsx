"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Smile } from "lucide-react";
import { REACTION_EMOJIS } from "@/types/reaction";

export default function ReactionPicker({
  dancing,
  onReact,
  onToggleDance,
}: {
  dancing: boolean;
  onReact: (emoji: string) => void;
  onToggleDance: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Send a reaction"
        aria-label="Send a reaction"
        className="rounded-full border border-current/20 p-2 transition-colors hover:bg-current/10"
      >
        <Smile className="w-5 h-5" />
      </button>

      {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}

      <AnimatePresence>
        {open && (
          <motion.div
            key="reaction-popover"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full z-20 mt-2 flex items-center gap-1 rounded-full border border-white/20 bg-zinc-900 p-1.5 shadow-lg"
          >
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReact(emoji)}
                className="rounded-full p-1.5 text-lg hover:bg-current/10"
              >
                {emoji}
              </button>
            ))}
            <span className="mx-0.5 w-px self-stretch bg-current/15" />
            <button
              onClick={onToggleDance}
              title={dancing ? "Stop dancing" : "Dance!"}
              className={`rounded-full px-2.5 py-1.5 text-lg transition-colors ${
                dancing ? "bg-white text-black hover:bg-white/85" : "hover:bg-current/10"
              }`}
            >
              💃
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

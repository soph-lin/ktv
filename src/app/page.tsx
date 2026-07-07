"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import ErrorSplash from "@/components/ErrorSplash";
import PartyLights from "@/components/PartyLights";
import { errorPayload, readApiError, type DisplayError } from "@/lib/errors";
import { saveHostToken } from "@/hooks/useHostToken";

const TITLE_LETTERS = ["K", "T", "V"];
const LETTER_STAGGER = 0.12;
const INTRO_DELAY = TITLE_LETTERS.length * LETTER_STAGGER + 0.5;

export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [joinError, setJoinError] = useState<DisplayError | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  async function createRoom() {
    setCreating(true);
    setCreateError(null);
    setJoinError(null);
    try {
      const res = await fetch("/api/rooms", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create room");
      const room = await res.json();
      saveHostToken(room.code, room.hostToken);
      router.push(`/room/${room.code}`);
    } catch {
      setCreateError("Could not create a room. Try again.");
      setCreating(false);
    }
  }

  async function joinRoom(e: React.FormEvent) {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setJoinError(null);
    setCreateError(null);
    const res = await fetch(`/api/rooms/${code}`);
    if (!res.ok) {
      const apiError = await readApiError(res);
      setJoinError(apiError ?? errorPayload("ROOM_NOT_FOUND"));
      return;
    }
    router.push(`/room/${code}`);
  }

  return (
    <main className="relative flex-1 flex items-center justify-center overflow-hidden bg-black p-6 text-white">
      <PartyLights />

      <div className="relative z-10 w-full max-w-sm flex flex-col gap-8 text-center">
        <div>
          <h1 className="flex justify-center text-7xl font-bold tracking-tight">
            {TITLE_LETTERS.map((letter, i) => (
              <motion.span
                key={letter + i}
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: i * LETTER_STAGGER,
                  type: "spring",
                  stiffness: 480,
                  damping: 13,
                }}
              >
                {letter}
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: INTRO_DELAY, duration: 0.5 }}
            className="mt-2 text-sm text-white/70"
          >
            Open source karaoke.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: INTRO_DELAY, duration: 0.5 }}
          className="flex flex-col gap-8"
        >
          <button
            onClick={createRoom}
            disabled={creating}
            className="w-full rounded-lg bg-white text-black py-3 font-medium transition-colors hover:bg-white/85 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Open a room"}
          </button>

          <div className="flex items-center gap-3 text-white/50 text-xs uppercase">
            <div className="h-px flex-1 bg-white/30" />
            or
            <div className="h-px flex-1 bg-white/30" />
          </div>

          <form onSubmit={joinRoom} className="flex flex-col gap-3">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Room code"
              maxLength={8}
              className="w-full rounded-lg border border-white/20 bg-transparent py-3 px-4 text-center text-lg tracking-widest uppercase placeholder-white/40"
            />
            <button
              type="submit"
              className="w-full rounded-lg border border-white/20 py-3 font-medium transition-colors hover:bg-white/10"
            >
              Join room
            </button>
          </form>

          {createError && <p className="text-sm text-red-400">{createError}</p>}
          {joinError && <ErrorSplash error={joinError} />}
        </motion.div>
      </div>
    </main>
  );
}

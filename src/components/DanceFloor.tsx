"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SkipForward } from "lucide-react";
import Avatar from "@/components/Avatar";
import type { Profile } from "@/types/profile";
import type { SongAddedEvent } from "@/types/reaction";

interface TempDancer {
  personKey: string;
  playId: string;
  profile: Profile;
}

const TEMP_BOUNCE_MS = 600;
const TEMP_HOLD_MS = 700;
const TEMP_TOTAL_MS = TEMP_BOUNCE_MS + TEMP_HOLD_MS;

export default function DanceFloor({
  dancers,
  songAdded,
  nextSongTitle,
  onSkipNext,
}: {
  dancers: Record<string, Profile>;
  songAdded?: SongAddedEvent | null;
  nextSongTitle?: string;
  onSkipNext?: () => void;
}) {
  const [tempDancers, setTempDancers] = useState<TempDancer[]>([]);
  const seenId = useRef<string | null>(null);

  useEffect(() => {
    if (!songAdded || songAdded.id === seenId.current) return;
    seenId.current = songAdded.id;

    const personKey = `${songAdded.profile.name}|${songAdded.profile.avatar}`;
    const playId = songAdded.id;

    // Replace any in-flight bubble for this same person instead of stacking
    // a second one — the new playId forces the motion.div to remount below,
    // which replays the bounce from the start.
    setTempDancers((prev) => [
      ...prev.filter((d) => d.personKey !== personKey),
      { personKey, playId, profile: songAdded.profile },
    ]);

    const timer = setTimeout(() => {
      setTempDancers((prev) => prev.filter((d) => d.playId !== playId));
    }, TEMP_TOTAL_MS);
    return () => clearTimeout(timer);
  }, [songAdded]);

  const dancerEntries = Object.entries(dancers);
  const visibleTemp = tempDancers.filter(
    (temp) =>
      !Object.values(dancers).some(
        (p) => p.name === temp.profile.name && p.avatar === temp.profile.avatar
      )
  );

  return (
    <div className="relative z-10 grid min-h-28 grid-cols-[1fr_auto_1fr] items-center gap-4 border-t border-white/10 bg-black/40 px-4 py-3 backdrop-blur-sm">
      <div />

      <div className="flex flex-wrap items-end justify-center gap-4">
        <AnimatePresence>
          {dancerEntries.map(([clientId, profile], i) => (
            <motion.div
              key={clientId}
              className="flex flex-col items-center gap-1"
              animate={{ y: [0, -16, 0, -10, 0], rotate: [-8, 8, -6, 6, -8] }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3, repeat: 0 } }}
              transition={{
                duration: 1 + (i % 3) * 0.2,
                delay: (i % 4) * 0.1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Avatar src={profile.avatar} name={profile.name} className="w-14 h-14 border-2 border-white/25" />
              <span className="max-w-[4.5rem] truncate text-xs opacity-70">{profile.name}</span>
            </motion.div>
          ))}
          {visibleTemp.map((temp) => (
            <motion.div
              key={temp.playId}
              className="flex flex-col items-center gap-1"
              initial={{ opacity: 0, scale: 0.6, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: [0, -22, -8, -14, -10] }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3, repeat: 0 } }}
              transition={{ duration: TEMP_BOUNCE_MS / 1000, ease: "easeOut" }}
            >
              <Avatar
                src={temp.profile.avatar}
                name={temp.profile.name}
                className="w-14 h-14 border-2 border-white/25"
              />
              <span className="max-w-[4.5rem] truncate text-xs opacity-70">{temp.profile.name}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex justify-end">
        {nextSongTitle && (
          <button
            onClick={onSkipNext}
            title="Skip to next song"
            className="flex shrink-0 items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-sm opacity-80 hover:opacity-100 hover:bg-white/10"
          >
            <span className="text-xs uppercase opacity-60 whitespace-nowrap">Up next</span>
            <span className="max-w-[14rem] truncate font-medium">{nextSongTitle}</span>
            <SkipForward className="w-4 h-4 shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
}

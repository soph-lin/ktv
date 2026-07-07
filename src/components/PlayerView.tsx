"use client";

import { useCallback, useRef, useState } from "react";
import YouTube, { YouTubeEvent, YouTubeProps, YouTubePlayer } from "react-youtube";
import { Volume2 } from "lucide-react";
import ErrorSplash from "@/components/ErrorSplash";
import PartyLights from "@/components/PartyLights";
import ReactionOverlay from "@/components/ReactionOverlay";
import DanceFloor from "@/components/DanceFloor";
import { useRoom } from "@/hooks/useRoom";
import { useHostToken } from "@/hooks/useHostToken";
import { errorPayload } from "@/lib/errors";

// Hoisted so it's referentially stable across renders — react-youtube reloads
// the player when this object identity changes, which would otherwise happen
// on every unrelated re-render (e.g. dance/reaction events arriving over SSE).
// Starts muted because browsers block unmuted autoplay outright; the host
// unmutes once via the overlay button below. Note react-youtube fully
// destroys and recreates the player on every videoId change regardless
// (its shouldResetPlayer check), so each new song starts muted again too —
// unlockedRef below re-applies unmute on each fresh instance automatically.
const PLAYER_OPTS: YouTubeProps["opts"] = {
  width: "100%",
  height: "100%",
  playerVars: { autoplay: 1, controls: 1, mute: 1 },
};

export default function PlayerView({ code }: { code: string }) {
  const { room, error, advance, lastReaction, lastSongAdded, dancers } = useRoom(code);
  const hostToken = useHostToken(code);
  const playerRef = useRef<YouTubePlayer | null>(null);
  // Survives react-youtube destroying/recreating the player on every song
  // change (it always does — see PLAYER_OPTS comment below), unlike `muted`
  // state resetting per-instance would.
  const unlockedRef = useRef(false);
  const [muted, setMuted] = useState(true);

  const handleEnd: YouTubeProps["onEnd"] = useCallback(() => {
    advance();
  }, [advance]);

  const handleReady: YouTubeProps["onReady"] = useCallback((event: YouTubeEvent) => {
    playerRef.current = event.target;
    if (unlockedRef.current) {
      event.target.unMute();
    }
  }, []);

  function handleUnmute() {
    unlockedRef.current = true;
    playerRef.current?.unMute();
    setMuted(false);
  }

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center bg-black text-white p-6">
        <ErrorSplash error={error} />
      </main>
    );
  }

  if (!room) {
    return (
      <main className="flex-1 flex items-center justify-center bg-black text-white">
        <p className="opacity-70">Loading...</p>
      </main>
    );
  }

  if (!hostToken) {
    return (
      <main className="flex-1 flex items-center justify-center bg-black text-white p-6">
        <ErrorSplash error={errorPayload("NOT_HOST")} />
      </main>
    );
  }

  return (
    <main className="relative flex-1 flex flex-col bg-black text-white">
      <PartyLights />
      <ReactionOverlay reaction={lastReaction} />

      {room.current ? (
        <div className="relative z-10 flex-1">
          <YouTube
            videoId={room.current.videoId}
            opts={PLAYER_OPTS}
            onEnd={handleEnd}
            onReady={handleReady}
            className="absolute inset-0 w-full h-full"
            iframeClassName="w-full h-full"
          />
          {muted && (
            <button
              onClick={handleUnmute}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-white text-black px-4 py-2 text-sm font-medium shadow-lg transition-colors hover:bg-white/85"
            >
              <Volume2 className="w-4 h-4" />
              Unmute
            </button>
          )}
        </div>
      ) : (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-sm uppercase tracking-widest opacity-50">Room code</p>
          <p className="text-7xl font-bold tracking-widest">{room.code}</p>
          <p className="opacity-60">Waiting for a song to be added...</p>
        </div>
      )}

      <DanceFloor
        dancers={dancers}
        songAdded={lastSongAdded}
        nextSongTitle={room.queue[0]?.title}
        onSkipNext={advance}
      />
    </main>
  );
}

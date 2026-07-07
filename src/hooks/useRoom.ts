"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReorderAction, RoomState } from "@/types/room";
import type { Profile } from "@/types/profile";
import type { ReactionEvent, DanceEvent, SongAddedEvent } from "@/types/reaction";
import { errorPayload, readApiError, type DisplayError } from "@/lib/errors";

export function useRoom(code: string) {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [error, setError] = useState<DisplayError | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastReaction, setLastReaction] = useState<ReactionEvent | null>(null);
  const [lastSongAdded, setLastSongAdded] = useState<SongAddedEvent | null>(null);
  const [dancers, setDancers] = useState<Record<string, Profile>>({});

  useEffect(() => {
    if (!code) return;

    let cancelled = false;

    fetch(`/api/rooms/${code}`)
      .then(async (res) => {
        if (!res.ok) {
          const apiError = await readApiError(res);
          if (!cancelled) setError(apiError ?? errorPayload("ROOM_NOT_FOUND"));
          return;
        }
        const data = (await res.json()) as RoomState;
        if (!cancelled) setRoom(data);
      })
      .catch(() => {
        if (!cancelled) setError(errorPayload("ROOM_NOT_FOUND"));
      });

    const source = new EventSource(`/api/rooms/${code}/stream`);
    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);

    source.addEventListener("state", (event) => {
      setRoom(JSON.parse((event as MessageEvent).data) as RoomState);
    });

    source.addEventListener("reaction", (event) => {
      setLastReaction(JSON.parse((event as MessageEvent).data) as ReactionEvent);
    });

    source.addEventListener("dance", (event) => {
      const dance = JSON.parse((event as MessageEvent).data) as DanceEvent;
      setDancers((prev) => {
        const next = { ...prev };
        if (dance.dancing) next[dance.clientId] = dance.profile;
        else delete next[dance.clientId];
        return next;
      });
    });

    source.addEventListener("songAdded", (event) => {
      setLastSongAdded(JSON.parse((event as MessageEvent).data) as SongAddedEvent);
    });

    source.addEventListener("ended", () => {
      setRoom(null);
      setError(errorPayload("ROOM_NOT_FOUND"));
    });

    return () => {
      cancelled = true;
      source.close();
    };
  }, [code]);

  const addSong = useCallback(
    async (input: { videoId: string; title: string; thumbnail: string; addedBy: Profile }) => {
      const res = await fetch(`/api/rooms/${code}/songs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const apiError = await readApiError(res);
        throw new Error(apiError?.message ?? "Failed to add song");
      }
      setRoom((await res.json()) as RoomState);
    },
    [code]
  );

  const reorder = useCallback(
    async (id: string, action: ReorderAction, targetId?: string) => {
      const res = await fetch(`/api/rooms/${code}/songs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, targetId }),
      });
      if (!res.ok) {
        const apiError = await readApiError(res);
        throw new Error(apiError?.message ?? "Failed to update queue");
      }
      setRoom((await res.json()) as RoomState);
    },
    [code]
  );

  const advance = useCallback(async () => {
    const res = await fetch(`/api/rooms/${code}/advance`, { method: "POST" });
    if (!res.ok) {
      const apiError = await readApiError(res);
      throw new Error(apiError?.message ?? "Failed to advance queue");
    }
    setRoom((await res.json()) as RoomState);
  }, [code]);

  const sendReaction = useCallback(
    async (emoji: string, profile: Profile) => {
      await fetch(`/api/rooms/${code}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji, profile }),
      });
    },
    [code]
  );

  const setDancing = useCallback(
    async (dancing: boolean, profile: Profile, clientId: string) => {
      await fetch(`/api/rooms/${code}/dance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, profile, dancing }),
      });
    },
    [code]
  );

  const endSession = useCallback(
    async (hostToken: string) => {
      const res = await fetch(`/api/rooms/${code}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostToken }),
      });
      if (!res.ok) {
        const apiError = await readApiError(res);
        throw new Error(apiError?.message ?? "Failed to end session");
      }
    },
    [code]
  );

  return {
    room,
    error,
    connected,
    lastReaction,
    lastSongAdded,
    dancers,
    addSong,
    reorder,
    advance,
    sendReaction,
    setDancing,
    endSession,
  };
}

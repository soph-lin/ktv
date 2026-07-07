"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { GripVertical, Loader2, Plus } from "lucide-react";
import { useRoom } from "@/hooks/useRoom";
import { useProfile } from "@/hooks/useProfile";
import { useClientId } from "@/hooks/useClientId";
import { useHostToken } from "@/hooks/useHostToken";
import Avatar from "@/components/Avatar";
import Disclosure from "@/components/Disclosure";
import ErrorSplash from "@/components/ErrorSplash";
import FloatingOrbs from "@/components/FloatingOrbs";
import Modal from "@/components/Modal";
import ProfilePicker from "@/components/ProfilePicker";
import ReactionPicker from "@/components/ReactionPicker";
import type { ReorderAction, Song } from "@/types/room";

interface SearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

export default function RoomView({ code }: { code: string }) {
  const router = useRouter();
  const {
    room,
    error,
    addSong,
    reorder,
    sendReaction,
    setDancing,
    endSession,
  } = useRoom(code);
  const { profile, setProfile, presets } = useProfile();
  const clientId = useClientId();
  const hostToken = useHostToken(code);
  const isHost = Boolean(hostToken);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [preview, setPreview] = useState<SearchResult | null>(null);
  const [dancing, setDancingLocal] = useState(false);
  const [endError, setEndError] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [addingVideoId, setAddingVideoId] = useState<string | null>(null);
  const [resultsOpen, setResultsOpen] = useState(true);

  const dancingRef = useRef(dancing);
  useEffect(() => {
    dancingRef.current = dancing;
  }, [dancing]);

  useEffect(() => {
    function stopDance() {
      if (!dancingRef.current || !clientId) return;
      const payload = JSON.stringify({ clientId, profile, dancing: false });
      navigator.sendBeacon?.(
        `/api/rooms/${code}/dance`,
        new Blob([payload], { type: "application/json" }),
      );
    }
    window.addEventListener("pagehide", stopDance);
    return () => {
      window.removeEventListener("pagehide", stopDance);
      stopDance();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, clientId]);

  async function handleReact(emoji: string) {
    await sendReaction(emoji, profile);
  }

  async function handleToggleDance() {
    const next = !dancing;
    setDancingLocal(next);
    await setDancing(next, profile, clientId);
  }

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResults(data.results);
      setResultsOpen(true);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd(result: SearchResult) {
    setAddingVideoId(result.videoId);
    try {
      await addSong({ ...result, addedBy: profile });
      setResultsOpen(false);
    } finally {
      setAddingVideoId(null);
    }
  }

  async function handleReorder(id: string, action: ReorderAction) {
    await reorder(id, action);
  }

  async function handleDrop(targetId: string) {
    const draggedId = dragId;
    setDragId(null);
    if (!draggedId || draggedId === targetId) return;
    await reorder(draggedId, "move", targetId);
  }

  async function handleRequeue(song: Song) {
    await addSong({
      videoId: song.videoId,
      title: song.title,
      thumbnail: song.thumbnail,
      addedBy: profile,
    });
  }

  async function handleEndSession() {
    if (!hostToken) return;
    if (
      !window.confirm(
        "End this session? This deletes the queue and history for everyone.",
      )
    ) {
      return;
    }
    setEndError(null);
    setEnding(true);
    try {
      await endSession(hostToken);
      router.push("/");
    } catch (err) {
      setEndError(err instanceof Error ? err.message : "Failed to end session");
      setEnding(false);
    }
  }

  if (error) {
    return (
      <main className="relative flex-1 flex items-center justify-center overflow-hidden bg-black p-6 text-white">
        <FloatingOrbs />
        <div className="relative z-10">
          <ErrorSplash error={error} />
        </div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="relative flex-1 flex items-center justify-center overflow-hidden bg-black p-6 text-white">
        <FloatingOrbs />
        <p className="relative z-10 opacity-70">Loading room...</p>
      </main>
    );
  }

  return (
    <main className="relative flex-1 overflow-hidden bg-black text-white">
      <FloatingOrbs />
      <div className="relative z-10 w-full max-w-2xl mx-auto p-6 flex flex-col gap-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase opacity-50">Room</p>
            <h1 className="text-3xl font-bold tracking-widest">{room.code}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ProfilePicker
              profile={profile}
              presets={presets}
              onChange={setProfile}
            />
            <ReactionPicker
              dancing={dancing}
              onReact={handleReact}
              onToggleDance={handleToggleDance}
            />
            {isHost && (
              <>
                <a
                  href={`/room/${room.code}/player`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-current/20 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:bg-current/10"
                >
                  Open player
                </a>
                <button
                  onClick={handleEndSession}
                  disabled={ending}
                  className="rounded-lg bg-red-200 text-red-900 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:bg-red-300 disabled:opacity-50 disabled:hover:bg-red-200"
                >
                  {ending ? "Ending..." : "End session"}
                </button>
              </>
            )}
          </div>
        </header>
        {endError && <p className="text-sm text-red-400">{endError}</p>}

        <section>
          <h2 className="font-semibold mb-2">Now playing</h2>
          {room.current ? (
            <SongRow song={room.current} />
          ) : (
            <p className="opacity-60 text-sm">
              Nothing playing. Add a song below.
            </p>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-semibold">Add a song</h2>
          <form onSubmit={search} className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a song..."
              className="flex-1 rounded-lg border border-current/20 bg-transparent px-4 py-2"
            />
            <button
              type="submit"
              disabled={searching}
              className="flex w-24 items-center justify-center rounded-lg bg-white text-black px-4 py-2 font-medium transition-colors hover:bg-white/85 disabled:opacity-50"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </button>
          </form>
          {searchError && <p className="text-sm text-red-400">{searchError}</p>}
          {results.length > 0 && (
            <Disclosure
              title={`Results (${results.length})`}
              open={resultsOpen}
              onOpenChange={setResultsOpen}
            >
              <ul className="flex flex-col gap-2">
              {results.map((result) => (
                <li
                  key={result.videoId}
                  className="flex items-center gap-3 rounded-lg border border-current/10 p-2"
                >
                  <button
                    onClick={() => setPreview(result)}
                    title="Preview"
                    className="shrink-0"
                  >
                    {result.thumbnail && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={result.thumbnail}
                        alt=""
                        className="w-20 h-14 object-cover rounded hover:opacity-80"
                      />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {result.title}
                    </p>
                    <p className="text-xs opacity-60 truncate">
                      {result.channelTitle}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAdd(result)}
                    disabled={addingVideoId === result.videoId}
                    className="flex items-center justify-center rounded-lg border border-current/20 px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors hover:bg-current/10 disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    {addingVideoId === result.videoId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Add"
                    )}
                  </button>
                </li>
              ))}
              </ul>
            </Disclosure>
          )}
        </section>

        <Disclosure title={`Up next (${room.queue.length})`} defaultOpen>
          {room.queue.length === 0 ? (
            <p className="opacity-60 text-sm">Queue is empty.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {room.queue.map((song, i) => (
                <li
                  key={song.id}
                  draggable
                  onDragStart={() => setDragId(song.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(song.id)}
                  onDragEnd={() => setDragId(null)}
                  className={`flex items-center gap-3 rounded-lg border p-2 transition-colors ${
                    dragId === song.id
                      ? "border-current/30 opacity-40"
                      : "border-current/10"
                  }`}
                >
                  <GripVertical className="w-4 h-4 shrink-0 opacity-40 cursor-grab active:cursor-grabbing" />
                  <span className="w-5 text-center text-xs opacity-50">
                    {i + 1}
                  </span>
                  <SongRow song={song} compact />
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleReorder(song.id, "top")}
                      title="Move to top"
                      className="rounded border border-current/20 px-2 py-1 text-xs transition-colors hover:bg-current/10"
                    >
                      ⤒
                    </button>
                    <button
                      onClick={() => handleReorder(song.id, "up")}
                      title="Move up"
                      disabled={i === 0}
                      className="rounded border border-current/20 px-2 py-1 text-xs transition-colors hover:bg-current/10 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleReorder(song.id, "down")}
                      title="Move down"
                      disabled={i === room.queue.length - 1}
                      className="rounded border border-current/20 px-2 py-1 text-xs transition-colors hover:bg-current/10 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleReorder(song.id, "remove")}
                      title="Remove"
                      className="rounded border border-current/20 px-2 py-1 text-xs transition-colors hover:bg-current/10"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Disclosure>

        <Disclosure title={`History (${room.history.length})`}>
          {room.history.length === 0 ? (
            <p className="opacity-60 text-sm">No songs played yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {[...room.history].reverse().map((song) => (
                <li
                  key={song.id}
                  className="flex items-center gap-3 rounded-lg border border-current/10 p-2"
                >
                  <SongRow song={song} compact />
                  <button
                    onClick={() => handleRequeue(song)}
                    title="Add back to queue"
                    className="shrink-0 rounded border border-current/20 p-1.5 transition-colors hover:bg-current/10"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Disclosure>

        <AnimatePresence>
          {preview && (
            <Modal onClose={() => setPreview(null)}>
              <div className="flex flex-col gap-3">
                <div className="aspect-video w-full">
                  <iframe
                    key={preview.videoId}
                    src={`https://www.youtube.com/embed/${preview.videoId}?autoplay=1`}
                    className="w-full h-full rounded-lg"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="text-sm font-medium">{preview.title}</p>
              </div>
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function SongRow({ song, compact }: { song: Song; compact?: boolean }) {
  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      {song.thumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={song.thumbnail}
          alt=""
          className={
            compact
              ? "w-16 h-11 object-cover rounded"
              : "w-32 h-20 object-cover rounded-lg"
          }
        />
      )}
      <div className="min-w-0">
        <p
          className={
            compact ? "text-sm font-medium truncate" : "font-medium truncate"
          }
        >
          {song.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Avatar
            src={song.addedBy.avatar}
            name={song.addedBy.name}
            className="w-4 h-4"
          />
          <p className="text-xs opacity-60 truncate">{song.addedBy.name}</p>
        </div>
      </div>
    </div>
  );
}

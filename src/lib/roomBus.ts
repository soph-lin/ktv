import type { RoomState } from "@/types/room";
import type { ReactionEvent, DanceEvent, SongAddedEvent } from "@/types/reaction";

export type RoomEvent =
  | { kind: "state"; state: RoomState }
  | { kind: "reaction"; reaction: ReactionEvent }
  | { kind: "dance"; dance: DanceEvent }
  | { kind: "songAdded"; songAdded: SongAddedEvent }
  | { kind: "ended" };

type Listener = (event: RoomEvent) => void;

const subscribers = new Map<string, Set<Listener>>();

export function subscribe(code: string, listener: Listener): () => void {
  let set = subscribers.get(code);
  if (!set) {
    set = new Set();
    subscribers.set(code, set);
  }
  set.add(listener);
  return () => {
    set!.delete(listener);
    if (set!.size === 0) subscribers.delete(code);
  };
}

export function publish(code: string, event: RoomEvent): void {
  const set = subscribers.get(code);
  if (!set) return;
  for (const listener of set) listener(event);
}

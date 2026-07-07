import type { Profile } from "@/types/profile";

export interface Song {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  addedBy: Profile;
  addedAt: number;
}

export interface RoomState {
  code: string;
  queue: Song[];
  current: Song | null;
  history: Song[];
}

export type ReorderAction = "top" | "up" | "down" | "remove" | "move";

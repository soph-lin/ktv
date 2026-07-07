import type { Profile } from "@/types/profile";

export const REACTION_EMOJIS = ["👍", "❤️", "😂", "🔥", "🎉"] as const;

export interface ReactionEvent {
  id: string;
  emoji: string;
  profile: Profile;
  sentAt: number;
}

export interface DanceEvent {
  clientId: string;
  profile: Profile;
  dancing: boolean;
}

export interface SongAddedEvent {
  id: string;
  profile: Profile;
  sentAt: number;
}

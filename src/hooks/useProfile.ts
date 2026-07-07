"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/types/profile";

const STORAGE_KEY = "ktv:profile";
const ADJECTIVES = ["Happy", "Silly", "Loud", "Sneaky", "Golden", "Mighty", "Cosmic", "Jazzy"];
const NOUNS = ["Mic", "Star", "Tiger", "Panda", "Rocket", "Ninja", "Otter", "Wizard"];

function randomName(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective} ${noun}`;
}

function loadProfile(): Profile {
  if (typeof window === "undefined") return { name: "", avatar: "" };
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.name === "string") {
        return { name: parsed.name, avatar: typeof parsed.avatar === "string" ? parsed.avatar : "" };
      }
    } catch {
      // fall through to a fresh profile
    }
  }
  return { name: randomName(), avatar: "" };
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(loadProfile);
  const [presets, setPresets] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/pfp")
      .then((res) => (res.ok ? res.json() : { avatars: [] }))
      .then((data: { avatars: string[] }) => {
        setPresets(data.avatars);
        setProfile((current) =>
          current.avatar || data.avatars.length === 0
            ? current
            : { ...current, avatar: data.avatars[Math.floor(Math.random() * data.avatars.length)] }
        );
      })
      .catch(() => setPresets([]));
  }, []);

  useEffect(() => {
    if (profile.name) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  return { profile, setProfile, presets };
}

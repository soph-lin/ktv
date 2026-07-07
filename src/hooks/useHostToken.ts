"use client";

import { useState } from "react";

function storageKey(code: string): string {
  return `ktv:host:${code}`;
}

export function useHostToken(code: string): string | null {
  const [hostToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(storageKey(code));
  });
  return hostToken;
}

export function saveHostToken(code: string, hostToken: string): void {
  window.localStorage.setItem(storageKey(code), hostToken);
}

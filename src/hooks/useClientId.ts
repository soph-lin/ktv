"use client";

import { useState } from "react";

const STORAGE_KEY = "ktv:clientId";

function loadClientId(): string {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  window.localStorage.setItem(STORAGE_KEY, id);
  return id;
}

export function useClientId(): string {
  const [clientId] = useState(loadClientId);
  return clientId;
}

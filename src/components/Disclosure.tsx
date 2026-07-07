"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function Disclosure({
  title,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = openProp ?? internalOpen;

  function toggle() {
    const next = !open;
    if (onOpenChange) onOpenChange(next);
    else setInternalOpen(next);
  }

  return (
    <section className="flex flex-col gap-3">
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between font-semibold transition-colors hover:opacity-80"
      >
        <span>{title}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && children}
    </section>
  );
}

"use client";

import { useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Upload } from "lucide-react";
import Avatar from "@/components/Avatar";
import Modal from "@/components/Modal";
import { resizeImageToDataUrl } from "@/lib/image";
import type { Profile } from "@/types/profile";

export default function ProfilePicker({
  profile,
  presets,
  onChange,
}: {
  profile: Profile;
  presets: string[];
  onChange: (profile: Profile) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(profile.name);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function openEditor() {
    setName(profile.name);
    setUploadError(null);
    setOpen(true);
  }

  function commitName() {
    const trimmed = name.trim();
    if (trimmed && trimmed !== profile.name) {
      onChange({ ...profile, name: trimmed });
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      onChange({ ...profile, avatar: dataUrl });
      setUploadError(null);
    } catch {
      setUploadError("Could not use that image. Try a different file.");
    }
  }

  return (
    <>
      <button
        onClick={openEditor}
        className="flex items-center gap-2 rounded-full border border-current/20 pl-1 pr-3 py-1 transition-colors hover:bg-current/10"
      >
        <Avatar src={profile.avatar} name={profile.name} className="w-7 h-7" />
        <span className="text-sm font-medium max-w-[8rem] truncate">{profile.name}</span>
      </button>

      <AnimatePresence>
        {open && (
          <Modal onClose={() => setOpen(false)}>
            <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <Avatar src={profile.avatar} name={profile.name} className="w-14 h-14" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={commitName}
                placeholder="Your name"
                className="flex-1 rounded-lg border border-current/20 bg-transparent px-3 py-2"
              />
            </div>

            <div>
              <p className="text-xs uppercase opacity-50 mb-2">Choose an avatar</p>
              {presets.length === 0 ? (
                <p className="text-sm opacity-60">No preset avatars available yet.</p>
              ) : (
                <div className="grid grid-cols-6 gap-2">
                  {presets.map((src) => (
                    <button
                      key={src}
                      onClick={() => onChange({ ...profile, avatar: src })}
                      className="rounded-full p-0.5 transition-colors hover:bg-current/10"
                    >
                      <Avatar
                        src={src}
                        name={name}
                        className={`w-10 h-10 ${
                          profile.avatar === src ? "ring-2 ring-foreground" : ""
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                title="Upload photo"
                aria-label="Upload photo"
                className="rounded-full border border-current/20 p-3 transition-colors hover:bg-current/10"
              >
                <Upload className="w-5 h-5" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
              {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
            </div>

            <button
              onClick={() => {
                commitName();
                setOpen(false);
              }}
              className="rounded-lg bg-white text-black py-2 font-medium transition-colors hover:bg-white/85"
            >
              Done
            </button>
          </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

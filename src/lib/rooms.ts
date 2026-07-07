import type { ReorderAction, RoomState, Song } from "@/types/room";
import type { Profile } from "@/types/profile";
import type { DanceEvent } from "@/types/reaction";
import { AppError } from "@/lib/errors";
import { publish } from "@/lib/roomBus";
import { prisma } from "@/lib/prisma";
import type { Song as SongRow } from "@prisma/client";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
const MAX_HISTORY = 200;

function generateRoomCode(length = 5): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

function toSong(row: SongRow): Song {
  return {
    id: row.id,
    videoId: row.videoId,
    title: row.title,
    thumbnail: row.thumbnail,
    addedBy: row.addedBy as unknown as Profile,
    addedAt: row.createdAt.getTime(),
  };
}

async function loadState(code: string): Promise<RoomState | null> {
  const room = await prisma.room.findUnique({
    where: { code: code.toUpperCase() },
    include: { songs: true },
  });
  if (!room) return null;

  const current = room.songs.find((s) => s.status === "CURRENT") ?? null;
  const queue = room.songs
    .filter((s) => s.status === "QUEUED")
    .sort((a, b) => a.position - b.position);
  const history = room.songs
    .filter((s) => s.status === "HISTORY")
    .sort((a, b) => (b.playedAt?.getTime() ?? 0) - (a.playedAt?.getTime() ?? 0))
    .slice(0, MAX_HISTORY)
    .reverse();

  return {
    code: room.code,
    current: current ? toSong(current) : null,
    queue: queue.map(toSong),
    history: history.map(toSong),
  };
}

async function requireRoomRecord(code: string) {
  const room = await prisma.room.findUnique({ where: { code: code.toUpperCase() } });
  if (!room) throw new AppError("ROOM_NOT_FOUND");
  return room;
}

async function broadcast(code: string): Promise<RoomState> {
  const state = await loadState(code);
  if (!state) throw new AppError("ROOM_NOT_FOUND");
  publish(state.code, { kind: "state", state });
  return state;
}

export async function createRoom(): Promise<{ code: string; hostToken: string }> {
  let code = generateRoomCode();
  while (await prisma.room.findUnique({ where: { code } })) {
    code = generateRoomCode();
  }
  const hostToken = crypto.randomUUID();
  const room = await prisma.room.create({ data: { code, hostToken } });
  return { code: room.code, hostToken: room.hostToken };
}

export async function getRoom(code: string): Promise<RoomState | null> {
  return loadState(code);
}

export async function endRoom(code: string, hostToken: string): Promise<void> {
  const room = await prisma.room.findUnique({ where: { code: code.toUpperCase() } });
  if (!room) throw new AppError("ROOM_NOT_FOUND");
  if (room.hostToken !== hostToken) throw new AppError("FORBIDDEN", 403);
  await prisma.room.delete({ where: { id: room.id } });
  clearDancers(room.code);
  publish(room.code, { kind: "ended" });
}

export async function addSong(
  code: string,
  input: { videoId: string; title: string; thumbnail: string; addedBy: Profile }
): Promise<RoomState> {
  const room = await requireRoomRecord(code);
  const addedBy = {
    name: input.addedBy?.name || "Anonymous",
    avatar: input.addedBy?.avatar || "",
  };

  const current = await prisma.song.findFirst({
    where: { roomId: room.id, status: "CURRENT" },
  });

  if (!current) {
    await prisma.song.create({
      data: {
        roomId: room.id,
        videoId: input.videoId,
        title: input.title,
        thumbnail: input.thumbnail,
        addedBy,
        status: "CURRENT",
        position: 0,
      },
    });
  } else {
    const last = await prisma.song.findFirst({
      where: { roomId: room.id, status: "QUEUED" },
      orderBy: { position: "desc" },
    });
    await prisma.song.create({
      data: {
        roomId: room.id,
        videoId: input.videoId,
        title: input.title,
        thumbnail: input.thumbnail,
        addedBy,
        status: "QUEUED",
        position: (last?.position ?? -1) + 1,
      },
    });
  }

  const state = await broadcast(room.code);
  publish(room.code, {
    kind: "songAdded",
    songAdded: { id: crypto.randomUUID(), profile: addedBy, sentAt: Date.now() },
  });
  return state;
}

export async function reorderSong(
  code: string,
  id: string,
  action: ReorderAction,
  targetId?: string
): Promise<RoomState> {
  const room = await requireRoomRecord(code);
  const queued = await prisma.song.findMany({
    where: { roomId: room.id, status: "QUEUED" },
    orderBy: { position: "asc" },
  });

  const index = queued.findIndex((s) => s.id === id);
  if (index === -1) return (await loadState(code))!;

  const [song] = queued.splice(index, 1);

  if (action === "remove") {
    await prisma.song.delete({ where: { id } });
  } else {
    switch (action) {
      case "top":
        queued.unshift(song);
        break;
      case "up":
        queued.splice(Math.max(0, index - 1), 0, song);
        break;
      case "down":
        queued.splice(Math.min(queued.length, index + 1), 0, song);
        break;
      case "move": {
        const targetIndex = targetId ? queued.findIndex((s) => s.id === targetId) : -1;
        queued.splice(targetIndex === -1 ? queued.length : targetIndex, 0, song);
        break;
      }
    }
    await prisma.$transaction(
      queued.map((s, i) => prisma.song.update({ where: { id: s.id }, data: { position: i } }))
    );
  }

  return broadcast(room.code);
}

export async function advance(code: string): Promise<RoomState> {
  const room = await requireRoomRecord(code);

  await prisma.song.updateMany({
    where: { roomId: room.id, status: "CURRENT" },
    data: { status: "HISTORY", playedAt: new Date() },
  });

  const next = await prisma.song.findFirst({
    where: { roomId: room.id, status: "QUEUED" },
    orderBy: { position: "asc" },
  });
  if (next) {
    await prisma.song.update({ where: { id: next.id }, data: { status: "CURRENT" } });
  }

  return broadcast(room.code);
}

export async function sendReaction(
  code: string,
  input: { emoji: string; profile: Profile }
): Promise<void> {
  await requireRoomRecord(code);
  publish(code.toUpperCase(), {
    kind: "reaction",
    reaction: {
      id: crypto.randomUUID(),
      emoji: input.emoji,
      profile: {
        name: input.profile?.name || "Anonymous",
        avatar: input.profile?.avatar || "",
      },
      sentAt: Date.now(),
    },
  });
}

// Dancing/reactions are ephemeral presence, not persisted — kept in-memory per room.
const dancersByCode = new Map<string, Map<string, DanceEvent>>();

export async function setDancing(
  code: string,
  input: { clientId: string; profile: Profile; dancing: boolean }
): Promise<void> {
  await requireRoomRecord(code);
  const upper = code.toUpperCase();
  let dancers = dancersByCode.get(upper);
  if (!dancers) {
    dancers = new Map();
    dancersByCode.set(upper, dancers);
  }

  const dance: DanceEvent = {
    clientId: input.clientId,
    profile: {
      name: input.profile?.name || "Anonymous",
      avatar: input.profile?.avatar || "",
    },
    dancing: input.dancing,
  };
  if (dance.dancing) dancers.set(dance.clientId, dance);
  else dancers.delete(dance.clientId);
  publish(upper, { kind: "dance", dance });
}

export function getDancers(code: string): DanceEvent[] {
  const dancers = dancersByCode.get(code.toUpperCase());
  return dancers ? Array.from(dancers.values()) : [];
}

function clearDancers(code: string): void {
  dancersByCode.delete(code.toUpperCase());
}

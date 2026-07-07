import { NextResponse } from "next/server";
import { AppError, appErrorResponse } from "@/lib/errors";
import { reorderSong } from "@/lib/rooms";
import type { ReorderAction } from "@/types/room";

const VALID_ACTIONS: ReorderAction[] = ["top", "up", "down", "remove", "move"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ code: string; id: string }> }
) {
  const { code, id } = await params;
  const body = await req.json();
  const action = body?.action as ReorderAction;
  const targetId = typeof body?.targetId === "string" ? body.targetId : undefined;

  if (!VALID_ACTIONS.includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    const room = await reorderSong(code, id, action, targetId);
    return NextResponse.json(room);
  } catch (err) {
    if (err instanceof AppError) return appErrorResponse(err);
    throw err;
  }
}

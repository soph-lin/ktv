import { NextResponse } from "next/server";
import { AppError, appErrorResponse, errorPayload } from "@/lib/errors";
import { endRoom, getRoom } from "@/lib/rooms";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const room = await getRoom(code);
  if (!room) {
    return NextResponse.json(errorPayload("ROOM_NOT_FOUND"), { status: 404 });
  }
  return NextResponse.json(room);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const body = await req.json().catch(() => ({}));
  const hostToken = body?.hostToken;

  if (!hostToken) {
    return NextResponse.json(errorPayload("FORBIDDEN"), { status: 403 });
  }

  try {
    await endRoom(code, hostToken);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AppError) return appErrorResponse(err);
    throw err;
  }
}

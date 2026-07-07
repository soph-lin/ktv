import { NextResponse } from "next/server";
import { AppError, appErrorResponse } from "@/lib/errors";
import { sendReaction } from "@/lib/rooms";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const body = await req.json();
  const { emoji, profile } = body ?? {};

  if (!emoji) {
    return NextResponse.json({ error: "emoji is required" }, { status: 400 });
  }

  try {
    await sendReaction(code, {
      emoji,
      profile: { name: profile?.name ?? "Anonymous", avatar: profile?.avatar ?? "" },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AppError) return appErrorResponse(err);
    throw err;
  }
}

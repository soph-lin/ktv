import { NextResponse } from "next/server";
import { AppError, appErrorResponse } from "@/lib/errors";
import { addSong } from "@/lib/rooms";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const body = await req.json();
  const { videoId, title, thumbnail, addedBy } = body ?? {};

  if (!videoId || !title) {
    return NextResponse.json({ error: "videoId and title are required" }, { status: 400 });
  }

  try {
    const room = await addSong(code, {
      videoId,
      title,
      thumbnail: thumbnail ?? "",
      addedBy: { name: addedBy?.name ?? "Anonymous", avatar: addedBy?.avatar ?? "" },
    });
    return NextResponse.json(room);
  } catch (err) {
    if (err instanceof AppError) return appErrorResponse(err);
    throw err;
  }
}

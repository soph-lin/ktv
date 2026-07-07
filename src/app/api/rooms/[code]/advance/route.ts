import { NextResponse } from "next/server";
import { AppError, appErrorResponse } from "@/lib/errors";
import { advance } from "@/lib/rooms";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  try {
    const room = await advance(code);
    return NextResponse.json(room);
  } catch (err) {
    if (err instanceof AppError) return appErrorResponse(err);
    throw err;
  }
}

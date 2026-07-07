import { NextResponse } from "next/server";
import { AppError, appErrorResponse } from "@/lib/errors";
import { setDancing } from "@/lib/rooms";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const body = await req.json();
  const { clientId, profile, dancing } = body ?? {};

  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  try {
    await setDancing(code, {
      clientId,
      profile: { name: profile?.name ?? "Anonymous", avatar: profile?.avatar ?? "" },
      dancing: Boolean(dancing),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AppError) return appErrorResponse(err);
    throw err;
  }
}

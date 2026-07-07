import { ERRORS } from "@/lib/errors";
import { getRoom, getDancers } from "@/lib/rooms";
import { subscribe, type RoomEvent } from "@/lib/roomBus";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const room = await getRoom(code);
  if (!room) {
    return new Response(ERRORS.ROOM_NOT_FOUND.message, { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: RoomEvent) => {
        const payload =
          event.kind === "state"
            ? event.state
            : event.kind === "reaction"
              ? event.reaction
              : event.kind === "dance"
                ? event.dance
                : event.kind === "songAdded"
                  ? event.songAdded
                  : {};
        controller.enqueue(encoder.encode(`event: ${event.kind}\ndata: ${JSON.stringify(payload)}\n\n`));
      };
      send({ kind: "state", state: room });
      for (const dance of getDancers(code)) {
        send({ kind: "dance", dance });
      }
      const unsubscribe = subscribe(code.toUpperCase(), send);
      req.signal.addEventListener("abort", () => {
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

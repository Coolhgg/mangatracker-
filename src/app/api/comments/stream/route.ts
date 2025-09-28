import { NextRequest } from "next/server";
import { eventsBus } from "@/lib/events";

export const runtime = "nodejs";

// SSE stream for realtime comments (mock via EventEmitter)
export async function GET(_req: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      function send(data: any) {
        const payload = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      }

      // initial heartbeat
      controller.enqueue(encoder.encode(": connected\n\n"));

      const listener = (evt: any) => send(evt);
      eventsBus.on("comments", listener);

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": ping\n\n"));
      }, 15000);

      // cleanup
      // @ts-ignore
      controller._cleanup = () => {
        clearInterval(heartbeat);
        eventsBus.off("comments", listener);
      };
    },
    cancel() {
      // @ts-ignore
      if (typeof (this as any)._cleanup === "function") (this as any)._cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
import { NextResponse } from "next/server";

type Bucket = { count: number; reset: number };

const store = new Map<string, Bucket>();

function prune(now: number) {
  if (store.size <= 8000) return;
  for (const [k, v] of store) {
    if (v.reset <= now) store.delete(k);
  }
}

export function clientIpFromRequest(req: Pick<Request, "headers">): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) {
    const first = xf.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  return "unknown";
}

export function takeRateToken(
  key: string,
  max: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  prune(now);
  let b = store.get(key);
  if (!b || now >= b.reset) {
    b = { count: 1, reset: now + windowMs };
    store.set(key, b);
    return { ok: true };
  }
  if (b.count >= max) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((b.reset - now) / 1000)) };
  }
  b.count += 1;
  return { ok: true };
}

export function rateLimitJson(
  req: Pick<Request, "headers">,
  routeKey: string,
  max: number,
  windowMs: number,
): NextResponse | null {
  const ip = clientIpFromRequest(req);
  const r = takeRateToken(`${routeKey}:${ip}`, max, windowMs);
  if (r.ok) return null;
  return NextResponse.json(
    { error: "Забагато запитів. Зачекай трохи й спробуй ще раз." },
    {
      status: 429,
      headers: {
        "Retry-After": String(r.retryAfter),
        "Cache-Control": "no-store",
      },
    },
  );
}

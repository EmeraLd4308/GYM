import { NextResponse } from "next/server";

export function getRequestOrigin(req: Request): string {
  try {
    const url = new URL(req.url);
    const fromHeader =
      req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
      req.headers.get("host")?.trim() ||
      "";
    if (fromHeader) {
      const proto =
        req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
        url.protocol.replace(":", "") ||
        "http";
      return `${proto}://${fromHeader}`;
    }
    if (url.hostname === "0.0.0.0" || url.hostname === "[::]") {
      const port = url.port ? `:${url.port}` : "";
      return `${url.protocol}//127.0.0.1${port}`;
    }
    return `${url.protocol}//${url.host}`;
  } catch {
    const v = process.env.VERCEL_URL?.trim();
    if (v) return `https://${v}`;
    return "http://127.0.0.1:3000";
  }
}

export function redirectUrl(req: Request, pathnameAndQuery: string): URL {
  return new URL(pathnameAndQuery, getRequestOrigin(req));
}

export function redirectAuthFormError(req: Request, message: string): NextResponse {
  try {
    return NextResponse.redirect(redirectUrl(req, "/?err=" + encodeURIComponent(message)), 303);
  } catch {
    const base = process.env.VERCEL_URL?.trim()
      ? `https://${process.env.VERCEL_URL!.trim()}`
      : "http://127.0.0.1:3000";
    return NextResponse.redirect(`${base}/?err=${encodeURIComponent(message)}`, 303);
  }
}

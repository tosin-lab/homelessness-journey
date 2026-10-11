import { next } from "@vercel/functions";
import {
  ACCESS_PATH, COOKIE, SIGNOUT_PATH, clearCookie, hashCode, loginPage, normalise, readCookie, safeNext, setCookie, validCodes
} from "./src/lib/access";

/**
 * Vercel Routing Middleware: runs on Vercel's servers before ANY file is served,
 * so nobody can load the app or its content without a valid access code.
 * (It doesn't run in `npm run dev`, so local development stays open.)
 */
export const config = {
  // Everything except the icons and the clean-up service worker
  matcher: ["/((?!favicon\\.svg|icon-192\\.png|icon-512\\.png|sw\\.js|robots\\.txt).*)"]
};

const html = (body: string, status = 200, headers: Record<string, string> = {}) =>
  new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex", ...headers }
  });

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const codes = validCodes(process.env.ACCESS_CODES);

  // Sign out
  if (url.pathname === SIGNOUT_PATH) {
    return new Response(null, { status: 303, headers: { location: "/", "set-cookie": clearCookie(), "cache-control": "no-store" } });
  }

  // Code submitted from the sign-in page
  if (url.pathname === ACCESS_PATH && request.method === "POST") {
    const form = await request.formData();
    const code = normalise(String(form.get("code") ?? ""));
    const dest = safeNext(form.get("next"));
    if (codes.length && codes.includes(code)) {
      return new Response(null, {
        status: 303,
        headers: { location: dest, "set-cookie": setCookie(await hashCode(code)), "cache-control": "no-store" }
      });
    }
    return html(loginPage(dest, "That code isn't valid or has expired. Check it and try again.", codes.length === 0), 401);
  }

  // Already signed in with a code that is still valid?
  const cookie = readCookie(request.headers.get("cookie"), COOKIE);
  if (cookie && codes.length) {
    const hashes = await Promise.all(codes.map(hashCode));
    if (hashes.includes(cookie)) return next({ headers: { "x-robots-tag": "noindex" } });
  }

  // Not signed in: page requests get the sign-in page, everything else is refused
  const accept = request.headers.get("accept") ?? "";
  if (request.method === "GET" && accept.includes("text/html")) {
    return html(loginPage(safeNext(url.pathname + url.search), "", codes.length === 0), 401);
  }
  return new Response("Access code required", { status: 401, headers: { "cache-control": "no-store" } });
}

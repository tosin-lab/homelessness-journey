/**
 * Access-code gate for the live site. Everything is in this one file, with no imports,
 * because Vercel runs middleware without bundling it.
 *
 * Codes live in the ACCESS_CODES environment variable (never in the repo):
 *   HJ-7KQ4-M2XP, HJ-9DRT-3WNA:2027-03-31, HJ-...
 * Separate codes with commas or new lines. Add ":YYYY-MM-DD" to make a code stop working after that date.
 *
 * When someone enters a valid code we store a hash of it in a cookie. Every request re-checks that the
 * hash still matches a current code, so deleting a code (and redeploying) removes access straight away.
 */

export const COOKIE = "hj_access";
export const MAX_AGE_SECONDS = 60 * 60 * 24 * 90; // stay signed in for 90 days
export const ACCESS_PATH = "/__access";
export const SIGNOUT_PATH = "/__signout";

export function normalise(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

/** Parse ACCESS_CODES into the list of codes that are valid today. */
export function validCodes(raw: string | undefined, today: Date = new Date()): string[] {
  if (!raw) return [];
  const todayISO = today.toISOString().slice(0, 10);
  return raw
    .split(/[,\n;]/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(entry => {
      const [code, expiry] = entry.split(":").map(s => s.trim());
      if (expiry && /^\d{4}-\d{2}-\d{2}$/.test(expiry) && expiry < todayISO) return "";
      return normalise(code ?? "");
    })
    .filter(c => c.length >= 6);
}

export async function hashCode(code: string): Promise<string> {
  const data = new TextEncoder().encode("hj-access:" + normalise(code));
  const buf = await crypto.subtle.digest("SHA-256", data);
  let bin = "";
  new Uint8Array(buf).forEach(b => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

export function setCookie(value: string): string {
  return `${COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=${MAX_AGE_SECONDS}; HttpOnly; Secure; SameSite=Lax`;
}

export function clearCookie(): string {
  return `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

/** Only allow redirects back to a path on this site. */
export function safeNext(next: unknown): string {
  const s = typeof next === "string" ? next : "/";
  if (!s.startsWith("/") || s.startsWith("//") || s.startsWith("/__")) return "/";
  return s;
}

const LOGO = "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20rx%3D%2214%22%20fill%3D%22%232C5F2D%22/%3E%3Cpath%20d%3D%22M14%2031%2032%2016l18%2015%22%20fill%3D%22none%22%20stroke%3D%22%2397BC62%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3Cpath%20d%3D%22M20%2029v18h24V29%22%20fill%3D%22none%22%20stroke%3D%22%23fff%22%20stroke-width%3D%225%22%20stroke-linejoin%3D%22round%22/%3E%3Cpath%20d%3D%22M29%2047V37h6v10%22%20fill%3D%22%23fff%22/%3E%3C/svg%3E";

/** Let the request continue to the site (same as `next()` from @vercel/functions). */
function next(init?: { headers?: Record<string, string> }): Response {
  const headers = new Headers(init?.headers ?? {});
  headers.set("x-middleware-next", "1");
  return new Response(null, { headers });
}

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function loginPage(next: string, message = "", notConfigured = false): string {
  const msg = notConfigured
    ? `<p class="msg info" role="status">Access hasn't been switched on yet. Please check back soon.</p>`
    : message
      ? `<p class="msg" role="alert">${esc(message)}</p>`
      : "";
  return `<!doctype html>
<html lang="en-GB"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><meta name="theme-color" content="#2C5F2D">
<link rel="icon" type="image/svg+xml" href="${LOGO}">
<title>Sign in | Homelessness Journey</title>
<style>
:root{color-scheme:light}*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#F4F6EF;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#1f2a1a;padding:20px}
.card{background:#fff;border:1px solid #dde3d2;border-top:6px solid #2C5F2D;border-radius:14px;max-width:440px;width:100%;padding:28px 28px 24px;box-shadow:0 4px 18px rgba(0,0,0,.06)}
.brand{display:flex;align-items:center;gap:10px;margin-bottom:14px}.brand img{width:38px;height:38px;border-radius:9px}
h1{font-family:Georgia,"Times New Roman",serif;font-size:24px;margin:0}
p{color:#55614c;line-height:1.5;margin:8px 0 16px}
label{display:block;font-weight:600;margin-bottom:6px}
input{width:100%;padding:12px;font-size:18px;letter-spacing:.06em;text-transform:uppercase;border:1px solid #c9d1bc;border-radius:9px}
input:focus{outline:3px solid #f2b705;outline-offset:1px}
button{margin-top:14px;width:100%;padding:12px;font-size:16px;font-weight:700;background:#2C5F2D;color:#fff;border:0;border-radius:9px;cursor:pointer}
.msg{background:#fbecea;border-left:4px solid #a8473a;padding:9px 12px;border-radius:6px;color:#1f2a1a}
.msg.info{background:#eef3f7;border-color:#3e5c76}
small{display:block;margin-top:16px;color:#55614c}
</style></head>
<body><main class="card">
<div class="brand"><img src="${LOGO}" alt=""><h1>Homelessness Journey</h1></div>
<p>This training guide is for invited trainees only. Enter the access code your trainer gave you.</p>
${msg}
<form method="post" action="${ACCESS_PATH}">
<label for="code">Access code</label>
<input id="code" name="code" autocomplete="off" autocapitalize="characters" spellcheck="false" required autofocus placeholder="HJ-XXXX-XXXX">
<input type="hidden" name="next" value="${esc(next)}">
<button type="submit">Continue</button>
</form>
<small>Don't have a code? Ask your trainer. You'll stay signed in on this device for 90 days.</small>
</main></body></html>`;
}


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

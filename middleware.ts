/**
 * Sign-in gate for the live site (Vercel Routing Middleware).
 *
 * Runs on Vercel's servers before ANY page or file is served. Visitors need a valid Firebase sign-in,
 * which the browser keeps in the `hj_token` cookie (a Firebase ID token, refreshed automatically).
 * We check the token's signature against Google's public keys, so it can't be faked.
 *
 * Everything is in this one file, with no imports, because Vercel runs middleware without bundling it.
 * It doesn't run in `npm run dev`, so local development stays open.
 *
 * Needs one environment variable in Vercel: FIREBASE_CONFIG (the firebaseConfig object from the Firebase console).
 */

export const TOKEN_COOKIE = "hj_token";
export const SIGNOUT_PATH = "/__signout";
const FIREBASE_SDK = "https://www.gstatic.com/firebasejs/13.0.0";
const JWKS_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
}

/** Accepts the config as JSON or as the `{ apiKey: "...", ... }` snippet copied from the Firebase console. */
export function parseFirebaseConfig(raw: string | undefined): FirebaseConfig | null {
  if (!raw) return null;
  const out: Record<string, string> = {};
  for (const m of raw.matchAll(/["']?(\w+)["']?\s*:\s*["']([^"']*)["']/g)) out[m[1]] = m[2];
  if (!out.apiKey || !out.authDomain || !out.projectId) return null;
  return { apiKey: out.apiKey, authDomain: out.authDomain, projectId: out.projectId, appId: out.appId ?? "" };
}

export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

// ---------- Firebase ID token verification (RS256, Google's public keys) ----------

let keyCache: { keys: (JsonWebKey & { kid?: string })[]; expires: number } | null = null;

/** For tests. */
export function __resetKeyCache() {
  keyCache = null;
}

async function getKeys(force = false) {
  const now = Date.now();
  if (!force && keyCache && keyCache.expires > now) return keyCache.keys;
  const res = await fetch(JWKS_URL);
  if (!res.ok) throw new Error("Could not fetch Google public keys");
  const body = (await res.json()) as { keys: (JsonWebKey & { kid?: string })[] };
  const maxAge = Number(/max-age=(\d+)/.exec(res.headers.get("cache-control") ?? "")?.[1] ?? 3600);
  keyCache = { keys: body.keys, expires: now + Math.min(maxAge, 6 * 3600) * 1000 };
  return keyCache.keys;
}

function b64urlToBytes(s: string): Uint8Array<ArrayBuffer> {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const decodeJson = (s: string) => JSON.parse(new TextDecoder().decode(b64urlToBytes(s)));

export async function verifyIdToken(token: string, projectId: string, nowSec = Math.floor(Date.now() / 1000)): Promise<{ uid: string; email: string } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const header = decodeJson(parts[0]);
    const p = decodeJson(parts[1]);
    if (header.alg !== "RS256" || !header.kid) return null;
    if (p.aud !== projectId || p.iss !== `https://securetoken.google.com/${projectId}`) return null;
    if (typeof p.sub !== "string" || !p.sub) return null;
    if (typeof p.exp !== "number" || p.exp <= nowSec) return null;
    if (typeof p.iat !== "number" || p.iat > nowSec + 300) return null;

    let keys = await getKeys();
    let jwk = keys.find(k => k.kid === header.kid);
    if (!jwk) {
      keys = await getKeys(true);
      jwk = keys.find(k => k.kid === header.kid);
    }
    if (!jwk) return null;
    const key = await crypto.subtle.importKey(
      "jwk",
      { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const ok = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      b64urlToBytes(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    );
    return ok ? { uid: p.sub, email: String(p.email ?? "") } : null;
  } catch {
    return null;
  }
}

// ---------- Sign-in page ----------

/** JSON that is safe to place inside a <script> tag. */
const js = (v: unknown) => JSON.stringify(v).replace(/</g, "\\u003c");


const LOGO = "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20rx%3D%2214%22%20fill%3D%22%232C5F2D%22/%3E%3Cpath%20d%3D%22M14%2031%2032%2016l18%2015%22%20fill%3D%22none%22%20stroke%3D%22%2397BC62%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3Cpath%20d%3D%22M20%2029v18h24V29%22%20fill%3D%22none%22%20stroke%3D%22%23fff%22%20stroke-width%3D%225%22%20stroke-linejoin%3D%22round%22/%3E%3Cpath%20d%3D%22M29%2047V37h6v10%22%20fill%3D%22%23fff%22/%3E%3C/svg%3E";

interface PageOpts {
  next: string;
  config: FirebaseConfig | null;
  signout?: boolean;
  staleToken?: boolean;
}

export function signInPage({ next, config, signout = false, staleToken = false }: PageOpts): string {
  const body = config
    ? `<p>This training guide is for invited trainees only. Sign in with the email address your trainer added.</p>
<p id="msg" class="msg" role="alert" hidden></p>
<div id="busy" class="muted">Checking your sign-in...</div>
<form id="signin" hidden>
<label for="email">Email address</label>
<input id="email" type="email" autocomplete="email" required>
<label for="password">Password</label>
<input id="password" type="password" autocomplete="current-password" required>
<button type="submit">Sign in</button>
<button type="button" id="show-reset" class="link">First time here, or forgotten your password?</button>
</form>
<form id="reset" hidden>
<p class="hint">Enter your email and we'll send you a link to set your password. Check your junk folder if it doesn't arrive.</p>
<label for="reset-email">Email address</label>
<input id="reset-email" type="email" autocomplete="email" required>
<button type="submit">Send me a link</button>
<button type="button" id="back" class="link">Back to sign in</button>
</form>
<script type="module">
import { initializeApp } from "${FIREBASE_SDK}/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "${FIREBASE_SDK}/firebase-auth.js";
const NEXT = ${js(next)};
const SIGNOUT = ${signout ? "true" : "false"};
const STALE = ${staleToken ? "true" : "false"};
const auth = getAuth(initializeApp(${js(config)}));
const $ = id => document.getElementById(id);
const setCookie = t => { document.cookie = "${TOKEN_COOKIE}=" + t + "; Path=/; Max-Age=3600; Secure; SameSite=Lax"; };
const clearCookie = () => { document.cookie = "${TOKEN_COOKIE}=; Path=/; Max-Age=0; Secure; SameSite=Lax"; };
const show = id => { for (const f of ["busy", "signin", "reset"]) $(f).hidden = f !== id; };
const say = (text, ok) => { const m = $("msg"); m.textContent = text; m.className = ok ? "msg ok" : "msg"; m.hidden = !text; };
const ERRORS = {
  "auth/invalid-credential": "That email or password isn't right. If it's your first time, use the link below to set a password.",
  "auth/wrong-password": "That email or password isn't right.",
  "auth/user-not-found": "That email or password isn't right.",
  "auth/user-disabled": "Your access has been switched off. Please contact your trainer.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/network-request-failed": "No internet connection. Please check and try again."
};
if (SIGNOUT) { await signOut(auth).catch(() => {}); clearCookie(); sessionStorage.removeItem("hj_tries"); history.replaceState(null, "", "/"); }
onAuthStateChanged(auth, async user => {
  if (!user) { show("signin"); return; }
  const tries = Number(sessionStorage.getItem("hj_tries") || "0");
  if (tries >= 3) {
    show("signin");
    say("We couldn't confirm your sign-in. Please sign in again.");
    await signOut(auth); clearCookie(); sessionStorage.removeItem("hj_tries");
    return;
  }
  sessionStorage.setItem("hj_tries", String(tries + 1));
  try { setCookie(await user.getIdToken(STALE || tries > 0)); location.replace(NEXT); }
  catch (e) { show("signin"); say(ERRORS[e.code] || "Something went wrong. Please try again."); }
});
$("signin").addEventListener("submit", async e => {
  e.preventDefault(); say(""); sessionStorage.removeItem("hj_tries");
  try { show("busy"); await signInWithEmailAndPassword(auth, $("email").value.trim(), $("password").value); }
  catch (err) { show("signin"); say(ERRORS[err.code] || "Something went wrong. Please try again."); }
});
$("show-reset").addEventListener("click", () => { say(""); $("reset-email").value = $("email").value; show("reset"); });
$("back").addEventListener("click", () => { say(""); show("signin"); });
$("reset").addEventListener("submit", async e => {
  e.preventDefault();
  try {
    await sendPasswordResetEmail(auth, $("reset-email").value.trim(), { url: location.origin + "/" });
  } catch (err) {
    if (err.code === "auth/too-many-requests") { say(ERRORS[err.code]); return; }
  }
  say("If that email has been invited, a link to set your password is on its way. It may take a few minutes.", true);
  show("signin");
});
</script>`
    : `<p class="msg info" role="status">Sign-in hasn't been switched on yet. Please check back soon.</p>`;

  return `<!doctype html>
<html lang="en-GB"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><meta name="theme-color" content="#2C5F2D">
<link rel="icon" type="image/svg+xml" href="${LOGO}">
<title>Sign in | Homelessness Journey</title>
<style>
:root{color-scheme:light}*{box-sizing:border-box}[hidden]{display:none!important}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#F4F6EF;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#1f2a1a;padding:20px}
.card{background:#fff;border:1px solid #dde3d2;border-top:6px solid #2C5F2D;border-radius:14px;max-width:440px;width:100%;padding:28px 28px 24px;box-shadow:0 4px 18px rgba(0,0,0,.06)}
.brand{display:flex;align-items:center;gap:10px;margin-bottom:14px}.brand img{width:38px;height:38px;border-radius:9px}
h1{font-family:Georgia,"Times New Roman",serif;font-size:24px;margin:0}
p{color:#55614c;line-height:1.5;margin:8px 0 16px}.hint{margin-top:0}.muted{color:#55614c}
label{display:block;font-weight:600;margin:12px 0 6px}
input{width:100%;padding:12px;font-size:16px;border:1px solid #c9d1bc;border-radius:9px}
input:focus,button:focus-visible{outline:3px solid #f2b705;outline-offset:1px}
button{margin-top:16px;width:100%;padding:12px;font-size:16px;font-weight:700;background:#2C5F2D;color:#fff;border:0;border-radius:9px;cursor:pointer}
button.link{background:none;color:#2C5F2D;text-decoration:underline;font-weight:600;padding:6px;margin-top:10px}
.msg{background:#fbecea;border-left:4px solid #a8473a;padding:9px 12px;border-radius:6px;color:#1f2a1a}
.msg.ok{background:#edf5e4;border-color:#4f7f39}.msg.info{background:#eef3f7;border-color:#3e5c76}
</style></head>
<body><main class="card">
<div class="brand"><img src="${LOGO}" alt=""><h1>Homelessness Journey</h1></div>
${body}
</main></body></html>`;
}

// ---------- Middleware ----------

export const config = {
  // Everything except the icons, robots.txt and the clean-up service worker
  matcher: ["/((?!favicon\\.svg|icon-192\\.png|icon-512\\.png|sw\\.js|robots\\.txt).*)"]
};

const html = (body: string, status: number, extra: Record<string, string> = {}) =>
  new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex", ...extra }
  });

/** Let the request continue to the site. */
function next(): Response {
  return new Response(null, { headers: { "x-middleware-next": "1", "x-robots-tag": "noindex" } });
}

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const firebase = parseFirebaseConfig(process.env.FIREBASE_CONFIG);
  const clear = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; Secure; SameSite=Lax`;

  if (url.pathname === SIGNOUT_PATH) {
    return html(signInPage({ next: "/", config: firebase, signout: true }), 200, { "set-cookie": clear });
  }

  const token = readCookie(request.headers.get("cookie"), TOKEN_COOKIE);
  if (firebase && token && (await verifyIdToken(token, firebase.projectId))) return next();

  const accept = request.headers.get("accept") ?? "";
  if (request.method === "GET" && accept.includes("text/html")) {
    const dest = url.pathname.startsWith("/__") ? "/" : url.pathname + url.search;
    return html(signInPage({ next: dest, config: firebase, staleToken: !!token }), 401);
  }
  return new Response("Sign-in required", { status: 401, headers: { "cache-control": "no-store" } });
}

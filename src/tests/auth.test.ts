import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import middleware, { __resetKeyCache, parseFirebaseConfig, verifyIdToken } from "../../middleware";
import { mergeProgress } from "../lib/merge";

const PROJECT = "hj-test";
const CONFIG = `const firebaseConfig = {
  apiKey: "AIzaTEST",
  authDomain: "hj-test.firebaseapp.com",
  projectId: "hj-test",
  appId: "1:123:web:abc"
};`;
const BASE = "https://example.test";

let keys: CryptoKeyPair;
const KID = "test-key";

const b64url = (b: ArrayBuffer | Uint8Array) =>
  Buffer.from(b instanceof Uint8Array ? b : new Uint8Array(b)).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function makeToken(claims: Record<string, unknown>, kid = KID) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(new TextEncoder().encode(JSON.stringify({ alg: "RS256", kid, typ: "JWT" })));
  const payload = b64url(new TextEncoder().encode(JSON.stringify({
    iss: `https://securetoken.google.com/${PROJECT}`, aud: PROJECT, sub: "user-1", email: "amina@example.com",
    iat: now - 10, exp: now + 3600, auth_time: now - 10, ...claims
  })));
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", keys.privateKey, new TextEncoder().encode(`${header}.${payload}`));
  return `${header}.${payload}.${b64url(sig)}`;
}

beforeAll(async () => {
  keys = (await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["sign", "verify"]
  )) as CryptoKeyPair;
  const jwk = await crypto.subtle.exportKey("jwk", keys.publicKey);
  vi.stubGlobal("fetch", async () =>
    new Response(JSON.stringify({ keys: [{ ...jwk, kid: KID, alg: "RS256", use: "sig" }] }), {
      headers: { "content-type": "application/json", "cache-control": "public, max-age=3600" }
    })
  );
});

afterEach(() => {
  delete process.env.FIREBASE_CONFIG;
  __resetKeyCache();
});

const page = (path: string, cookie?: string) =>
  new Request(BASE + path, { headers: { accept: "text/html", ...(cookie ? { cookie } : {}) } });

describe("Firebase config", () => {
  it("reads the snippet copied from the Firebase console", () => {
    expect(parseFirebaseConfig(CONFIG)).toEqual({ apiKey: "AIzaTEST", authDomain: "hj-test.firebaseapp.com", projectId: "hj-test", appId: "1:123:web:abc" });
  });
  it("reads JSON too, and rejects incomplete config", () => {
    expect(parseFirebaseConfig('{"apiKey":"a","authDomain":"b","projectId":"c"}')?.projectId).toBe("c");
    expect(parseFirebaseConfig('{"apiKey":"a"}')).toBeNull();
    expect(parseFirebaseConfig(undefined)).toBeNull();
  });
});

describe("ID token check", () => {
  it("accepts a genuine token", async () => {
    expect(await verifyIdToken(await makeToken({}), PROJECT)).toEqual({ uid: "user-1", email: "amina@example.com" });
  });
  it("rejects expired, wrong-project and tampered tokens", async () => {
    const now = Math.floor(Date.now() / 1000);
    expect(await verifyIdToken(await makeToken({ exp: now - 1 }), PROJECT)).toBeNull();
    expect(await verifyIdToken(await makeToken({ aud: "other" }), PROJECT)).toBeNull();
    const t = await makeToken({});
    const [h, , s] = t.split(".");
    const forged = b64url(new TextEncoder().encode(JSON.stringify({ iss: `https://securetoken.google.com/${PROJECT}`, aud: PROJECT, sub: "intruder", iat: now, exp: now + 3600 })));
    expect(await verifyIdToken(`${h}.${forged}.${s}`, PROJECT)).toBeNull();
    expect(await verifyIdToken("not-a-token", PROJECT)).toBeNull();
  });
});

describe("middleware", () => {
  it("stays locked with a 'not switched on' page if Firebase isn't configured", async () => {
    const res = await middleware(page("/journey"));
    expect(res.status).toBe(401);
    expect(await res.text()).toContain("hasn't been switched on");
  });
  it("shows the sign-in page to signed-out visitors", async () => {
    process.env.FIREBASE_CONFIG = CONFIG;
    const res = await middleware(page("/journey"));
    expect(res.status).toBe(401);
    const body = await res.text();
    expect(body).toContain("Sign in with the email address your trainer added");
    expect(body).toContain('"/journey"');
  });
  it("blocks the app's files for signed-out visitors", async () => {
    process.env.FIREBASE_CONFIG = CONFIG;
    const res = await middleware(new Request(BASE + "/assets/index.js"));
    expect(res.status).toBe(401);
  });
  it("lets signed-in trainees through", async () => {
    process.env.FIREBASE_CONFIG = CONFIG;
    const res = await middleware(page("/journey", `hj_token=${await makeToken({})}`));
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });
  it("sends people with an expired sign-in back to the sign-in page to refresh it", async () => {
    process.env.FIREBASE_CONFIG = CONFIG;
    const now = Math.floor(Date.now() / 1000);
    const res = await middleware(page("/cases", `hj_token=${await makeToken({ exp: now - 5 })}`));
    expect(res.status).toBe(401);
    expect(await res.text()).toContain("const STALE = true");
  });
  it("signs out and clears the cookie", async () => {
    process.env.FIREBASE_CONFIG = CONFIG;
    const res = await middleware(page("/__signout"));
    expect(res.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(await res.text()).toContain("const SIGNOUT = true");
  });
});

describe("progress merge", () => {
  it("keeps the best of both devices", () => {
    const merged = mergeProgress(
      { viewed: ["triage"], ticks: { triage: [0] }, quiz: { triage: { correct: 1, total: 2 } }, bestTest: 60, known: [1] },
      { viewed: ["relief", "triage"], ticks: { triage: [2], relief: [1] }, quiz: { triage: { correct: 2, total: 2 } }, bestTest: 40, letters: ["x"] }
    );
    expect(merged.viewed.sort()).toEqual(["relief", "triage"]);
    expect(merged.ticks.triage.sort()).toEqual([0, 2]);
    expect(merged.ticks.relief).toEqual([1]);
    expect(merged.quiz.triage.correct).toBe(2);
    expect(merged.bestTest).toBe(60);
    expect(merged.known).toEqual([1]);
    expect(merged.letters).toEqual(["x"]);
  });
  it("copes with nothing saved yet", () => {
    expect(mergeProgress(undefined, undefined).bestTest).toBeNull();
  });
});

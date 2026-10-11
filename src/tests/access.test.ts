import { afterEach, describe, expect, it } from "vitest";
import middleware from "../../middleware";
import { hashCode, safeNext, validCodes } from "../lib/access";

const BASE = "https://example.test";
const page = (path: string, cookie?: string) =>
  new Request(BASE + path, { headers: { accept: "text/html", ...(cookie ? { cookie } : {}) } });
const submit = (code: string, next = "/journey") =>
  new Request(BASE + "/__access", { method: "POST", body: new URLSearchParams({ code, next }) });

afterEach(() => { delete process.env.ACCESS_CODES; });

describe("access codes", () => {
  it("parses codes, ignores expired ones and normalises case", () => {
    const today = new Date("2026-10-11T12:00:00Z");
    expect(validCodes(" hj-aaaa-bbbb , HJ-CCCC-DDDD:2026-10-10, HJ-EEEE-FFFF:2027-01-01", today)).toEqual(["HJ-AAAA-BBBB", "HJ-EEEE-FFFF"]);
    expect(validCodes(undefined)).toEqual([]);
  });

  it("only redirects within the site", () => {
    expect(safeNext("/cases/dan?step=2")).toBe("/cases/dan?step=2");
    expect(safeNext("https://evil.example")).toBe("/");
    expect(safeNext("//evil.example")).toBe("/");
  });

  it("shows the sign-in page to visitors without a code", async () => {
    process.env.ACCESS_CODES = "HJ-AAAA-BBBB";
    const res = await middleware(page("/journey"));
    expect(res.status).toBe(401);
    expect(await res.text()).toContain("Access code");
  });

  it("blocks non-page files (the app's JavaScript) without a code", async () => {
    process.env.ACCESS_CODES = "HJ-AAAA-BBBB";
    const res = await middleware(new Request(BASE + "/assets/index.js"));
    expect(res.status).toBe(401);
  });

  it("stays locked if no codes have been set up", async () => {
    const res = await middleware(submit("HJ-AAAA-BBBB"));
    expect(res.status).toBe(401);
    expect(await res.text()).toContain("hasn't been switched on");
  });

  it("rejects a wrong code", async () => {
    process.env.ACCESS_CODES = "HJ-AAAA-BBBB";
    const res = await middleware(submit("HJ-WRONG-CODE"));
    expect(res.status).toBe(401);
    expect(await res.text()).toContain("valid or has expired");
  });

  it("accepts a valid code, sets a cookie and returns to the page", async () => {
    process.env.ACCESS_CODES = "HJ-AAAA-BBBB";
    const res = await middleware(submit("hj-aaaa-bbbb", "/cases/dan"));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/cases/dan");
    expect(res.headers.get("set-cookie")).toContain("hj_access=");
    expect(res.headers.get("set-cookie")).toContain("HttpOnly");
  });

  it("lets signed-in visitors through, and locks them out when their code is removed", async () => {
    process.env.ACCESS_CODES = "HJ-AAAA-BBBB,HJ-CCCC-DDDD";
    const cookie = "hj_access=" + (await hashCode("HJ-AAAA-BBBB"));
    const ok = await middleware(page("/journey", cookie));
    expect(ok.headers.get("x-middleware-next")).toBe("1");

    process.env.ACCESS_CODES = "HJ-CCCC-DDDD";
    const revoked = await middleware(page("/journey", cookie));
    expect(revoked.status).toBe(401);
  });

  it("signs out", async () => {
    const res = await middleware(page("/__signout"));
    expect(res.status).toBe(303);
    expect(res.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});

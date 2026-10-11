#!/usr/bin/env node
// Generate access codes for a cohort.
//   npm run codes -- 12                 -> 12 codes that never expire
//   npm run codes -- 12 2027-03-31      -> 12 codes that stop working after 31 March 2027
// Copy the "ACCESS_CODES" line into Vercel (Settings > Environment Variables), adding to any
// codes already there, then redeploy. Give one code to each trainee.
import { randomInt } from "node:crypto";

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no 0/O, 1/I/L to avoid mix-ups
const block = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");

const count = Number(process.argv[2] ?? 10);
const expiry = process.argv[3];
if (!Number.isInteger(count) || count < 1 || count > 500) {
  console.error("Usage: npm run codes -- <how many> [YYYY-MM-DD expiry]");
  process.exit(1);
}
if (expiry && !/^\d{4}-\d{2}-\d{2}$/.test(expiry)) {
  console.error("Expiry must look like 2027-03-31");
  process.exit(1);
}

const codes = Array.from({ length: count }, () => `HJ-${block()}-${block()}`);
console.log("Codes to hand out (one per trainee):\n");
codes.forEach((c, i) => console.log(`${String(i + 1).padStart(3)}. ${c}`));
console.log("\nValue to paste into the ACCESS_CODES environment variable:\n");
console.log(codes.map(c => (expiry ? `${c}:${expiry}` : c)).join(","));

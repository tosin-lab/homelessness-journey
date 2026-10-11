import { initializeApp } from "firebase/app";
import { getAuth, onIdTokenChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore/lite";
import { mergeProgress } from "./merge";
import { EMPTY_PROGRESS, exportState, importState, onChange, resetAll, type ProgressState } from "./store";

/**
 * Accounts and progress sync.
 * - Firebase config comes from the FIREBASE_CONFIG environment variable at build time (see vite.config.ts).
 * - The sign-in page itself is served by middleware.ts; this file keeps the sign-in cookie fresh,
 *   signs people out, and saves progress to Firestore at progress/{uid}.
 * - With no config (for example `npm run dev`), accounts are switched off and progress stays on the device.
 */

const cfg = __FIREBASE_CONFIG__;
export const accountsEnabled = !!cfg;

const app = cfg ? initializeApp(cfg) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

const TOKEN_COOKIE = "hj_token";
const OWNER_KEY = "hj-owner";

type Listener = (u: { email: string } | null) => void;
let currentUser: { email: string } | null = null;
const userListeners = new Set<Listener>();

export function onUser(cb: Listener): () => void {
  userListeners.add(cb);
  cb(currentUser);
  return () => {
    userListeners.delete(cb);
  };
}

function setCookie(token: string) {
  document.cookie = `${TOKEN_COOKIE}=${token}; Path=/; Max-Age=3600; Secure; SameSite=Lax`;
}

let stopSync: (() => void) | null = null;

async function startSync(user: User) {
  if (!db) return;
  // A different person signed in on this device: start from a clean slate
  try {
    if (localStorage.getItem(OWNER_KEY) !== user.uid) {
      resetAll();
      localStorage.setItem(OWNER_KEY, user.uid);
    }
  } catch {
    /* storage unavailable */
  }

  const ref = doc(db, "progress", user.uid);
  let remote: Partial<ProgressState> | undefined;
  try {
    remote = (await getDoc(ref)).data()?.state as Partial<ProgressState> | undefined;
  } catch {
    remote = undefined; // offline or rules not set: keep working locally
  }
  const merged = mergeProgress(remote, exportState());
  let applying = true;
  importState(merged);
  applying = false;

  let timer: ReturnType<typeof setTimeout> | undefined;
  const push = () => {
    setDoc(ref, { state: exportState(), email: user.email ?? "", updatedAt: serverTimestamp() }).catch(() => {});
  };
  push();
  const off = onChange(() => {
    if (applying) return;
    clearTimeout(timer);
    timer = setTimeout(push, 1500);
  });
  stopSync = () => {
    off();
    if (timer) {
      clearTimeout(timer);
      push();
    }
  };
}

export function initAccounts() {
  if (!auth) return;
  try {
    sessionStorage.removeItem("hj_tries");
  } catch {
    /* ignore */
  }
  onIdTokenChanged(auth, async user => {
    if (user) {
      setCookie(await user.getIdToken());
      const changed = currentUser?.email !== user.email;
      currentUser = { email: user.email ?? "" };
      if (changed) {
        userListeners.forEach(l => l(currentUser));
        stopSync?.();
        startSync(user);
      }
    } else {
      currentUser = null;
      userListeners.forEach(l => l(null));
    }
  });
  // Refresh the sign-in cookie when someone comes back to the tab
  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible" && auth.currentUser) setCookie(await auth.currentUser.getIdToken());
  });
}

export async function signOutEverywhere() {
  stopSync?.();
  if (auth) await signOut(auth).catch(() => {});
  try {
    localStorage.removeItem(OWNER_KEY);
  } catch {
    /* ignore */
  }
  importState(EMPTY_PROGRESS);
  window.location.href = "/__signout";
}

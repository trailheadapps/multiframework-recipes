/**
 * Which app the Micro-Frontend Recipes embed: the React or Angular UI bundle
 * deployed to this org (default React), or an external URL. Shared by every
 * uiEmbedding* host on the page and changed by c-guest-switcher. Deployed
 * bundles live on the org's *.my.salesforce.app domain, so the origin comes
 * from Apex.
 */
import getOrgMyDomainHostname from "@salesforce/apex/MicrofrontendOrigin.getOrgMyDomainHostname";

export const MODES = {
  react: { label: "React", bundle: "reactRecipes" },
  angular: { label: "Angular", bundle: "angularRecipes" },
  external: { label: "External URL" }
};
export const DEFAULT_MODE = "react";
export const DEFAULT_EXTERNAL_URL = "http://localhost:5173";

const STORAGE_KEY = "microfrontendRecipes.guest";

// acme.my.salesforce.com → https://acme--c.my.salesforce.app
export function toGuestOrigin(hostname) {
  const [name, ...rest] = hostname.trim().split(".");
  return `https://${name}--c.${rest.join(".").replace(/\.com$/, ".app")}`;
}

function loadSelection() {
  const fallback = { mode: DEFAULT_MODE, externalUrl: DEFAULT_EXTERNAL_URL };
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return {
      mode: MODES[saved?.mode] ? saved.mode : fallback.mode,
      externalUrl: saved?.externalUrl || fallback.externalUrl
    };
  } catch (e) {
    return fallback;
  }
}

let selection = loadSelection();
let orgOrigin; // https://<name>--c.<domain>.salesforce.app, once Apex resolves
let originError;
let originRequested = false;

const listeners = new Set(); // { route, callback, src }
const stateListeners = new Set();

function joinPath(base, route) {
  try {
    const url = new URL(base);
    if (!["http:", "https:"].includes(url.protocol)) return undefined;
    url.pathname = `${url.pathname.replace(/\/+$/, "")}/embedding/${route}`;
    return url.toString();
  } catch (e) {
    return undefined; // not a valid URL (yet)
  }
}

/** The guest base URL for the current selection, or undefined until known. */
export function getGuestBase() {
  if (selection.mode === "external") return selection.externalUrl;
  return orgOrigin
    ? `${orgOrigin}/app/c__${MODES[selection.mode].bundle}`
    : undefined;
}

/** The full iframe `src` for a recipe route, or undefined until known. */
export function buildGuestSrc(route) {
  const base = getGuestBase();
  return base ? joinPath(base, route) : undefined;
}

function requestOrigin() {
  if (originRequested) return;
  originRequested = true;
  getOrgMyDomainHostname()
    .then((hostname) => {
      orgOrigin = toGuestOrigin(hostname);
    })
    .catch((e) => {
      originError = e?.body?.message || e?.message || "Unknown error";
    })
    .then(notifyAll);
}

function updateListener(listener) {
  const next = buildGuestSrc(listener.route);
  if (next === listener.src) return;
  const hadSrc = Boolean(listener.src);
  listener.src = next;
  if (hadSrc && next) {
    // <lightning-ui-embedding> won't re-point a mounted guest: clear src for
    // one render so it unmounts, then set the new src.
    listener.callback(undefined);
    Promise.resolve().then(() => {
      if (listeners.has(listener)) listener.callback(listener.src);
    });
  } else {
    listener.callback(next);
  }
}

function notifyAll() {
  listeners.forEach(updateListener);
  const state = getGuestState();
  stateListeners.forEach((callback) => callback(state));
}

/** Current selection plus what it resolved to; used by the switcher. */
export function getGuestState() {
  return {
    ...selection,
    base: getGuestBase(),
    error: selection.mode === "external" ? undefined : originError
  };
}

/** Changes the selection. Pass `mode` and/or `externalUrl`. */
export function setGuestSelection(partial) {
  const next = { ...selection, ...partial };
  if (!MODES[next.mode]) return;
  selection = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
  } catch (e) {
    // Storage unavailable (private mode / blocked): keep it in memory only.
  }
  notifyAll();
}

/** Calls callback(src) for route now (if known) and on every change. Returns unsubscribe. */
export function subscribeGuestSrc(route, callback) {
  const listener = { route, callback, src: undefined };
  listeners.add(listener);
  requestOrigin();
  updateListener(listener);
  return () => listeners.delete(listener);
}

/** Calls `callback(state)` now and on every change. Returns unsubscribe. */
export function subscribeGuestState(callback) {
  stateListeners.add(callback);
  requestOrigin();
  callback(getGuestState());
  return () => stateListeners.delete(callback);
}

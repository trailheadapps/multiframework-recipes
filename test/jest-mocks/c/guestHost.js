// Jest stand-in for c/guestHost: a fixed, resolved guest base, plus
// __emitGuestSrc / __emitGuestState to simulate the switcher.
export const MODES = {
  react: { label: "React", bundle: "reactRecipes" },
  angular: { label: "Angular", bundle: "angularRecipes" },
  external: { label: "External URL" }
};
export const DEFAULT_MODE = "react";
export const DEFAULT_EXTERNAL_URL = "http://localhost:5173";
export const MOCK_GUEST_BASE =
  "https://example--c.scratch.my.salesforce.app/app/c__reactRecipes";

const srcCallbacks = new Map(); // route -> Set<callback>

export const subscribeGuestSrc = jest.fn((route, callback) => {
  if (!srcCallbacks.has(route)) srcCallbacks.set(route, new Set());
  srcCallbacks.get(route).add(callback);
  callback(`${MOCK_GUEST_BASE}/embedding/${route}`);
  return () => srcCallbacks.get(route).delete(callback);
});

/** Pushes `src` (or undefined) to every host subscribed to `route`. */
export function __emitGuestSrc(route, src) {
  (srcCallbacks.get(route) ?? []).forEach((callback) => callback(src));
}

let state = {
  mode: DEFAULT_MODE,
  externalUrl: DEFAULT_EXTERNAL_URL,
  base: MOCK_GUEST_BASE
};
const stateCallbacks = new Set();

export const getGuestState = jest.fn(() => state);
export const setGuestSelection = jest.fn((partial) => {
  state = { ...state, ...partial };
});
export const subscribeGuestState = jest.fn((callback) => {
  stateCallbacks.add(callback);
  callback(state);
  return () => stateCallbacks.delete(callback);
});

/** Pushes a new switcher state to subscribers. */
export function __emitGuestState(next) {
  state = { ...state, ...next };
  stateCallbacks.forEach((callback) => callback(state));
}

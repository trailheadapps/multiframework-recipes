import '@testing-library/jest-dom/vitest';
import * as matchers from 'vitest-axe/matchers';
import { expect } from 'vitest';

expect.extend(matchers);

// jsdom does not implement HTMLCanvasElement.getContext or
// window.getComputedStyle with pseudo-element selectors, both of which
// axe-core's color-contrast rule requires. Provide minimal stubs so
// axe can run without throwing in the jsdom test environment.
HTMLCanvasElement.prototype.getContext = (() => null) as any;

const _origGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = (elt: Element, pseudoElt?: string | null) => {
  if (pseudoElt) {
    // Return an empty CSSStyleDeclaration stub for pseudo-elements
    return {} as CSSStyleDeclaration;
  }
  return _origGetComputedStyle(elt);
};

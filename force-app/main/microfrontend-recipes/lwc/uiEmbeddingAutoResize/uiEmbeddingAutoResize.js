/**
 * Auto Resize — host side
 *
 * The guest's bundled `EmbeddingResizer` watches `document.body`
 * and sends resize notifications; `<lightning-ui-embedding>`
 * applies them to the iframe.
 */
import { LightningElement, api } from "lwc";
import { subscribeGuestSrc } from "c/guestHost";

export default class UiEmbeddingAutoResize extends LightningElement {
  // Unused. Kept so deploys over an org that has an older version succeed.
  @api baseUrl;

  // Set by c/guestHost; undefined while loading or remounting.
  computedSrc;
  unsubscribeGuestSrc;

  connectedCallback() {
    this.unsubscribeGuestSrc = subscribeGuestSrc("auto-resize", (src) => {
      this.computedSrc = src;
    });
  }

  disconnectedCallback() {
    this.unsubscribeGuestSrc?.();
  }
}

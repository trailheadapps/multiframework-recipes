/**
 * Auto Resize — host side
 *
 * The guest's bundled `EmbeddingResizer` watches `document.body`
 * and sends resize notifications; `<lightning-ui-embedding>`
 * applies them to the iframe.
 */
import { LightningElement, api } from "lwc";

export default class UiEmbeddingAutoResize extends LightningElement {
  @api baseUrl = "http://localhost:5173";

  get computedSrc() {
    const url = new URL(this.baseUrl);
    url.pathname = "/embedding/auto-resize";
    return url.toString();
  }
}

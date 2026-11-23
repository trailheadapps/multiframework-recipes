/**
 * Error State — host side
 *
 * A blank iframe tells the user nothing when an embed is misconfigured.
 * <lightning-ui-embedding> instead dispatches `sf-embedding.component.error` on
 * its own element when the guest can't be brought up, with a detail that
 * names the failure: { phase, code, message, retryable }. This host catches
 * that event and renders those fields, so a broken embed reports why instead
 * of sitting there empty.
 *
 * To make the failure happen on purpose, this recipe points `src` at the
 * host's own Salesforce origin instead of the external guest URL. The SDK
 * refuses to bootstrap a same-origin guest — an embedding is meant to load
 * cross-origin — and reports `code: "SAME_ORIGIN_SRC"` in the
 * `phase: "configuration"` bucket.
 *
 * The button retries with the real guest URL. `src` is session-binding: the
 * component rejects reassigning it on a live element, so the two URLs live on
 * two separate elements swapped with `lwc:if`, which remounts a fresh
 * <lightning-ui-embedding>.
 *
 * The error fires while the embedding mounts, which is before this host's
 * `renderedCallback` runs — so a `lwc:ref` listener attaches too late to
 * catch it. The event bubbles and is composed, so we instead listen on the
 * host's own shadow root in `connectedCallback` (which runs first). That one
 * listener also survives the `lwc:if` remount, since it lives on this
 * component rather than on the embedding element.
 *
 * @see uiEmbeddingReadyState — the success side of the same lifecycle
 */
import { LightningElement, api, wire } from "lwc";
import { subscribeGuestSrc } from "c/guestHost";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import NAME from "@salesforce/schema/Account.Name";
import INDUSTRY from "@salesforce/schema/Account.Industry";
import TYPE from "@salesforce/schema/Account.Type";
import WEBSITE from "@salesforce/schema/Account.Website";

const FIELDS = [NAME, INDUSTRY, TYPE, WEBSITE];

// Dispatched by <lightning-ui-embedding> when the guest can't be brought up.
// detail: { instanceId?, phase, code, message, retryable, cause? }.
const ERROR_EVENT = "sf-embedding.component.error";

export default class UiEmbeddingErrorState extends LightningElement {
  // Unused. Kept so deploys over an org that has an older version succeed.
  @api baseUrl;
  @api recordId;

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  record;

  error;
  // Start broken so the recipe shows the error on load; the button repairs it.
  forceError = true;

  handleError = (event) => {
    const { phase, code, message, retryable } = event.detail ?? {};
    this.error = { phase, code, message, retryable };
  };

  // The real cross-origin guest, from c/guestHost (undefined while loading or remounting).
  guestSrc;
  unsubscribeGuestSrc;

  connectedCallback() {
    // Listen before the embedding mounts. The event is composed, so it
    // reaches this shadow root even though it originates a level down.
    this.template.addEventListener(ERROR_EVENT, this.handleError);
    this.unsubscribeGuestSrc = subscribeGuestSrc("basic-render", (src) => {
      if (!src) this.error = undefined;
      this.guestSrc = src;
    });
  }

  disconnectedCallback() {
    this.template.removeEventListener(ERROR_EVENT, this.handleError);
    this.unsubscribeGuestSrc?.();
  }

  // The host's own origin — same-origin with the Lightning page, which the
  // SDK rejects. This is the misconfiguration the recipe demonstrates.
  get brokenSrc() {
    return window.location.origin;
  }

  // Account fields for the recovered guest, which reads them via ui-state.
  get account() {
    return {
      recordId: this.recordId,
      name: getFieldValue(this.record?.data, NAME),
      industry: getFieldValue(this.record?.data, INDUSTRY),
      type: getFieldValue(this.record?.data, TYPE),
      website: getFieldValue(this.record?.data, WEBSITE)
    };
  }

  get hasError() {
    return Boolean(this.error);
  }

  get toggleLabel() {
    return this.forceError ? "Load the real guest" : "Break it again";
  }

  handleToggle() {
    // Clear the last result and swap which embedding is mounted. The shadow
    // root listener stays put, so it catches an error from the next mount too.
    this.error = undefined;
    this.forceError = !this.forceError;
  }
}

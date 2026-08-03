/**
 * Ready State — host side
 *
 * When can the host trust that the guest is actually interactive? Not when
 * the iframe fires its native `load` event — that only means the document
 * parsed. The guest still has to boot the Platform SDK and negotiate
 * capabilities before it can receive props or events.
 *
 * <lightning-ui-embedding> signals the real milestone with a
 * `sf-embedding.component.ready` DOM event on its own element, dispatched the
 * moment the SDK handshake completes. Here the host shows a spinner over the
 * embed and clears it only when that event arrives, so the record page never
 * reveals a guest that can't yet accept data.
 *
 * The event name is dotted, so it can't be bound with LWC's declarative
 * `on<eventname>` syntax. We attach the listener imperatively in
 * `renderedCallback` and tear it down in `disconnectedCallback`.
 *
 * `renderedCallback` (rather than `connectedCallback`) is early enough here
 * because `ready` fires only after the guest's asynchronous SDK handshake —
 * well after the element renders. Contrast the Error State recipe, which must
 * listen in `connectedCallback`: its error can fire synchronously during mount,
 * before the first render, so a `renderedCallback`/`lwc:ref` listener would
 * miss it.
 */
import { LightningElement, api, wire } from "lwc";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import NAME from "@salesforce/schema/Account.Name";
import INDUSTRY from "@salesforce/schema/Account.Industry";
import TYPE from "@salesforce/schema/Account.Type";
import WEBSITE from "@salesforce/schema/Account.Website";

const FIELDS = [NAME, INDUSTRY, TYPE, WEBSITE];

// Dispatched by <lightning-ui-embedding> once the guest's SDK handshake reaches
// READY. detail: { instanceId }.
const READY_EVENT = "sf-embedding.component.ready";

export default class UiEmbeddingReadyState extends LightningElement {
  @api baseUrl = "http://localhost:5173";
  @api recordId;

  ready = false;
  instanceId;

  // Bound once so addEventListener and removeEventListener share a reference.
  handleReady = (event) => {
    this.ready = true;
    this.instanceId = event.detail?.instanceId;
  };

  hasRegistered = false;

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  record;

  renderedCallback() {
    if (this.hasRegistered) return;
    const embedding = this.refs?.embedding;
    if (!embedding) return;
    embedding.addEventListener(READY_EVENT, this.handleReady);
    this.hasRegistered = true;
  }

  disconnectedCallback() {
    this.refs?.embedding?.removeEventListener(READY_EVENT, this.handleReady);
    // Reset so renderedCallback re-attaches the listener if LWC reconnects this
    // instance; otherwise the guard above would leave the spinner stuck.
    this.hasRegistered = false;
  }

  get computedSrc() {
    const url = new URL(this.baseUrl);
    url.pathname = "/embedding/basic-render";
    return url.toString();
  }

  // Reuses the Basic Render guest — this recipe is about the host-side
  // lifecycle, not the guest, so any guest with an SDK handshake works.
  get account() {
    return {
      recordId: this.recordId,
      name: getFieldValue(this.record?.data, NAME),
      industry: getFieldValue(this.record?.data, INDUSTRY),
      type: getFieldValue(this.record?.data, TYPE),
      website: getFieldValue(this.record?.data, WEBSITE)
    };
  }
}

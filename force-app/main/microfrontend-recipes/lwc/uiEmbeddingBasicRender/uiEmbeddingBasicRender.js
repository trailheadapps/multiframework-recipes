/**
 * Basic Render — host side
 *
 * The minimum viable host. It reads Account fields with
 * `@wire(getRecord)` and passes them to `<lightning-ui-embedding>` as
 * `props`. Data flows one way from Salesforce into the guest; the
 * other recipes build on this pattern.
 */
import { LightningElement, api, wire } from "lwc";
import { subscribeGuestSrc } from "c/guestHost";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import NAME from "@salesforce/schema/Account.Name";
import INDUSTRY from "@salesforce/schema/Account.Industry";
import TYPE from "@salesforce/schema/Account.Type";
import WEBSITE from "@salesforce/schema/Account.Website";

const FIELDS = [NAME, INDUSTRY, TYPE, WEBSITE];

export default class UiEmbeddingBasicRender extends LightningElement {
  // Unused. Kept so deploys over an org that has an older version succeed.
  @api baseUrl;
  @api recordId;

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  record;

  // Set by c/guestHost; undefined while loading or remounting.
  computedSrc;
  unsubscribeGuestSrc;

  connectedCallback() {
    this.unsubscribeGuestSrc = subscribeGuestSrc("basic-render", (src) => {
      this.computedSrc = src;
    });
  }

  disconnectedCallback() {
    this.unsubscribeGuestSrc?.();
  }

  // Fresh object identity on each read so the embedding's `props` setter
  // flushes ui-state-changed when the wire returns.
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

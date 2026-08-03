/**
 * Basic Render — host side
 *
 * The minimum viable host. It reads Account fields with
 * `@wire(getRecord)` and passes them to `<lightning-embedding>` as
 * `props`. Data flows one way from Salesforce into the guest; the
 * other recipes build on this pattern.
 */
import { LightningElement, api, wire } from "lwc";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import NAME from "@salesforce/schema/Account.Name";
import INDUSTRY from "@salesforce/schema/Account.Industry";
import TYPE from "@salesforce/schema/Account.Type";
import WEBSITE from "@salesforce/schema/Account.Website";

const FIELDS = [NAME, INDUSTRY, TYPE, WEBSITE];

export default class UiEmbeddingBasicRender extends LightningElement {
  @api baseUrl = "http://localhost:5173";
  @api recordId;

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  record;

  get computedSrc() {
    const url = new URL(this.baseUrl);
    url.pathname = "/embedding/basic-render";
    return url.toString();
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

/**
 * Read Host Data — host side
 *
 * Streams live Account fields to the guest. `@wire(getRecord)` re-fires
 * on every server change, this LWC rebuilds `account` with fresh object
 * identity each time, and the guest's `viewSDK.getUiState()` subscribe
 * callback fires with the new values.
 */
import { LightningElement, api, wire } from "lwc";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import NAME from "@salesforce/schema/Account.Name";
import RATING from "@salesforce/schema/Account.Rating";
import TYPE from "@salesforce/schema/Account.Type";
import INDUSTRY from "@salesforce/schema/Account.Industry";
import WEBSITE from "@salesforce/schema/Account.Website";
import PHONE from "@salesforce/schema/Account.Phone";

const FIELDS = [NAME, RATING, TYPE, INDUSTRY, WEBSITE, PHONE];

export default class UiEmbeddingReadHostData extends LightningElement {
  @api baseUrl = "http://localhost:5173";
  @api recordId;

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  record;

  get computedSrc() {
    const url = new URL(this.baseUrl);
    url.pathname = "/embedding/read-host-data";
    return url.toString();
  }

  get account() {
    return {
      recordId: this.recordId,
      name: getFieldValue(this.record?.data, NAME),
      rating: getFieldValue(this.record?.data, RATING),
      type: getFieldValue(this.record?.data, TYPE),
      industry: getFieldValue(this.record?.data, INDUSTRY),
      website: getFieldValue(this.record?.data, WEBSITE),
      phone: getFieldValue(this.record?.data, PHONE)
    };
  }
}

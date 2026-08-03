/**
 * Unsaved Changes — host side
 *
 * The guest calls `viewSDK.markDirtyState()` / `clearDirtyState()`;
 * `<lightning-embedding>` re-emits those as `trackdirtystate` events,
 * and Salesforce warns the user before navigating away while dirty.
 *
 * On Save, the guest fires `unsaved-changes-save`; this LWC writes
 * with `updateRecord` and lets the wire re-emit clean values back.
 */
import { LightningElement, api, wire } from "lwc";
import { getRecord, getFieldValue, updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import NAME from "@salesforce/schema/Account.Name";
import RATING from "@salesforce/schema/Account.Rating";
import TYPE from "@salesforce/schema/Account.Type";

const FIELDS = [NAME, RATING, TYPE];

export default class UiEmbeddingUnsavedChanges extends LightningElement {
  @api baseUrl = "http://localhost:5173";
  @api recordId;

  isDirty = false;

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  record;

  get computedSrc() {
    const url = new URL(this.baseUrl);
    url.pathname = "/embedding/unsaved-changes";
    return url.toString();
  }

  get account() {
    return {
      recordId: this.recordId,
      name: getFieldValue(this.record?.data, NAME),
      rating: getFieldValue(this.record?.data, RATING),
      type: getFieldValue(this.record?.data, TYPE)
    };
  }

  handleTrackDirtyState(evt) {
    this.isDirty = Boolean(evt.detail?.isDirty);
  }

  async handleSave(evt) {
    const { name, rating, type } = evt.detail ?? {};
    if (!this.recordId) return;
    try {
      await updateRecord({
        fields: { Id: this.recordId, Name: name, Rating: rating, Type: type }
      });
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Saved",
          message: "Account updated.",
          variant: "success"
        })
      );
    } catch (err) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Save failed",
          message: err?.body?.message ?? err?.message ?? "Unknown error",
          variant: "error"
        })
      );
    }
  }
}

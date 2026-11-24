/**
 * Send To Host — host side
 *
 * Listens for the guest's `score` event and writes `Rating` and `Type`
 * via `updateRecord`.
 */
import { LightningElement, api, wire } from "lwc";
import { subscribeGuestSrc } from "c/guestHost";
import { getRecord, getFieldValue, updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import RATING from "@salesforce/schema/Account.Rating";
import TYPE from "@salesforce/schema/Account.Type";

const FIELDS = [RATING, TYPE];

export default class UiEmbeddingSendToHost extends LightningElement {
  // Unused. Kept so deploys over an org that has an older version succeed.
  @api baseUrl;
  @api recordId;

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  record;

  // Set by c/guestHost; undefined while loading or remounting.
  computedSrc;
  unsubscribeGuestSrc;

  connectedCallback() {
    this.unsubscribeGuestSrc = subscribeGuestSrc("send-to-host", (src) => {
      this.computedSrc = src;
    });
  }

  disconnectedCallback() {
    this.unsubscribeGuestSrc?.();
  }

  get account() {
    return {
      recordId: this.recordId,
      rating: getFieldValue(this.record?.data, RATING),
      type: getFieldValue(this.record?.data, TYPE)
    };
  }

  async handleScore(evt) {
    const { rating, type } = evt.detail ?? {};
    if (!this.recordId) return;

    try {
      await updateRecord({
        fields: { Id: this.recordId, Rating: rating, Type: type }
      });
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Account scored",
          message: `Rating set to ${rating}.`,
          variant: "success"
        })
      );
    } catch (err) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Scoring failed",
          message: err?.body?.message ?? err?.message ?? "Unknown error",
          variant: "error"
        })
      );
    }
  }
}

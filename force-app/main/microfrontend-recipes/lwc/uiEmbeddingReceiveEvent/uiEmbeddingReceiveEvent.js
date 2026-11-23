/**
 * Receive Event — host side
 *
 * The mirror of Send To Host: the host pushes an event *down* to the
 * guest. Clicking "Refresh quote" dispatches a `refreshticker` event on
 * the <lightning-ui-embedding> element; the bridge forwards it and the guest
 * hears it via viewSDK.addEventListener().
 *
 * ui-state carries the Account's `tickerSymbol` (a Salesforce field the
 * host owns); the event tells the guest when to re-pull the share price
 * (data only the guest can fetch).
 */
import { LightningElement, api, wire } from "lwc";
import { subscribeGuestSrc } from "c/guestHost";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import NAME from "@salesforce/schema/Account.Name";
import TICKER from "@salesforce/schema/Account.TickerSymbol";

const FIELDS = [NAME, TICKER];

export default class UiEmbeddingReceiveEvent extends LightningElement {
  // Unused. Kept so deploys over an org that has an older version succeed.
  @api baseUrl;
  @api recordId;

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  record;

  // Set by c/guestHost; undefined while loading or remounting.
  computedSrc;
  unsubscribeGuestSrc;

  connectedCallback() {
    this.unsubscribeGuestSrc = subscribeGuestSrc("receive-event", (src) => {
      this.computedSrc = src;
    });
  }

  disconnectedCallback() {
    this.unsubscribeGuestSrc?.();
  }

  get account() {
    return {
      recordId: this.recordId,
      name: getFieldValue(this.record?.data, NAME),
      tickerSymbol: getFieldValue(this.record?.data, TICKER)
    };
  }

  // No ticker, nothing for the guest to re-pull — keep the button disabled.
  get disabled() {
    return !getFieldValue(this.record?.data, TICKER);
  }

  handleRefresh() {
    // Host → guest: dispatch on the embedding element. The bridge forwards
    // it and the guest's viewSDK.addEventListener('refreshticker', ...) fires.
    this.refs?.embedding?.dispatchEvent(new CustomEvent("refreshticker"));
  }
}

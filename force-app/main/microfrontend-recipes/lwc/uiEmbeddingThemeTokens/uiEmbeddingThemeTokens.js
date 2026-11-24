/**
 * Theme Tokens — host side
 *
 * Sends a theme name to the guest, which maps that name to its own
 * palette. This works well for guests that already have their own
 * design system. If the guest instead needs to match host chrome
 * exactly (for example, an SLDS-native widget), forward the actual
 * token values (like `--brand-primary: #0176d3`).
 */
import { LightningElement, api, wire } from "lwc";
import { subscribeGuestSrc } from "c/guestHost";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import NAME from "@salesforce/schema/Account.Name";
import INDUSTRY from "@salesforce/schema/Account.Industry";
import TYPE from "@salesforce/schema/Account.Type";
import WEBSITE from "@salesforce/schema/Account.Website";

const FIELDS = [NAME, INDUSTRY, TYPE, WEBSITE];

export default class UiEmbeddingThemeTokens extends LightningElement {
  // Unused. Kept so deploys over an org that has an older version succeed.
  @api baseUrl;
  @api recordId;

  theme = "light";

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  record;

  // Set by c/guestHost; undefined while loading or remounting.
  computedSrc;
  unsubscribeGuestSrc;

  connectedCallback() {
    this.unsubscribeGuestSrc = subscribeGuestSrc("theme-tokens", (src) => {
      this.computedSrc = src;
    });
  }

  disconnectedCallback() {
    this.unsubscribeGuestSrc?.();
  }

  // The theme string is the only payload the guest needs to switch its
  // look; the Account fields ride along so the demo has real data.
  get payload() {
    return {
      theme: this.theme,
      recordId: this.recordId,
      name: getFieldValue(this.record?.data, NAME),
      industry: getFieldValue(this.record?.data, INDUSTRY),
      type: getFieldValue(this.record?.data, TYPE),
      website: getFieldValue(this.record?.data, WEBSITE)
    };
  }

  get lightVariant() {
    return this.theme === "light" ? "brand" : "neutral";
  }

  get darkVariant() {
    return this.theme === "dark" ? "brand" : "neutral";
  }

  get salesforceVariant() {
    return this.theme === "salesforce" ? "brand" : "neutral";
  }

  setLight() {
    this.theme = "light";
  }

  setDark() {
    this.theme = "dark";
  }

  setSalesforce() {
    this.theme = "salesforce";
  }
}

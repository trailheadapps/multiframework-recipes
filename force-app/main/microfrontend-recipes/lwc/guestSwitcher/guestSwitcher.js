/** Picks which guest app every Micro-Frontend recipe on the page embeds. */
import { LightningElement } from "lwc";
import {
  MODES,
  DEFAULT_EXTERNAL_URL,
  getGuestState,
  setGuestSelection,
  subscribeGuestState
} from "c/guestHost";

const OPTIONS = Object.entries(MODES).map(([value, { label }]) => ({
  label: value === "external" ? "External URL" : label,
  value
}));

export default class GuestSwitcher extends LightningElement {
  options = OPTIONS;
  state = getGuestState();
  unsubscribe;

  connectedCallback() {
    this.unsubscribe = subscribeGuestState((state) => {
      this.state = state;
    });
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  get isExternal() {
    return this.state.mode === "external";
  }

  get status() {
    if (this.state.error)
      return `Couldn't resolve this org's domain: ${this.state.error}`;
    return this.state.base
      ? `Embedding guests from ${this.state.base}`
      : "Resolving this org's domain…";
  }

  get statusClass() {
    return this.state.error
      ? "slds-text-body_small slds-m-top_x-small slds-text-color_error"
      : "slds-text-body_small slds-m-top_x-small";
  }

  get externalPlaceholder() {
    return DEFAULT_EXTERNAL_URL;
  }

  handleModeChange(event) {
    setGuestSelection({ mode: event.detail.value });
  }

  // change fires on blur/Enter, so guests remount once per edit.
  handleUrlChange(event) {
    const input = event.target;
    if (!input.checkValidity()) {
      input.reportValidity();
      return;
    }
    if (!input.value) input.value = DEFAULT_EXTERNAL_URL;
    setGuestSelection({ externalUrl: input.value });
  }
}

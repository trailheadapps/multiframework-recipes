import { createElement } from "lwc";
import GuestSwitcher from "c/guestSwitcher";
import {
  setGuestSelection,
  __emitGuestState,
  MOCK_GUEST_BASE
} from "c/guestHost";

function mount() {
  const el = createElement("c-guest-switcher", { is: GuestSwitcher });
  document.body.appendChild(el);
  return el;
}

describe("c-guest-switcher", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
    __emitGuestState({ mode: "react", error: undefined });
  });

  it("offers React, Angular and External, with React selected by default", () => {
    const group = mount().shadowRoot.querySelector("lightning-radio-group");
    expect(group.options.map((o) => o.value)).toEqual([
      "react",
      "angular",
      "external"
    ]);
    expect(group.value).toBe("react");
  });

  it("shows which base URL the guests are embedded from", () => {
    const el = mount();
    expect(el.shadowRoot.querySelector("p").textContent).toContain(
      MOCK_GUEST_BASE
    );
  });

  it("updates the shared selection when a mode is picked", () => {
    const group = mount().shadowRoot.querySelector("lightning-radio-group");
    group.dispatchEvent(
      new CustomEvent("change", { detail: { value: "angular" } })
    );
    expect(setGuestSelection).toHaveBeenCalledWith({ mode: "angular" });
  });

  it("shows the URL input only for External", async () => {
    const el = mount();
    expect(el.shadowRoot.querySelector("lightning-input")).toBeNull();

    __emitGuestState({ mode: "external" });
    await Promise.resolve();
    expect(el.shadowRoot.querySelector("lightning-input")).not.toBeNull();
  });

  it("reports an error resolving the org's domain", async () => {
    const el = mount();
    __emitGuestState({ error: "no access" });
    await Promise.resolve();
    expect(el.shadowRoot.querySelector("p").textContent).toContain("no access");
  });

  describe("external URL input", () => {
    async function mountExternal() {
      const el = mount();
      __emitGuestState({ mode: "external" });
      await Promise.resolve();
      return el.shadowRoot.querySelector("lightning-input");
    }

    it("saves a valid URL", async () => {
      const input = await mountExternal();
      input.value = "https://guests.example";
      input.checkValidity = jest.fn(() => true);
      input.dispatchEvent(new CustomEvent("change"));
      expect(setGuestSelection).toHaveBeenCalledWith({
        externalUrl: "https://guests.example"
      });
    });

    it("reports invalid input instead of saving it", async () => {
      const input = await mountExternal();
      input.checkValidity = jest.fn(() => false);
      input.reportValidity = jest.fn();
      input.dispatchEvent(new CustomEvent("change"));
      expect(input.reportValidity).toHaveBeenCalled();
      expect(setGuestSelection).not.toHaveBeenCalled();
    });

    it("falls back to the default URL when cleared", async () => {
      const input = await mountExternal();
      input.value = "";
      input.checkValidity = jest.fn(() => true);
      input.dispatchEvent(new CustomEvent("change"));
      expect(setGuestSelection).toHaveBeenCalledWith({
        externalUrl: "http://localhost:5173"
      });
    });
  });
});

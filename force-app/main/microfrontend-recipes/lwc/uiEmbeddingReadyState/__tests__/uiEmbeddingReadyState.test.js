import { createElement } from "lwc";
import UiEmbeddingReadyState from "c/uiEmbeddingReadyState";

describe("c-ui-embedding-ready-state", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("shows a spinner until the embedding fires the ready event", async () => {
    const el = createElement("c-ui-embedding-ready-state", {
      is: UiEmbeddingReadyState
    });
    el.recordId = "001";
    document.body.appendChild(el);

    // Before ready: spinner shown, no badge.
    expect(el.shadowRoot.querySelector("lightning-spinner")).not.toBeNull();
    expect(el.shadowRoot.querySelector("lightning-badge")).toBeNull();

    // The host listens for the SDK handshake event on the embedding element.
    const embed = el.shadowRoot.querySelector("lightning-ui-embedding");
    embed.dispatchEvent(
      new CustomEvent("sf-embedding.component.ready", {
        detail: { instanceId: "abc" }
      })
    );
    await Promise.resolve();

    // After ready: spinner gone, "Guest ready" badge shown.
    expect(el.shadowRoot.querySelector("lightning-spinner")).toBeNull();
    expect(el.shadowRoot.querySelector("lightning-badge")).not.toBeNull();
  });

  it("removes the ready listener from the embedding on disconnect", () => {
    const el = createElement("c-ui-embedding-ready-state", {
      is: UiEmbeddingReadyState
    });
    el.recordId = "001";
    document.body.appendChild(el);

    // The listener is attached imperatively in renderedCallback; disconnecting
    // must tear it down so a late event can't flip a torn-down component.
    const embed = el.shadowRoot.querySelector("lightning-ui-embedding");
    const remove = jest.spyOn(embed, "removeEventListener");

    document.body.removeChild(el);

    expect(remove).toHaveBeenCalledWith(
      "sf-embedding.component.ready",
      expect.any(Function)
    );
  });

  it("re-attaches the listener when the instance is reconnected", async () => {
    const el = createElement("c-ui-embedding-ready-state", {
      is: UiEmbeddingReadyState
    });
    el.recordId = "001";
    document.body.appendChild(el);

    // Disconnect then reconnect the same instance; disconnectedCallback must
    // reset the registration guard so renderedCallback re-attaches the listener.
    document.body.removeChild(el);
    document.body.appendChild(el);

    const embed = el.shadowRoot.querySelector("lightning-ui-embedding");
    embed.dispatchEvent(
      new CustomEvent("sf-embedding.component.ready", {
        detail: { instanceId: "abc" }
      })
    );
    await Promise.resolve();

    // Ready still flips after reconnect — spinner clears, badge shows.
    expect(el.shadowRoot.querySelector("lightning-spinner")).toBeNull();
    expect(el.shadowRoot.querySelector("lightning-badge")).not.toBeNull();
  });
});

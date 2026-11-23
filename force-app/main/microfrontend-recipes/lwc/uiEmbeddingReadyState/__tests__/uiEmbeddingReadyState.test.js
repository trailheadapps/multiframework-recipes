import { createElement } from "lwc";
import { __emitGuestSrc, MOCK_GUEST_BASE } from "c/guestHost";
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

  it("embeds the guest route from c/guestHost", async () => {
    const el = createElement("c-ui-embedding-ready-state", {
      is: UiEmbeddingReadyState
    });
    el.recordId = "001";
    document.body.appendChild(el);
    await Promise.resolve();

    expect(el.shadowRoot.querySelector("lightning-ui-embedding").src).toBe(
      `${MOCK_GUEST_BASE}/embedding/basic-render`
    );
  });

  it("remounts the embedding when the guest src changes", async () => {
    const el = createElement("c-ui-embedding-ready-state", {
      is: UiEmbeddingReadyState
    });
    el.recordId = "001";
    document.body.appendChild(el);
    await Promise.resolve();
    const before = el.shadowRoot.querySelector("lightning-ui-embedding");

    __emitGuestSrc("basic-render", undefined);
    await Promise.resolve();
    expect(el.shadowRoot.querySelector("lightning-ui-embedding")).toBeNull();

    __emitGuestSrc(
      "basic-render",
      "https://other.example/embedding/basic-render"
    );
    await Promise.resolve();
    const after = el.shadowRoot.querySelector("lightning-ui-embedding");
    expect(after.src).toBe("https://other.example/embedding/basic-render");
    expect(after).not.toBe(before);
  });

  it("shows the spinner again and listens on the new embedding after a remount", async () => {
    const el = createElement("c-ui-embedding-ready-state", {
      is: UiEmbeddingReadyState
    });
    el.recordId = "001";
    document.body.appendChild(el);
    el.shadowRoot
      .querySelector("lightning-ui-embedding")
      .dispatchEvent(new CustomEvent("sf-embedding.component.ready"));
    await Promise.resolve();
    expect(el.shadowRoot.querySelector("lightning-badge")).not.toBeNull();

    __emitGuestSrc("basic-render", undefined);
    await Promise.resolve();
    __emitGuestSrc(
      "basic-render",
      "https://other.example/embedding/basic-render"
    );
    await Promise.resolve();

    expect(el.shadowRoot.querySelector("lightning-spinner")).not.toBeNull();
    el.shadowRoot
      .querySelector("lightning-ui-embedding")
      .dispatchEvent(new CustomEvent("sf-embedding.component.ready"));
    await Promise.resolve();
    expect(el.shadowRoot.querySelector("lightning-badge")).not.toBeNull();
  });

  it("shows no spinner while there is no guest src to load", async () => {
    const el = createElement("c-ui-embedding-ready-state", {
      is: UiEmbeddingReadyState
    });
    document.body.appendChild(el);
    __emitGuestSrc("basic-render", undefined);
    await Promise.resolve();
    expect(el.shadowRoot.querySelector("lightning-spinner")).toBeNull();
  });
});

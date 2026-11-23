import { createElement } from "lwc";
import { __emitGuestSrc, MOCK_GUEST_BASE } from "c/guestHost";
import UiEmbeddingAutoResize from "c/uiEmbeddingAutoResize";

describe("c-ui-embedding-auto-resize", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("embeds the guest route from c/guestHost", async () => {
    const el = createElement("c-ui-embedding-auto-resize", {
      is: UiEmbeddingAutoResize
    });
    el.recordId = "001";
    document.body.appendChild(el);
    await Promise.resolve();

    expect(el.shadowRoot.querySelector("lightning-ui-embedding").src).toBe(
      `${MOCK_GUEST_BASE}/embedding/auto-resize`
    );
  });

  it("remounts the embedding when the guest src changes", async () => {
    const el = createElement("c-ui-embedding-auto-resize", {
      is: UiEmbeddingAutoResize
    });
    el.recordId = "001";
    document.body.appendChild(el);
    await Promise.resolve();
    const before = el.shadowRoot.querySelector("lightning-ui-embedding");

    __emitGuestSrc("auto-resize", undefined);
    await Promise.resolve();
    expect(el.shadowRoot.querySelector("lightning-ui-embedding")).toBeNull();

    __emitGuestSrc(
      "auto-resize",
      "https://other.example/embedding/auto-resize"
    );
    await Promise.resolve();
    const after = el.shadowRoot.querySelector("lightning-ui-embedding");
    expect(after.src).toBe("https://other.example/embedding/auto-resize");
    expect(after).not.toBe(before);
  });
});

import { createElement } from "lwc";
import UiEmbeddingErrorState from "c/uiEmbeddingErrorState";

describe("c-ui-embedding-error-state", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders the failure detail when the embedding fires an error event", async () => {
    const el = createElement("c-ui-embedding-error-state", {
      is: UiEmbeddingErrorState
    });
    el.recordId = "001";
    document.body.appendChild(el);

    // No error yet.
    expect(el.shadowRoot.querySelector(".error-panel")).toBeNull();

    // The host listens on its shadow root; the composed event bubbles up from
    // the embedding element.
    const embed = el.shadowRoot.querySelector("lightning-ui-embedding");
    embed.dispatchEvent(
      new CustomEvent("sf-embedding.component.error", {
        bubbles: true,
        composed: true,
        detail: {
          phase: "configuration",
          code: "SAME_ORIGIN_SRC",
          message:
            "iframe src origin MUST differ from the host document origin.",
          retryable: false
        }
      })
    );
    await Promise.resolve();

    const panel = el.shadowRoot.querySelector(".error-panel");
    expect(panel).not.toBeNull();
    expect(panel.textContent).toContain("SAME_ORIGIN_SRC");
    expect(panel.textContent).toContain("configuration");
  });

  it("recovers to the real guest when toggled: clears the error and remounts with the guest URL + props", async () => {
    const el = createElement("c-ui-embedding-error-state", {
      is: UiEmbeddingErrorState
    });
    el.recordId = "001";
    document.body.appendChild(el);

    // Put it in the error state first, as on load.
    el.shadowRoot.querySelector("lightning-ui-embedding").dispatchEvent(
      new CustomEvent("sf-embedding.component.error", {
        bubbles: true,
        composed: true,
        detail: {
          phase: "configuration",
          code: "SAME_ORIGIN_SRC",
          message: "same-origin src",
          retryable: false
        }
      })
    );
    await Promise.resolve();
    expect(el.shadowRoot.querySelector(".error-panel")).not.toBeNull();

    // Click "Load the real guest" — remounts the embedding cross-origin.
    el.shadowRoot
      .querySelector("lightning-button")
      .dispatchEvent(new CustomEvent("click"));
    await Promise.resolve();

    // Error cleared, and the freshly-mounted embedding points at the real guest
    // and receives the Account props.
    expect(el.shadowRoot.querySelector(".error-panel")).toBeNull();
    const embed = el.shadowRoot.querySelector("lightning-ui-embedding");
    expect(embed.src).toContain("/embedding/basic-render");
    expect(embed.props).toEqual(
      expect.objectContaining({ recordId: "001" })
    );
  });
});

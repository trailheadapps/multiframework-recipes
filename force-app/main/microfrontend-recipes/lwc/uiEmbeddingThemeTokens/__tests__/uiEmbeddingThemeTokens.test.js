import { createElement } from "lwc";
import { __emitGuestSrc, MOCK_GUEST_BASE } from "c/guestHost";
import UiEmbeddingThemeTokens from "c/uiEmbeddingThemeTokens";

describe("c-ui-embedding-theme-tokens", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("sends the selected theme name to the guest via props", async () => {
    const el = createElement("c-ui-embedding-theme-tokens", {
      is: UiEmbeddingThemeTokens
    });
    document.body.appendChild(el);

    const embed = el.shadowRoot.querySelector("lightning-ui-embedding");
    expect(embed.props.theme).toBe("light");

    // Click the "Dark" button — select by label so a template reorder can't
    // silently pass this test.
    const buttons = [...el.shadowRoot.querySelectorAll("lightning-button")];
    const darkButton = buttons.find((b) => b.label === "Dark");
    darkButton.dispatchEvent(new CustomEvent("click"));
    await Promise.resolve();

    expect(embed.props.theme).toBe("dark");
  });

  it("embeds the guest route from c/guestHost", async () => {
    const el = createElement("c-ui-embedding-theme-tokens", {
      is: UiEmbeddingThemeTokens
    });
    el.recordId = "001";
    document.body.appendChild(el);
    await Promise.resolve();

    expect(el.shadowRoot.querySelector("lightning-ui-embedding").src).toBe(
      `${MOCK_GUEST_BASE}/embedding/theme-tokens`
    );
  });

  it("remounts the embedding when the guest src changes", async () => {
    const el = createElement("c-ui-embedding-theme-tokens", {
      is: UiEmbeddingThemeTokens
    });
    el.recordId = "001";
    document.body.appendChild(el);
    await Promise.resolve();
    const before = el.shadowRoot.querySelector("lightning-ui-embedding");

    __emitGuestSrc("theme-tokens", undefined);
    await Promise.resolve();
    expect(el.shadowRoot.querySelector("lightning-ui-embedding")).toBeNull();

    __emitGuestSrc(
      "theme-tokens",
      "https://other.example/embedding/theme-tokens"
    );
    await Promise.resolve();
    const after = el.shadowRoot.querySelector("lightning-ui-embedding");
    expect(after.src).toBe("https://other.example/embedding/theme-tokens");
    expect(after).not.toBe(before);
  });
});

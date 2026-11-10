import { createElement } from "lwc";
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

  it.each([
    ["http://localhost:5173", "http://localhost:5173/embedding/theme-tokens"],
    [
      "https://example.my.salesforce.app/app/c__reactRecipes",
      "https://example.my.salesforce.app/app/c__reactRecipes/embedding/theme-tokens"
    ],
    [
      "https://example.my.salesforce.app/app/c__reactRecipes/",
      "https://example.my.salesforce.app/app/c__reactRecipes/embedding/theme-tokens"
    ]
  ])(
    "appends the guest route to the base URL path (%s)",
    async (baseUrl, expected) => {
      const el = createElement("c-ui-embedding-theme-tokens", {
        is: UiEmbeddingThemeTokens
      });
      el.baseUrl = baseUrl;
      el.recordId = "001";
      document.body.appendChild(el);
      await Promise.resolve();

      expect(el.shadowRoot.querySelector("lightning-ui-embedding").src).toBe(
        expected
      );
    }
  );
});

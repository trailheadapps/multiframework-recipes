import { createElement } from "lwc";
import UiEmbeddingAutoResize from "c/uiEmbeddingAutoResize";

describe("c-ui-embedding-auto-resize", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("mounts the embedding at the auto-resize route", () => {
    const el = createElement("c-ui-embedding-auto-resize", {
      is: UiEmbeddingAutoResize
    });
    el.baseUrl = "http://localhost:5173";
    document.body.appendChild(el);

    const embed = el.shadowRoot.querySelector("lightning-ui-embedding");
    expect(embed).not.toBeNull();
    expect(embed.src).toBe("http://localhost:5173/embedding/auto-resize");
  });

  it.each([
    ["http://localhost:5173", "http://localhost:5173/embedding/auto-resize"],
    [
      "https://example.my.salesforce.app/app/c__reactRecipes",
      "https://example.my.salesforce.app/app/c__reactRecipes/embedding/auto-resize"
    ],
    [
      "https://example.my.salesforce.app/app/c__reactRecipes/",
      "https://example.my.salesforce.app/app/c__reactRecipes/embedding/auto-resize"
    ]
  ])(
    "appends the guest route to the base URL path (%s)",
    async (baseUrl, expected) => {
      const el = createElement("c-ui-embedding-auto-resize", {
        is: UiEmbeddingAutoResize
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

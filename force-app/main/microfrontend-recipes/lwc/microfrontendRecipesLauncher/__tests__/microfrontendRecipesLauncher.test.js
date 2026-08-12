import { createElement } from "lwc";
import MicrofrontendRecipesLauncher from "c/microfrontendRecipesLauncher";
import { graphql } from "lightning/uiGraphQLApi";

// Capture NavigationMixin.Navigate calls with a jest.fn-backed mixin so the
// symbol-keyed method is spy-able (the base stub's Navigate is a bare no-op).
// Named `mock*` so jest allows referencing it inside the hoisted mock factory.
const mockNavigate = jest.fn();
jest.mock(
  "lightning/navigation",
  () => {
    const Navigate = Symbol("Navigate");
    const NavigationMixin = (Base) =>
      class extends Base {
        [Navigate](...args) {
          return mockNavigate(...args);
        }
      };
    NavigationMixin.Navigate = Navigate;
    return { NavigationMixin };
  },
  { virtual: true }
);

describe("c-microfrontend-recipes-launcher", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("enables the button and navigates to the first Account", async () => {
    const el = createElement("c-microfrontend-recipes-launcher", {
      is: MicrofrontendRecipesLauncher
    });
    document.body.appendChild(el);

    const button = el.shadowRoot.querySelector("lightning-button");
    expect(button.disabled).toBe(true);

    // The graphql stub wraps the emitted value as { data, errors }, so emit the
    // raw data payload here.
    graphql.emit({
      uiapi: { query: { Account: { edges: [{ node: { Id: "001" } }] } } }
    });
    await Promise.resolve();

    expect(button.disabled).toBe(false);

    button.dispatchEvent(new CustomEvent("click"));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    const pageReference = mockNavigate.mock.calls[0][0];
    expect(pageReference.type).toBe("standard__recordPage");
    expect(pageReference.attributes.recordId).toBe("001");
  });
});

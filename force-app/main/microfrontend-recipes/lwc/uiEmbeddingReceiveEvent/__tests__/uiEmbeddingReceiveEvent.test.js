import { createElement } from "lwc";
import UiEmbeddingReceiveEvent from "c/uiEmbeddingReceiveEvent";
import { getRecord } from "lightning/uiRecordApi";

const RECORD = {
  fields: { Name: { value: "Acme Corp" }, TickerSymbol: { value: "CRM" } }
};

describe("c-ui-embedding-receive-event", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("dispatches refreshticker on the embedding when Refresh quote is clicked", async () => {
    const el = createElement("c-ui-embedding-receive-event", {
      is: UiEmbeddingReceiveEvent
    });
    el.recordId = "001";
    document.body.appendChild(el);

    getRecord.emit(RECORD);
    await Promise.resolve();

    const embed = el.shadowRoot.querySelector("lightning-ui-embedding");
    const handler = jest.fn();
    embed.addEventListener("refreshticker", handler);

    const button = el.shadowRoot.querySelector("lightning-button");
    expect(button.disabled).toBe(false);
    button.dispatchEvent(new CustomEvent("click"));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("disables the button when the Account has no ticker", async () => {
    const el = createElement("c-ui-embedding-receive-event", {
      is: UiEmbeddingReceiveEvent
    });
    el.recordId = "001";
    document.body.appendChild(el);

    getRecord.emit({
      fields: { Name: { value: "Acme" }, TickerSymbol: { value: null } }
    });
    await Promise.resolve();

    expect(el.shadowRoot.querySelector("lightning-button").disabled).toBe(true);
  });
});

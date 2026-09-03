import { createElement } from "lwc";
import UiEmbeddingSendToHost from "c/uiEmbeddingSendToHost";
import { updateRecord } from "lightning/uiRecordApi";

jest.mock(
  "lightning/uiRecordApi",
  () => ({
    getRecord: jest.requireActual("lightning/uiRecordApi").getRecord,
    getFieldValue: jest.requireActual("lightning/uiRecordApi").getFieldValue,
    updateRecord: jest.fn()
  }),
  { virtual: true }
);

describe("c-ui-embedding-send-to-host", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("writes the guest's score to the record via updateRecord", async () => {
    updateRecord.mockResolvedValue({});
    const el = createElement("c-ui-embedding-send-to-host", {
      is: UiEmbeddingSendToHost
    });
    el.recordId = "001";
    document.body.appendChild(el);

    const toast = jest.fn();
    el.addEventListener("lightning__showtoast", toast);

    const embed = el.shadowRoot.querySelector("lightning-ui-embedding");
    embed.dispatchEvent(
      new CustomEvent("score", {
        detail: { rating: "Hot", type: "Customer - Direct" },
        bubbles: true
      })
    );
    await Promise.resolve();

    expect(updateRecord).toHaveBeenCalledWith({
      fields: { Id: "001", Rating: "Hot", Type: "Customer - Direct" }
    });
    expect(toast).toHaveBeenCalledTimes(1);
    expect(toast.mock.calls[0][0].detail.variant).toBe("success");
  });

  it("toasts an error when updateRecord rejects", async () => {
    updateRecord.mockRejectedValue({ body: { message: "Insufficient access." } });
    const el = createElement("c-ui-embedding-send-to-host", {
      is: UiEmbeddingSendToHost
    });
    el.recordId = "001";
    document.body.appendChild(el);

    const toast = jest.fn();
    el.addEventListener("lightning__showtoast", toast);

    const embed = el.shadowRoot.querySelector("lightning-ui-embedding");
    embed.dispatchEvent(
      new CustomEvent("score", {
        detail: { rating: "Hot", type: "Customer - Direct" },
        bubbles: true
      })
    );
    // Two microtasks: the awaited updateRecord rejection, then the toast.
    await Promise.resolve();
    await Promise.resolve();

    expect(toast).toHaveBeenCalledTimes(1);
    const { title, message, variant } = toast.mock.calls[0][0].detail;
    expect(variant).toBe("error");
    expect(title).toBe("Scoring failed");
    expect(message).toBe("Insufficient access.");
  });
});

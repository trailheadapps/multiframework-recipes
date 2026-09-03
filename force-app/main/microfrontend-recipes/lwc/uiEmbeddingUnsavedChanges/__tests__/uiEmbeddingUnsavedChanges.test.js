import { createElement } from "lwc";
import UiEmbeddingUnsavedChanges from "c/uiEmbeddingUnsavedChanges";
import { getRecord, updateRecord } from "lightning/uiRecordApi";

jest.mock(
  "lightning/uiRecordApi",
  () => ({
    getRecord: jest.requireActual("lightning/uiRecordApi").getRecord,
    getFieldValue: jest.requireActual("lightning/uiRecordApi").getFieldValue,
    updateRecord: jest.fn()
  }),
  { virtual: true }
);

const RECORD = {
  fields: {
    Name: { value: "Acme Corp" },
    Rating: { value: "Warm" },
    Type: { value: "Prospect" }
  }
};

describe("c-ui-embedding-unsaved-changes", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  function mount() {
    const el = createElement("c-ui-embedding-unsaved-changes", {
      is: UiEmbeddingUnsavedChanges
    });
    el.recordId = "001";
    document.body.appendChild(el);
    return el;
  }

  // The host listens for the guest's dirty/save events declaratively on
  // .recipe-body, so dispatch them from the embedding element with bubbles set.
  function fireFromEmbedding(el, type, detail) {
    el.shadowRoot
      .querySelector("lightning-ui-embedding")
      .dispatchEvent(new CustomEvent(type, { detail, bubbles: true }));
  }

  it("flips the badge to Unsaved changes when the guest marks the state dirty", async () => {
    const el = mount();

    // Starts clean: "Saved" badge, no warning badge.
    let badge = el.shadowRoot.querySelector("lightning-badge");
    expect(badge.label).toBe("Saved");

    fireFromEmbedding(el, "trackdirtystate", { isDirty: true });
    await Promise.resolve();

    badge = el.shadowRoot.querySelector("lightning-badge");
    expect(badge.label).toBe("Unsaved changes");

    // And back to clean when the guest clears it.
    fireFromEmbedding(el, "trackdirtystate", { isDirty: false });
    await Promise.resolve();

    expect(el.shadowRoot.querySelector("lightning-badge").label).toBe("Saved");
  });

  it("writes the guest's edits via updateRecord and toasts on success", async () => {
    updateRecord.mockResolvedValue({});
    const el = mount();

    const toast = jest.fn();
    el.addEventListener("lightning__showtoast", toast);

    fireFromEmbedding(el, "guestsave", {
      name: "Acme Industries",
      rating: "Hot",
      type: "Customer - Direct"
    });
    await Promise.resolve();

    expect(updateRecord).toHaveBeenCalledWith({
      fields: {
        Id: "001",
        Name: "Acme Industries",
        Rating: "Hot",
        Type: "Customer - Direct"
      }
    });
    expect(toast).toHaveBeenCalledTimes(1);
    expect(toast.mock.calls[0][0].detail.variant).toBe("success");
  });

  it("toasts an error when the save fails", async () => {
    updateRecord.mockRejectedValue({ body: { message: "Field is required." } });
    const el = mount();

    const toast = jest.fn();
    el.addEventListener("lightning__showtoast", toast);

    fireFromEmbedding(el, "guestsave", { name: "x", rating: "Hot", type: "" });
    // Two microtasks: the awaited updateRecord rejection, then the toast.
    await Promise.resolve();
    await Promise.resolve();

    expect(toast).toHaveBeenCalledTimes(1);
    const { title, message, variant } = toast.mock.calls[0][0].detail;
    expect(variant).toBe("error");
    expect(title).toBe("Save failed");
    expect(message).toBe("Field is required.");
  });

  it("does not attempt a write when there is no recordId", async () => {
    updateRecord.mockResolvedValue({});
    const el = createElement("c-ui-embedding-unsaved-changes", {
      is: UiEmbeddingUnsavedChanges
    });
    document.body.appendChild(el);

    fireFromEmbedding(el, "guestsave", { name: "x", rating: "Hot", type: "y" });
    await Promise.resolve();

    expect(updateRecord).not.toHaveBeenCalled();
  });

  it("shows the committed record values from the getRecord wire", async () => {
    const el = mount();

    getRecord.emit(RECORD);
    await Promise.resolve();

    const detail = el.shadowRoot.querySelectorAll(
      ".slds-dl_horizontal__detail"
    );
    const text = Array.from(detail).map((node) => node.textContent);
    expect(text).toEqual(["Acme Corp", "Warm", "Prospect"]);
  });
});

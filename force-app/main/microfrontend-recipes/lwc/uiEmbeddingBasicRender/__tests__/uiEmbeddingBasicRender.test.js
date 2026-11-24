import { createElement } from "lwc";
import { __emitGuestSrc, MOCK_GUEST_BASE } from "c/guestHost";
import UiEmbeddingBasicRender from "c/uiEmbeddingBasicRender";
import { getRecord } from "lightning/uiRecordApi";

// Minimal getRecord shape: getFieldValue reads fields[Api.Name].value.
const RECORD = {
  fields: {
    Name: { value: "Acme Corp" },
    Industry: { value: "Technology" },
    Type: { value: "Customer - Direct" },
    Website: { value: "acme.example" }
  }
};

describe("c-ui-embedding-basic-render", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("passes wired Account fields to the embedding as props", async () => {
    const el = createElement("c-ui-embedding-basic-render", {
      is: UiEmbeddingBasicRender
    });
    el.recordId = "001";
    document.body.appendChild(el);

    getRecord.emit(RECORD);
    await Promise.resolve();

    const embed = el.shadowRoot.querySelector("lightning-ui-embedding");
    expect(embed.src).toContain("/embedding/basic-render");
    expect(embed.props).toEqual({
      recordId: "001",
      name: "Acme Corp",
      industry: "Technology",
      type: "Customer - Direct",
      website: "acme.example"
    });
  });

  it("embeds the guest route from c/guestHost", async () => {
    const el = createElement("c-ui-embedding-basic-render", {
      is: UiEmbeddingBasicRender
    });
    el.recordId = "001";
    document.body.appendChild(el);
    await Promise.resolve();

    expect(el.shadowRoot.querySelector("lightning-ui-embedding").src).toBe(
      `${MOCK_GUEST_BASE}/embedding/basic-render`
    );
  });

  it("remounts the embedding when the guest src changes", async () => {
    const el = createElement("c-ui-embedding-basic-render", {
      is: UiEmbeddingBasicRender
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
});

import { createElement } from "lwc";
import UiEmbeddingReadHostData from "c/uiEmbeddingReadHostData";
import { getRecord } from "lightning/uiRecordApi";

const RECORD = {
  fields: {
    Name: { value: "Acme Corp" },
    Rating: { value: "Hot" },
    Type: { value: "Customer - Direct" },
    Industry: { value: "Technology" },
    Website: { value: "acme.example" },
    Phone: { value: "415-555-0101" }
  }
};

describe("c-ui-embedding-read-host-data", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("streams wired fields to the embedding and renders the edit form", async () => {
    const el = createElement("c-ui-embedding-read-host-data", {
      is: UiEmbeddingReadHostData
    });
    el.recordId = "001";
    document.body.appendChild(el);

    getRecord.emit(RECORD);
    await Promise.resolve();

    const embed = el.shadowRoot.querySelector("lightning-ui-embedding");
    expect(embed.src).toContain("/embedding/read-host-data");
    expect(embed.props.rating).toBe("Hot");
    expect(embed.props.phone).toBe("415-555-0101");

    // The host side shows a native record-edit-form so writes flow back.
    expect(
      el.shadowRoot.querySelector("lightning-record-edit-form")
    ).not.toBeNull();
  });
});

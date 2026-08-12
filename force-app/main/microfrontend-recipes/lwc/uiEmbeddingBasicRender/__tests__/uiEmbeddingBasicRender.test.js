import { createElement } from "lwc";
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
});

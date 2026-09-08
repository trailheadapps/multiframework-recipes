import { createElement } from "lwc";
import UiEmbeddingGraphqlData from "c/uiEmbeddingGraphqlData";
import { graphql } from "lightning/graphql";

// One Account with its related Contacts, in the GraphQL UIAPI connection shape:
// the Account node exposes a nested `Contacts` connection.
const ACCOUNT_CONTACTS = {
  uiapi: {
    query: {
      Account: {
        edges: [
          {
            node: {
              Id: "001",
              Name: { value: "Acme Corp" },
              Contacts: {
                edges: [
                  {
                    node: {
                      Id: "003a",
                      Name: { value: "Amy Taylor" },
                      Title: { value: "VP of Engineering" },
                      Email: { value: "amy@demo.net" },
                      Phone: { value: "415-555-0101" }
                    }
                  },
                  {
                    node: {
                      Id: "003b",
                      Name: { value: "Parker Brown" },
                      Title: { value: "Buyer" },
                      Email: { value: null },
                      Phone: { value: null }
                    }
                  }
                ]
              }
            }
          }
        ]
      }
    }
  }
};

// Mount the host and capture every `contactsdata` event the embedding receives.
function mount() {
  const el = createElement("c-ui-embedding-graphql-data", {
    is: UiEmbeddingGraphqlData
  });
  // On a record page Lightning sets recordId — the account being viewed.
  el.recordId = "001";
  document.body.appendChild(el);
  const embed = el.shadowRoot.querySelector("lightning-ui-embedding");
  const payloads = [];
  embed.addEventListener("contactsdata", (e) => payloads.push(e.detail));
  return { el, embed, payloads, last: () => payloads[payloads.length - 1] };
}

describe("c-ui-embedding-graphql-data", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("points the embedding at the guest route", () => {
    const { embed } = mount();
    expect(embed.src).toContain("/embedding/graphql-data");
  });

  it("pushes the account's unwrapped related contacts to the guest as an event payload", async () => {
    const { payloads, last } = mount();

    // The graphql stub wraps the emitted value as { data, errors }, so emit the
    // raw data payload here.
    graphql.emit(ACCOUNT_CONTACTS);
    await Promise.resolve();

    expect(payloads.length).toBeGreaterThan(0);
    const detail = last();
    expect(detail.error).toBeUndefined();
    // The wire has emitted, so the payload is marked final (not a placeholder).
    expect(detail.loaded).toBe(true);
    expect(detail.accountName).toBe("Acme Corp");
    expect(detail.contacts).toHaveLength(2);
    // { value } wrappers are unwrapped into plain, serializable fields.
    expect(detail.contacts[0]).toEqual({
      id: "003a",
      name: "Amy Taylor",
      title: "VP of Engineering",
      email: "amy@demo.net",
      phone: "415-555-0101"
    });
    expect(detail.contacts[1].email).toBeNull();
    expect(detail.contacts[1].phone).toBeNull();
  });

  it("replies with the current data when the guest requests it", async () => {
    const { embed, payloads, last } = mount();

    graphql.emit(ACCOUNT_CONTACTS);
    await Promise.resolve();

    // Guest just attached its listener and asks for the data.
    payloads.length = 0;
    embed.dispatchEvent(new CustomEvent("requestcontacts"));

    expect(payloads).toHaveLength(1);
    expect(last().contacts).toHaveLength(2);
    expect(last().accountName).toBe("Acme Corp");
  });

  it("forwards GraphQL errors to the guest", async () => {
    const { last } = mount();

    graphql.emitErrors([{ message: "insufficient access" }]);
    await Promise.resolve();

    expect(last().error).toBe("insufficient access");
    expect(last().contacts).toHaveLength(0);
  });
});

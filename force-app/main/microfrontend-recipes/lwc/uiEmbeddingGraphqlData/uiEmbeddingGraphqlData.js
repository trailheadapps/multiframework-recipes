/**
 * GraphQL Data (Indirect Access) — host side
 *
 * The "indirect Salesforce data access" pattern for externally hosted MFEs.
 * An externally hosted guest has no direct org data access, so this LWC
 * wrapper does the fetching: it queries an Account together with its related
 * Contacts using the GraphQL wire adapter (lightning/graphql) and pushes the
 * unwrapped rows DOWN to the guest as a custom event payload — `contactsdata`
 * with the contacts on `event.detail`. The React MFE listens via
 * viewSDK.addEventListener() and renders whatever it receives.
 *
 * Fetching an account's *related contacts* (rather than a flat list of one
 * object) is the point: a single GraphQL query walks the Account → Contacts
 * relationship and returns both the parent context and its children in one
 * round trip — the cross-entity traversal within a bound context that is
 * GraphQL's real strength. The bound context is the *current* record: on an
 * Account record page LWC receives `@api recordId`, and the query filters by
 * it, so the guest always shows contacts for the account being viewed.
 *
 * Why an event instead of the declarative `props` bridge? Events model a
 * one-off "here is the data I fetched for you" push and let the guest pull on
 * demand. Because events are fire-and-forget (not a retained snapshot), the
 * guest sends a `requestcontacts` event once it is listening; the host replies
 * with the current payload. That handshake makes delivery reliable no matter
 * whether the wire or the iframe finishes loading first.
 *
 * @see https://developer.salesforce.com/docs/platform/graphql/guide/intro-graphql-api.html
 * @see uiEmbeddingReceiveEvent — host → guest events (signal only)
 * @see uiEmbeddingSendToHost — guest → host events (payload on detail)
 */
import { LightningElement, api, wire } from "lwc";
import { gql, graphql } from "lightning/graphql";

export default class UiEmbeddingGraphqlData extends LightningElement {
  @api baseUrl = "http://localhost:5173";

  // Set by Lightning when the host sits on a record page — the account being
  // viewed. That's the bound context whose contacts we fetch.
  @api recordId;

  accountName;
  contacts = [];
  error;

  // False until the wire callback has run at least once. Lets the guest tell
  // "still loading" apart from "loaded, but this account has no contacts" —
  // both leave `contacts` empty, so the count alone can't distinguish them.
  loaded = false;

  // The wire commonly resolves before the first render, when `this.refs` (and
  // the embedding element) don't exist yet. Track when the frame is live so we
  // never dispatch into nothing.
  _rendered = false;

  // GraphQL UIAPI wraps every query under uiapi.query.<Object> and returns the
  // Relay connection shape: edges → node → fields, each scalar in { value }.
  // Here the query walks a child relationship: the Account node exposes its
  // related `Contacts` as a nested connection, so one query returns the parent
  // account and its contacts together.
  //
  // A wire FUNCTION (not a field) gives us a callback on every emission, which
  // is where we push the data down to the guest. (A field wouldn't re-render
  // the host on change, since the template no longer binds the data.)
  @wire(graphql, {
    query: gql`
      query AccountContacts($accountId: ID) {
        uiapi {
          query {
            Account(
              where: { Id: { eq: $accountId } }
              first: 1
            ) {
              edges {
                node {
                  Id
                  Name {
                    value
                  }
                  Contacts {
                    edges {
                      node {
                        Id
                        Name {
                          value
                        }
                        Title {
                          value
                        }
                        Email {
                          value
                        }
                        Phone {
                          value
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: "$queryVariables"
  })
  wiredContacts({ data, errors }) {
    const account = data?.uiapi?.query?.Account?.edges?.[0]?.node;
    this.accountName = account?.Name?.value ?? null;
    const edges = account?.Contacts?.edges ?? [];
    this.contacts = edges.map(({ node }) => ({
      id: node.Id,
      name: node.Name?.value ?? null,
      title: node.Title?.value ?? null,
      email: node.Email?.value ?? null,
      phone: node.Phone?.value ?? null
    }));
    // GraphQL errors are returned, not thrown — surface them to the guest.
    this.error = errors?.length
      ? errors.map((e) => e.message).join("; ")
      : undefined;
    // The wire has now emitted (data or error), so whatever we send is final,
    // not a pre-load placeholder.
    this.loaded = true;
    // Push down to the guest. It may not be listening yet on this first push;
    // its `requestcontacts` handshake (below) covers that race.
    this.sendContacts();
  }

  // Bound query variable — the current record's Id. Reactive: when `recordId`
  // arrives (or changes), the wire re-fires for the new account.
  get queryVariables() {
    return { accountId: this.recordId };
  }

  // Once the frame is rendered, push anything the wire may have delivered
  // before it existed.
  renderedCallback() {
    this._rendered = true;
    this.sendContacts();
  }

  get computedSrc() {
    const url = new URL(this.baseUrl);
    url.pathname = "/embedding/graphql-data";
    return url.toString();
  }

  get payload() {
    return {
      accountName: this.accountName,
      contacts: this.contacts,
      error: this.error,
      loaded: this.loaded
    };
  }

  // Guest → host: the guest asks for the data once it has a listener attached.
  // Reply with whatever we currently have.
  handleRequestContacts() {
    this.sendContacts();
  }

  // Host → guest: dispatch the contacts on the embedding element. The bridge
  // forwards the event (detail included) and the guest's
  // viewSDK.addEventListener('contactsdata', ...) fires. No-ops until the frame
  // is rendered (the wire can fire first).
  sendContacts() {
    if (!this._rendered) {
      return;
    }
    this.refs?.embedding?.dispatchEvent(
      new CustomEvent("contactsdata", { detail: this.payload })
    );
  }
}

# Indirect Salesforce Data Access (GraphQL)

Externally hosted microfrontends run on your own origin, inside an iframe. They
have **no direct Salesforce org data access** — no `@wire`, no UI API session,
no session cookie for the org. This recipe shows the pattern customers can use
today to get org data into an externally hosted MFE anyway: let a thin **host
LWC wrapper** do the fetching and pass the results down.

The example query fetches the **related contacts of the current account** — the
record the page is on, via the host LWC's `@api recordId` — in a single call.
Rather than retrieving one flat object, it walks the Account → Contacts
relationship and returns the parent account and its children together — the
cross-entity traversal within a bound context that is GraphQL's real strength.

## When to use this pattern

- Your MFE is **externally hosted** (served from your own domain) rather than a
  UI Bundle, so it cannot call Salesforce data APIs directly.
- You already have a place to drop an LWC (a record page, app page, or home
  page) that can fetch the data and host the frame.
- The data is read-mostly and can be **serialized across the bridge** (plain
  JSON — no functions, class instances, or DOM nodes).

If your app can be deployed as a **UI Bundle**, prefer that: UI Bundles get
first-class, direct data access via the Platform Data SDK (`createDataSDK`,
GraphQL, UI API REST) and skip the bridge entirely. See the `read-data` and
`modify-data` recipes for the direct-access approach.

## Data flow

```
┌───────────────────────────────────────────────────────────────┐
│ Salesforce (Lightning page)                                     │
│                                                                 │
│   uiEmbeddingGraphqlData  (host LWC)                             │
│     @wire(graphql, { query })  ──►  Account → related Contacts   │
│           │  unwrap edges/node + { value }                       │
│           ▼                                                      │
│     <lightning-ui-embedding>                                     │
│        │  dispatchEvent("contactsdata", { detail })   (push)     │
│        ▲  "requestcontacts" event                     (pull)     │
│  ──────┼──────────────── iframe boundary ─────────────────────   │
│        ▼                                                         │
│     GraphqlData.tsx  (React guest, externally hosted)            │
│       viewSDK.addEventListener("contactsdata", …)                │
│       viewSDK.dispatchEvent("requestcontacts")  once listening   │
│           ▼                                                      │
│       renders the contact list (no org access of its own)        │
└───────────────────────────────────────────────────────────────┘
```

The host owns the query and the org session; the guest only ever sees the data
the host chooses to forward. When the wire resolves (or re-fires), the host
dispatches a `contactsdata` event carrying the rows on `event.detail`. Because
events are fire-and-forget, the guest also dispatches `requestcontacts` once its
listener is attached, and the host replies with the current payload — so
delivery is reliable whichever side finishes loading first.

## The two sides

| Side  | File | Responsibility |
| ----- | ---- | -------------- |
| Host  | [`uiEmbeddingGraphqlData.js`](./uiEmbeddingGraphqlData.js) | `@wire(graphql, …)` fetches an Account and its related Contacts, unwraps them, and dispatches them as a `contactsdata` event on `<lightning-ui-embedding>`. Replies to the guest's `requestcontacts`. |
| Guest | [`GraphqlData.tsx`](../../../../react-recipes/uiBundles/reactRecipes/src/recipes/embedding/GraphqlData.tsx) | Listens with `viewSDK.addEventListener("contactsdata", …)`, asks for the data with `requestcontacts`, and renders the rows. |

The GraphQL wire adapter (`gql` / `graphql` from
[`lightning/graphql`](https://developer.salesforce.com/docs/platform/graphql/guide/intro-graphql-api.html))
is one common choice; an Apex `@wire` method, `getRecord`/`getListUi`, or an
imperative Apex call work exactly the same way — the guest never knows which
one the host used.

## Trade-offs vs. UI Bundles direct access

| | Externally hosted + indirect access (this recipe) | UI Bundle direct access |
| --- | --- | --- |
| Org data access | Via a host LWC wrapper + event/message bridge | Direct — Platform Data SDK inside the bundle |
| Hosting | Your own origin / CDN | Served by Salesforce |
| Data freshness | Host must re-fetch and re-push | Guest queries on demand |
| Payload shape | Must be JSON-serializable | Any in-memory shape |
| Extra moving part | The wrapper LWC and the bridge | None |
| Best for | Reusing an app already hosted elsewhere | New apps built for Salesforce |

## Related recipes

- **Read Host Data** (`uiEmbeddingReadHostData`) — the same props bridge for a
  single record's live fields via `getRecord`.
- **Send to Host** (`uiEmbeddingSendToHost`) — the guest writing data back up to
  the host.

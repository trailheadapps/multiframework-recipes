# Multi-Framework Recipe Style Guide

## The Core Principle

Recipe code is optimized for **reading**, not for software engineering best practices. In production code, you extract shared logic into utilities. In recipe code, you **inline the thing you're teaching** so the reader sees everything without opening another file.

This is the single most important rule. Everything else follows from it.

The examples below are written in React, but the concepts apply to any framework.

---

## Before & After Examples (from the actual codebase)

### 1. Don't hide queries behind imports

**Before (current)** — `SingleRecord.tsx`:

```tsx
import { getContacts } from "@/api/contacts";

useEffect(() => {
  getContacts().then((contacts) => setContact(contacts[0]));
  // ...
}, []);
```

The reader sees `getContacts()` and learns nothing about GraphQL, the UIAPI shape, or the `{ value }` wrapper. The lesson is in a different file.

**After** — query is inline:

```tsx
import { createDataSDK, gql } from "@salesforce/sdk-data";

// The full UIAPI GraphQL shape is visible here.
// Every field returns { value } — this is unique to Salesforce GraphQL.
const QUERY = gql`
  query SingleContact {
    uiapi {
      query {
        Contact(first: 1, orderBy: { Name: { order: ASC } }) {
          edges {
            node {
              Id
              Name {
                value
              }
              Title {
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
`;

useEffect(() => {
  const fetch = async () => {
    const sdk = await createDataSDK();
    const result = await sdk.graphql(QUERY);
    // Unwrap: edges → node → Field.value
    const node = result?.data?.uiapi?.query?.Contact?.edges?.[0]?.node;
    if (node) {
      setContact({
        id: node.Id,
        name: node.Name?.value ?? "Unknown",
        title: node.Title?.value ?? null,
        phone: node.Phone?.value ?? null
      });
    }
  };
  fetch();
}, []);
```

Now every line teaches something.

---

### 2. Don't hide mutations behind imports

**Before (current)** — `DeleteRecord.tsx`:

```tsx
import { deleteAccount } from "@/api/mutations";

deleteAccount(id).then(() =>
  setAccounts((prev) => prev.filter((a) => a.Id !== id))
);
```

The reader doesn't see the mutation syntax.

**After** — mutation is inline:

```tsx
// UIAPI GraphQL mutation — only the record Id is needed for delete
const DELETE_ACCOUNT = gql`
  mutation DeleteAccount($input: RecordDeleteInput!) {
    uiapi {
      AccountDelete(input: $input) {
        Id
      }
    }
  }
`;

async function handleDelete(id: string) {
  const sdk = await createDataSDK();
  const result = await sdk.graphql(DELETE_ACCOUNT, { input: { Id: id } });

  if (result?.errors?.length) {
    throw new Error(result.errors.map((e) => e.message).join("; "));
  }

  // Remove from local state — no re-fetch needed
  setAccounts((prev) => prev.filter((a) => a.Id !== id));
}
```

---

### 3. Don't use complex inferred types

**Before (current):**

```tsx
const [contact, setContact] =
  useState<Awaited<ReturnType<typeof getContacts>>[number]>();
```

The reader has to mentally unwind 3 layers of type gymnastics.

**After** — explicit interface:

```tsx
interface ContactFields {
  id: string;
  name: string;
  title: string | null;
  phone: string | null;
}

const [contact, setContact] = useState<ContactFields>();
```

---

### 4. Don't use type casts for errors

**Before (current — appears in every recipe):**

```tsx
.catch(err => setError((err as Error).message))
```

This tells TypeScript to shut up. It doesn't tell the reader what's happening.

**After:**

```tsx
.catch(err => {
  setError(err instanceof Error ? err.message : "Request failed");
})
```

---

### 5. Don't import formatting utilities

**Before (current):**

```tsx
import { formatPhone } from "@/utils/formatPhone";
// ...
<a href={`tel:${contact.Phone.value}`}>{formatPhone(contact.Phone.value)}</a>;
```

The reader wonders what `formatPhone` does and whether it matters.

**After** — just render the value:

```tsx
<a href={`tel:${contact.phone}`}>{contact.phone}</a>
```

The recipe is about data access, not phone formatting.

---

### 6. Don't mix styling systems

**Before (current):**

```tsx
<div className="flex items-center gap-4">           {/* Tailwind */}
  <p className="font-semibold">{name}</p>            {/* Tailwind */}
  <p className="text-sm text-muted-foreground">      {/* Tailwind */}
    {title}
  </p>
</div>
// ...
<button className="slds-button slds-button_brand">  {/* SLDS */}
```

Mixed signals — which system should the reader use?

**After** — one system per recipe:

```tsx
{
  /* Data recipes use SLDS throughout */
}
<div className="slds-grid slds-grid_vertical-align-center">
  <p className="slds-text-heading_small">{name}</p>
  <p className="slds-text-body_small slds-text-color_weak">{title}</p>
</div>;
```

---

### 7. Don't leave debug code

**Before (current)** — `SingleRecord.tsx`:

```tsx
useEffect(() => {
  createDataSDK().then(sdk => console.log(`sdk: ${JSON.stringify(sdk)}`));
  // ...
```

This is debugging output that was never cleaned up.

**After:** Delete it.

---

### 8. Platform-ground the Hello recipes

**Before (current)** — `DataBinding.tsx`:

```tsx
export default function DataBinding() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>
        Count: <strong>{count}</strong>
      </p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </div>
  );
}
```

This is a React tutorial, not a Salesforce recipe. It works identically outside Salesforce.

**After** — grounded in the platform:

```tsx
/**
 * Binding to an Account Name
 *
 * Fetches an Account via GraphQL and binds the Name field to the UI.
 * Introduces the { value } wrapper that Salesforce GraphQL uses for all fields.
 */
export default function BindingAccountName() {
  const [name, setName] = useState<string>();

  useEffect(() => {
    const fetch = async () => {
      const sdk = await createDataSDK();
      const result = await sdk.graphql(QUERY);
      const node = result?.data?.uiapi?.query?.Account?.edges?.[0]?.node;
      // Salesforce wraps every field in { value }
      setName(node?.Name?.value ?? "Unknown");
    };
    fetch();
  }, []);

  return <p className="slds-text-heading_medium">{name ?? "Loading…"}</p>;
}
```

---

## Summary Checklist

Before submitting any recipe, verify:

- [ ] The query/mutation is **inline in the recipe file**, not imported from `src/api/`
- [ ] Types are **explicit interfaces**, not `Awaited<ReturnType<...>>` or `NonNullable<...>` chains
- [ ] Errors use `err instanceof Error`, not `(err as Error)`
- [ ] No `formatPhone` or other utility imports
- [ ] No `console.log` or debug code
- [ ] One styling system per recipe (SLDS for data recipes)
- [ ] Hello recipes involve the Salesforce platform (not pure React)
- [ ] File header comment explains what the recipe demonstrates
- [ ] Comments explain **Salesforce-specific** behavior, not React basics
- [ ] New or renamed recipes are reflected in `src/recipeRegistry.ts`

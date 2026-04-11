/**
 * Apex REST
 *
 * Calls a custom Apex REST endpoint to fetch Contacts via DataSDK.fetch.
 * Unlike UIAPI responses, Apex returns plain JSON with no { value } wrappers.
 *
 * LWC equivalent: @wire with an imported Apex method for reactive calls,
 * or imperative Apex (import { apexMethod } from '@salesforce/apex/...';
 * apexMethod()) for on-demand invocation.
 *
 * @see UiApiRest — using the UI API REST endpoints directly
 */
import { useState, type FormEvent } from 'react';
import { createDataSDK } from '@salesforce/sdk-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage } from '@/components/ui/avatar';

// Shape returned by the ContactsResource Apex class
type ApexContact = {
  id: string;
  name: string;
  title: string | null;
  phone: string | null;
  pictureUrl: string | null;
};

export default function ApexRest() {
  const [nameFilter, setNameFilter] = useState('');
  const [contacts, setContacts] = useState<ApexContact[] | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      setContacts(await fetchContactsFromApex(nameFilter));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit}>
        <div className="space-y-1 mb-2">
          <label className="text-sm font-medium" htmlFor="apex-name">
            Filter by name
          </label>
          <Input
            id="apex-name"
            type="text"
            placeholder="e.g. Smith (leave blank for first 10)"
            value={nameFilter}
            onChange={e => setNameFilter(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Loading…' : 'Fetch Contacts'}
        </Button>
      </form>

      {error && (
        <div
          className="rounded-md bg-rose-50 border border-rose-200 p-4 text-rose-700"
          role="alert"
        >
          <p className="text-xs">{error}</p>
        </div>
      )}

      {contacts &&
        (contacts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No contacts found.</p>
        ) : (
          <ul>
            {contacts.map(c => (
              <li
                key={c.id}
                className="py-2 -mx-2 px-2 rounded-md transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-3">
                  {c.pictureUrl && (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={c.pictureUrl} alt={c.name} />
                    </Avatar>
                  )}
                  <div>
                    <p className="text-sm">
                      <strong>{c.name}</strong>
                    </p>
                    {c.title && (
                      <p className="text-xs text-muted-foreground">{c.title}</p>
                    )}
                    {c.phone && (
                      <a
                        href={`tel:${c.phone}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {c.phone}
                      </a>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}

// Apex class: ContactsResource (@RestResource urlMapping='/contacts')
//   GET /services/apexrest/contacts          — first 10 contacts
//   GET /services/apexrest/contacts?name=... — filtered by name
async function fetchContactsFromApex(
  nameFilter: string
): Promise<ApexContact[]> {
  const sdk = await createDataSDK();
  const url = nameFilter
    ? `/services/apexrest/contacts?name=${encodeURIComponent(nameFilter)}`
    : '/services/apexrest/contacts';

  const res = await sdk.fetch?.(url);
  if (!res?.ok) throw new Error(`Apex REST error: ${res?.status}`);
  return (await res.json()) as ApexContact[];
}

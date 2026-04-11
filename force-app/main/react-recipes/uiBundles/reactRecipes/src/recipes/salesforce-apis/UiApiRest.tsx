/**
 * UI API (REST)
 *
 * Uses DataSDK.fetch with two UI API endpoints: list-ui to discover the
 * AllContacts list view, then list-records to fetch and display contacts.
 * REST fields include { displayValue } with locale-aware formatting
 * that GraphQL doesn't expose.
 *
 * LWC equivalent: @wire(getListUi) to get list views, @wire(getListRecords)
 * to fetch records from a list view. These wire adapters provide the same
 * data with automatic caching.
 *
 * @see ButtonSLDS — styling with SLDS blueprint CSS classes
 */
import { useEffect, useState } from 'react';
import { createDataSDK } from '@salesforce/sdk-data';
import { Avatar, AvatarImage } from '@/components/ui/avatar';

// UI API list-ui response shape
type ListUiResponse = {
  lists: { id: string; apiName: string; label: string }[];
};

// UI API list-records response shape
type ListRecordsResponse = {
  records: UiApiRecord[];
};

// UI API record — only the fields we request
type UiApiRecord = {
  fields: {
    Name: { value: string | null };
    Title: { value: string | null };
    Phone: { value: string | null };
    Picture__c: { value: string | null };
  };
};

export default function UiApiRest() {
  const [records, setRecords] = useState<UiApiRecord[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetchContactsViaUiApi()
      .then(setRecords)
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Request failed');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm">Loading…</p>;
  if (error) return <p className="text-xs text-destructive">{error}</p>;
  if (!records || records.length === 0)
    return <p className="text-muted-foreground text-sm">No contacts found.</p>;

  return (
    <ul>
      {records.map((r, i) => {
        const { Name, Title, Phone, Picture__c } = r.fields;
        return (
          <li
            key={i}
            className="py-2 -mx-2 px-2 rounded-md transition-colors hover:bg-accent/50"
          >
            <div className="flex items-center gap-3">
              {Picture__c?.value && (
                <Avatar className="h-10 w-10">
                  <AvatarImage src={Picture__c.value} alt={Name?.value ?? ''} />
                </Avatar>
              )}
              <div>
                <p className="text-sm">
                  <strong>{Name?.value}</strong>
                </p>
                {Title?.value && (
                  <p className="text-xs text-muted-foreground">{Title.value}</p>
                )}
                {Phone?.value && (
                  <a
                    href={`tel:${Phone.value}`}
                    className="text-xs text-primary hover:underline"
                  >
                    {Phone.value}
                  </a>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

async function fetchContactsViaUiApi(): Promise<UiApiRecord[]> {
  const sdk = await createDataSDK();

  // Step 1: Get list views for Contact
  const listUiRes = await sdk.fetch?.(
    '/services/data/v66.0/ui-api/list-ui/Contact'
  );
  if (!listUiRes?.ok)
    throw new Error(`List UI fetch failed (${listUiRes?.status})`);
  const listUiData: ListUiResponse = await listUiRes.json();
  const allContactsList = listUiData.lists.find(
    l => l.apiName === 'AllContacts'
  );
  if (!allContactsList) throw new Error('AllContacts list view not found');

  // Step 2: Fetch records from that list view
  const listRecordsRes = await sdk.fetch?.(
    `/services/data/v66.0/ui-api/list-records/${allContactsList.id}?fields=Contact.Name,Contact.Title,Contact.Phone,Contact.Picture__c`
  );
  if (!listRecordsRes?.ok)
    throw new Error(`List records fetch failed (${listRecordsRes?.status})`);
  const listRecordsData: ListRecordsResponse = await listRecordsRes.json();

  return listRecordsData.records;
}

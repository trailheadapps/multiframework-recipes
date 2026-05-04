/**
 * Child-to-Parent (Callbacks) with Salesforce Data
 *
 * A child component presents an Industry selector and calls a parent callback
 * when the user picks a value. The parent then fetches Accounts matching that
 * Industry.
 *
 * LWC equivalent: child components dispatch CustomEvent via this.dispatchEvent(),
 * and the parent listens with onchange or oncustomname handlers. React uses
 * callback props — simpler, no event object wrapping needed.
 *
 * @see StateManagement — sharing state between sibling components
 */
import { useEffect, useState } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';

// Industry picklist values from the Account standard object
const INDUSTRIES = [
  'Agriculture',
  'Banking',
  'Education',
  'Energy',
  'Finance',
  'Healthcare',
  'Manufacturing',
  'Retail',
  'Technology',
];

const QUERY = gql`
  query AccountsByIndustry($industry: Picklist) {
    uiapi {
      query {
        Account(
          where: { Industry: { eq: $industry } }
          first: 5
          orderBy: { Name: { order: ASC } }
        ) {
          edges {
            node {
              Id
              Name @optional {
                value
              }
            }
          }
        }
      }
    }
  }
`;

interface QueryResponse {
  uiapi: {
    query: {
      Account: {
        edges: Array<{
          node: { Id: string; Name: { value: string | null } };
        }>;
      };
    };
  };
}

export default function ChildToParent() {
  const [industry, setIndustry] = useState<string>();
  const [accounts, setAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!industry) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    const fetchAccounts = async () => {
      const sdk = await createDataSDK();
      const result = await sdk.graphql?.<QueryResponse>({
        query: QUERY,
        variables: { industry },
      });

      if (result?.errors?.length) {
        throw new Error(
          result.errors.map((e: { message: string }) => e.message).join('; ')
        );
      }

      const edges = result?.data?.uiapi?.query?.Account?.edges ?? [];
      setAccounts(
        edges
          .map(edge => edge?.node?.Name?.value)
          .filter((n): n is string => n != null)
      );
    };

    fetchAccounts()
      .catch(() => setAccounts([]))
      .finally(() => setLoading(false));
  }, [industry]);

  return (
    <div>
      {/* The child calls onSelect — the parent owns what happens next */}
      <IndustryPicker onSelect={setIndustry} />

      {loading && <p className="text-sm mt-2">Loading…</p>}

      {!loading && industry && (
        <div className="mt-2">
          {accounts.length > 0 ? (
            <ul className="list-disc pl-5">
              {accounts.map(name => (
                <li key={name} className="text-sm">
                  {name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No accounts in {industry}.</p>
          )}
        </div>
      )}
    </div>
  );
}

interface IndustryPickerProps {
  onSelect: (industry: string) => void;
}

function IndustryPicker({ onSelect }: IndustryPickerProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium" htmlFor="industry-picker">
        Pick an Industry
      </label>
      <div>
        <select
          id="industry-picker"
          className="w-full rounded-md border border-input px-3 py-2 text-sm"
          defaultValue=""
          onChange={e => onSelect(e.target.value)}
        >
          <option value="" disabled>
            — Select —
          </option>
          {INDUSTRIES.map(ind => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

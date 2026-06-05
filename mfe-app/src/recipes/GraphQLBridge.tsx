/**
 * GraphQL Bridge
 *
 * Executes a Salesforce GraphQL query from inside the MFE iframe. The bridge
 * proxies the request through the host LWC — the MFE never needs
 * allow-same-origin. Up to 10 requests can be in-flight simultaneously;
 * extras are queued automatically.
 *
 * Key concept: bridge.graphql({ query, variables }) returns a Promise that
 * resolves with the same shape as a direct GraphQL response. The host must
 * have the graphql bridge enabled (the mfeGraphQL LWC uses it automatically
 * via vendorLwcShell).
 *
 * @see ReceiveData — simpler host → MFE data flow without GraphQL
 */
import { useState } from 'react';
import bridge from '@salesforce/experimental-mfe-bridge';

const QUERY = `
  query MfeContacts {
    uiapi {
      query {
        Contact(first: 5, orderBy: { Name: { order: ASC } }) {
          edges {
            node {
              Id
              Name { value }
              Title { value }
            }
          }
        }
      }
    }
  }
`;

interface ContactNode {
    Id: string;
    Name: { value: string | null };
    Title: { value: string | null };
}

interface QueryResult {
    data?: {
        uiapi?: {
            query?: {
                Contact?: {
                    edges?: Array<{ node: ContactNode }>;
                };
            };
        };
    };
    errors?: Array<{ message: string }>;
}

export default function GraphQLBridge() {
    const [contacts, setContacts] = useState<ContactNode[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>();

    async function fetchContacts() {
        if (!bridge.isConnected()) {
            setError('Bridge not connected — embed this app inside the mfeGraphQL LWC to execute queries.');
            return;
        }

        setLoading(true);
        setError(undefined);

        try {
            // bridge.graphql() proxies the query through the host LWC.
            // The MFE never directly calls Salesforce APIs — the host acts as the proxy.
            const result = (await bridge.graphql({ query: QUERY })) as QueryResult;

            if (result.errors?.length) {
                throw new Error(result.errors.map(e => e.message).join('; '));
            }

            const edges = result.data?.uiapi?.query?.Contact?.edges ?? [];
            setContacts(edges.map(e => e.node));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Query failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="recipe-container">
            <h2 className="recipe-title">GraphQL Bridge</h2>
            <p className="recipe-description">
                Executes a Salesforce GraphQL query via <code>bridge.graphql()</code>. The
                host proxies the request — no <code>allow-same-origin</code> needed.
            </p>

            <button
                className="recipe-btn recipe-btn-primary"
                onClick={fetchContacts}
                disabled={loading}
                style={{ marginBottom: 12 }}
            >
                {loading ? 'Querying…' : 'Fetch contacts'}
            </button>

            {error && <div className="recipe-alert alert-error">{error}</div>}

            {!error && contacts.length > 0 && (
                <div className="recipe-card">
                    <p className="recipe-label">{contacts.length} contact{contacts.length !== 1 ? 's' : ''}</p>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {contacts.map(c => (
                            <li key={c.Id} style={{ marginBottom: 8, fontSize: 13 }}>
                                <span style={{ fontWeight: 600 }}>{c.Name.value ?? 'Unknown'}</span>
                                {c.Title.value && (
                                    <span style={{ color: '#9ca3af', marginLeft: 6 }}>{c.Title.value}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

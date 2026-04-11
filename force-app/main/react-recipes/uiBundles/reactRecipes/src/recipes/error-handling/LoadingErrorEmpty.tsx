/**
 * Loading, Error, and Empty States
 *
 * Every async component must handle loading, error, and empty states explicitly.
 * In LWC, @wire provides data and error automatically; here you own all three
 * as a discriminated union state machine. Use the simulation buttons to trigger
 * each state on demand.
 *
 * LWC equivalent: @wire provides data and error properties. You check
 * if:true={data} / if:true={error} in the template. React uses a
 * discriminated union pattern with useState for the same effect.
 *
 * @see GraphqlErrors — inspecting GraphQL error objects
 */
import { useEffect, useState } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';
import Skeleton from '@/components/recipe/Skeleton';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage } from '@/components/ui/avatar';

// UIAPI GraphQL — fetch Contacts that have a profile picture
const QUERY = gql`
  query ContactsWithPicture {
    uiapi {
      query {
        Contact(
          where: { Picture__c: { ne: null } }
          first: 3
          orderBy: { Name: { order: ASC } }
        ) {
          edges {
            node {
              Id
              Name @optional {
                value
              }
              Phone @optional {
                value
              }
              Picture__c @optional {
                value
              }
              Title @optional {
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
      Contact: {
        edges: Array<{
          node: {
            Id: string;
            Name: { value: string | null } | null;
            Phone: { value: string | null } | null;
            Picture__c: { value: string | null } | null;
            Title: { value: string | null } | null;
          };
        }>;
      };
    };
  };
}

interface ContactFields {
  id: string;
  name: string;
  phone: string | null;
  picture: string | null;
  title: string | null;
}

type AsyncState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'data'; contacts: ContactFields[] };

export default function LoadingErrorEmpty() {
  const [state, setState] = useState<AsyncState>({ status: 'loading' });

  function fetchContacts() {
    const run = async () => {
      const sdk = await createDataSDK();
      const result = await sdk.graphql?.<QueryResponse>(QUERY);

      if (result?.errors?.length) {
        throw new Error(
          result.errors.map((e: { message: string }) => e.message).join('; ')
        );
      }

      const edges = result?.data?.uiapi?.query?.Contact?.edges ?? [];
      return edges
        .map(edge => edge?.node)
        .filter(Boolean)
        .map(node => ({
          id: node.Id,
          name: node.Name?.value ?? 'Unknown',
          phone: node.Phone?.value ?? null,
          picture: node.Picture__c?.value ?? null,
          title: node.Title?.value ?? null,
        }));
    };

    run()
      .then(contacts => {
        setState(
          contacts.length
            ? { status: 'data', contacts }
            : { status: 'empty' }
        );
      })
      .catch(err =>
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : 'Request failed',
        })
      );
  }

  function load() {
    setState({ status: 'loading' });
    fetchContacts();
  }

  // Initial state is already 'loading', so just fetch without resetting state
  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <SimulationControls
        onReload={load}
        onSimulateLoading={() => setState({ status: 'loading' })}
        onSimulateError={() =>
          setState({ status: 'error', message: 'Network request failed' })
        }
        onSimulateEmpty={() => setState({ status: 'empty' })}
      />

      {state.status === 'loading' && <LoadingSkeleton />}
      {state.status === 'error' && (
        <ErrorAlert message={state.message} onRetry={load} />
      )}
      {state.status === 'empty' && <EmptyState />}
      {state.status === 'data' && <ContactList contacts={state.contacts} />}
    </div>
  );
}

interface SimulationControlsProps {
  onReload: () => void;
  onSimulateLoading: () => void;
  onSimulateError: () => void;
  onSimulateEmpty: () => void;
}

function SimulationControls({
  onReload,
  onSimulateLoading,
  onSimulateError,
  onSimulateEmpty,
}: SimulationControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={onReload}>
        Reload
      </Button>
      <Button variant="outline" onClick={onSimulateLoading}>
        Simulate: Loading
      </Button>
      <Button variant="outline" onClick={onSimulateError}>
        Simulate: Error
      </Button>
      <Button variant="outline" onClick={onSimulateEmpty}>
        Simulate: Empty
      </Button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="rounded-md border border-border bg-card p-4 shadow-sm">
      <ul>
        {[0, 1, 2].map(i => (
          <li key={i} className="py-2 flex items-center gap-4">
            <Skeleton variant="avatar" />
            <Skeleton lines={3} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ErrorAlert({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      className="rounded-md bg-rose-50 border border-rose-200 p-4 text-rose-700"
      role="alert"
    >
      <p className="text-base font-semibold mb-1">Something went wrong</p>
      <p className="text-sm mb-3">{message}</p>
      <Button variant="ghost" onClick={onRetry}>
        Try Again
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-md border border-dashed border-border bg-card/50 text-center p-6">
      <p className="text-lg font-semibold mb-1">No Contacts Found</p>
      <p className="text-sm text-muted-foreground">
        Your query returned no results.
      </p>
    </div>
  );
}

function ContactList({ contacts }: { contacts: ContactFields[] }) {
  return (
    <div className="rounded-md border border-border bg-card p-4 shadow-sm">
      <ul>
        {contacts.map(contact => (
          <li
            key={contact.id}
            className="py-2 -mx-2 px-2 flex items-center gap-4 rounded-md transition-colors hover:bg-accent/50"
          >
            {contact.picture && (
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={contact.picture}
                  alt={contact.name}
                />
              </Avatar>
            )}
            <div>
              <p className="text-xs">
                <strong>{contact.name}</strong>
              </p>
              {contact.title && (
                <p className="text-xs text-muted-foreground">
                  {contact.title}
                </p>
              )}
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="text-xs text-primary hover:underline"
                >
                  {contact.phone}
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

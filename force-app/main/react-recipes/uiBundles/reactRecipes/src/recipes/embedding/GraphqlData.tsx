/**
 * GraphQL Data (Indirect Access)
 *
 * The guest side of the "indirect Salesforce data access" pattern. An
 * externally hosted MFE has no direct org data access, so it never issues a
 * GraphQL query itself. The host LWC (uiEmbeddingGraphqlData) runs one GraphQL
 * query that walks an Account to its related Contacts and pushes the rows DOWN
 * as a custom event: `contactsdata`, with the payload on `event.detail`. This
 * component listens with viewSDK.addEventListener() and renders what arrives.
 *
 * Events are fire-and-forget (no retained snapshot), so once we have a listener
 * attached we dispatch `requestcontacts` to ask the host to (re)send the
 * current data — covering the case where the host already pushed before this
 * iframe finished loading.
 *
 * @see ReceiveEvent — host → guest events (signal only)
 * @see SendToHost — guest → host events (payload on detail)
 */
import { useEffect, useState } from 'react';
import { Briefcase, ExternalLink, Mail, Phone } from 'lucide-react';
import { getViewSDK } from '@salesforce/platform-sdk';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ContactRow {
  id: string;
  name: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
}

interface GraphqlDataProps {
  accountName?: string | null;
  contacts?: ContactRow[];
  error?: string;
  // True once the host's GraphQL wire has emitted. Lets us tell "still loading"
  // apart from "loaded, but this account has no contacts".
  loaded?: boolean;
}

export default function GraphqlData() {
  const [props, setProps] = useState<GraphqlDataProps>({});

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    // getViewSDK() is async; if the component unmounts before it resolves,
    // `cancelled` stops us from wiring up a dead component.
    let cancelled = false;
    getViewSDK().then(sdk => {
      if (cancelled) return;

      // Host → guest: the contacts the host fetched arrive on event.detail.
      const onContacts = (e: Event) => {
        setProps(((e as CustomEvent).detail ?? {}) as GraphqlDataProps);
      };
      sdk.addEventListener?.('contactsdata', onContacts);

      // Now that we're listening, ask the host to (re)send the current data.
      sdk.dispatchEvent?.(
        new CustomEvent('requestcontacts', { bubbles: true })
      );

      cleanup = () => sdk.removeEventListener?.('contactsdata', onContacts);
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  const contacts = props.contacts ?? [];
  const accountName = props.accountName ?? 'the account';

  return (
    <div className="p-1">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">
            {props.accountName ? `${props.accountName} contacts` : 'Contacts'}
          </CardTitle>
          <CardDescription>
            {props.error
              ? props.error
              : !props.loaded
                ? 'Waiting for the host to send Contact data…'
                : contacts.length > 0
                  ? `${contacts.length} contact${contacts.length === 1 ? '' : 's'} related to ${accountName}, fetched by the host and sent as an event.`
                  : `No contacts related to ${accountName}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-border divide-y">
            {contacts.map(contact => (
              <ContactItem key={contact.id} contact={contact} />
            ))}
          </ul>
        </CardContent>
      </Card>
      <a
        href="https://github.com/trailheadapps/multiframework-recipes/blob/main/force-app/main/react-recipes/uiBundles/reactRecipes/src/recipes/embedding/GraphqlData.tsx"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-primary mt-3 inline-flex items-center gap-1 text-xs"
      >
        Guest (GraphqlData.tsx)
        <ExternalLink className="size-3" aria-hidden />
      </a>
    </div>
  );
}

function ContactItem({ contact }: { contact: ContactRow }) {
  return (
    <li className="flex flex-col gap-1 py-2 first:pt-0 last:pb-0">
      <span className="font-medium">{contact.name ?? 'Unnamed'}</span>
      <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {contact.title && (
          <span className="flex items-center gap-1">
            <Briefcase className="size-3.5" aria-hidden />
            {contact.title}
          </span>
        )}
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="hover:text-primary flex items-center gap-1"
          >
            <Mail className="size-3.5" aria-hidden />
            {contact.email}
          </a>
        )}
        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            className="hover:text-primary flex items-center gap-1"
          >
            <Phone className="size-3.5" aria-hidden />
            {contact.phone}
          </a>
        )}
      </div>
    </li>
  );
}

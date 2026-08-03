/**
 * Read Host Data
 *
 * Subscribes to live Account fields from the host. The LWC wires
 * getRecord on the current Account; every emission rebuilds `account`
 * with a new object reference, which the <lightning-ui-embedding> `props`
 * setter treats as a change and forwards to the guest.
 *
 * viewSDK.getUiState() returns { state, subscribe }
 * synchronously. `state` is the latest cached snapshot; `subscribe`
 * fires on every host push.
 *
 * @see SendToHost — writing back to the host
 */
import { useEffect, useState } from 'react';
import {
  Building2,
  ExternalLink,
  Globe,
  Phone,
  Star,
  Tag,
  User,
} from 'lucide-react';
import { getViewSDK } from '@salesforce/platform-sdk';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Rating = 'Hot' | 'Warm' | 'Cold';

interface AccountProps {
  recordId?: string;
  name?: string | null;
  rating?: Rating | null;
  type?: string | null;
  industry?: string | null;
  website?: string | null;
  phone?: string | null;
}

const RATING_TONE: Record<Rating, string> = {
  Hot: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100',
  Warm: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100',
  Cold: 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-100',
};

export default function ReadHostData() {
  const [account, setAccount] = useState<AccountProps>({});
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    // getViewSDK() is async; if the component unmounts before it resolves,
    // `cancelled` stops us from subscribing to a dead component.
    let cancelled = false;
    getViewSDK().then(sdk => {
      if (cancelled) return;
      const ui = sdk.getUiState?.();
      if (!ui) return;
      setAccount(ui.state.props as AccountProps);
      unsubscribe = ui.subscribe(next => {
        setAccount(next.props as AccountProps);
        setUpdateCount(c => c + 1);
      });
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const { name, rating, type, industry, website, phone } = account;
  const connected = Boolean(account.recordId);

  return (
    <div className="p-1">
      <Card
        // Remount on every push so the fade-in animation replays as a
        // visual "pulse" confirming fresh host data arrived.
        key={updateCount}
        className={cn(
          'max-w-md transition-shadow',
          updateCount > 0 && 'animate-in fade-in duration-500'
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="size-4" aria-hidden />
            {name ?? 'Account'}
          </CardTitle>
          <CardDescription>
            {connected
              ? `Live from the host — ${updateCount} update${updateCount === 1 ? '' : 's'} received`
              : 'Drop this component on an Account record page to see live data.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
            <Row icon={<Star className="size-3.5" />} label="Rating">
              {rating ? (
                <Badge
                  variant="secondary"
                  className={cn('font-normal', RATING_TONE[rating])}
                >
                  {rating}
                </Badge>
              ) : (
                <Muted />
              )}
            </Row>

            <Row icon={<Tag className="size-3.5" />} label="Type">
              {type ? (
                <Badge variant="outline" className="font-normal">
                  {type}
                </Badge>
              ) : (
                <Muted />
              )}
            </Row>

            <Row icon={<Building2 className="size-3.5" />} label="Industry">
              {industry ?? <Muted />}
            </Row>

            <Row icon={<Globe className="size-3.5" />} label="Website">
              {website ? (
                <a
                  href={normalizeUrl(website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {website}
                </a>
              ) : (
                <Muted />
              )}
            </Row>

            <Row icon={<Phone className="size-3.5" />} label="Phone">
              {phone ?? <Muted />}
            </Row>
          </dl>
        </CardContent>
      </Card>
      <a
        href="https://github.com/trailheadapps/multiframework-recipes/blob/main/force-app/main/react-recipes/uiBundles/reactRecipes/src/recipes/embedding/ReadHostData.tsx"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-primary mt-3 inline-flex items-center gap-1 text-xs"
      >
        Guest (ReadHostData.tsx)
        <ExternalLink className="size-3" aria-hidden />
      </a>
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-muted-foreground flex items-center gap-1.5">
        {icon}
        {label}
      </dt>
      <dd>{children}</dd>
    </>
  );
}

function Muted() {
  return <span className="text-muted-foreground">—</span>;
}

function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

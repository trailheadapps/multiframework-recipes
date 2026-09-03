/**
 * Basic Render
 *
 * A minimum viable microfrontend recipe. Reads Account props (name, industry, type,
 * website) pushed by the LWC host through the Platform SDK's ui-state
 * channel and renders them as a card.
 *
 * @see ReadHostData — subscribing to host updates via viewSDK.getUiState()
 */
import { useEffect, useState } from 'react';
import { Building2, ExternalLink, Globe, Tag } from 'lucide-react';
import { getViewSDK } from '@salesforce/platform-sdk';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AccountProps {
  recordId?: string;
  name?: string | null;
  industry?: string | null;
  type?: string | null;
  website?: string | null;
}

export default function BasicRender() {
  const [account, setAccount] = useState<AccountProps>({});

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    getViewSDK().then(sdk => {
      if (cancelled) return;
      const ui = sdk.getUiState?.();
      if (!ui) return;
      setAccount(ui.state.props as AccountProps);
      unsubscribe = ui.subscribe(next =>
        setAccount(next.props as AccountProps)
      );
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const { name, industry, type, website } = account;
  const connected = Boolean(account.recordId);

  return (
    <div className="p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">{name ?? 'Account'}</CardTitle>
          <CardDescription>
            {connected ? (
              <>
                Live from{' '}
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  <code className="text-xs">
                    {window.location.origin}
                    {window.location.pathname}
                  </code>
                </a>
              </>
            ) : (
              'Waiting for host…'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
            <dt className="text-muted-foreground flex items-center gap-1.5">
              <Building2 className="size-3.5" aria-hidden />
              Industry
            </dt>
            <dd>
              {industry ? (
                <Badge variant="secondary" className="font-normal">
                  {industry}
                </Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </dd>

            <dt className="text-muted-foreground flex items-center gap-1.5">
              <Tag className="size-3.5" aria-hidden />
              Type
            </dt>
            <dd>
              {type ? (
                <Badge variant="outline" className="font-normal">
                  {type}
                </Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </dd>

            <dt className="text-muted-foreground flex items-center gap-1.5">
              <Globe className="size-3.5" aria-hidden />
              Website
            </dt>
            <dd>
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
                <span className="text-muted-foreground">—</span>
              )}
            </dd>
          </dl>
        </CardContent>
      </Card>
      <a
        href="https://github.com/trailheadapps/multiframework-recipes/blob/main/force-app/main/react-recipes/uiBundles/reactRecipes/src/recipes/embedding/BasicRender.tsx"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-primary mt-3 inline-flex items-center gap-1 text-xs"
      >
        Guest (BasicRender.tsx)
        <ExternalLink className="size-3" aria-hidden />
      </a>
    </div>
  );
}

function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

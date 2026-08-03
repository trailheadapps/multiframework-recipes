/**
 * Theme Tokens
 *
 * The host sends a theme name (`light`, `dark`, or `salesforce`). The
 * guest decides what each name looks like. The root wrapper's class
 * controls a set of CSS variables; shadcn primitives (Card, Badge,
 * Button…) read those variables through their existing utility classes
 * (`bg-card`, `text-foreground`, etc.), so no component code has to
 * know about the theme.
 *
 * How the CSS lives:
 *   - `.light` — implicit default. Uses the `:root` variables defined
 *     in styles/global.css (@layer base).
 *   - `.dark`  — overrides those same variables in a `.dark {}` block
 *     also in global.css. shadcn already targets `.dark` via its
 *     built-in `dark:` variant.
 *   - `.salesforce` — an SLDS palette *and* chrome overrides for the
 *     Card slots (title weight, badge shape, etc.), defined next to
 *     this file in theme-tokens-salesforce.css.
 *
 * @see BasicRender — same Account card shape without theming
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
import './theme-tokens-salesforce.css';

type Theme = 'light' | 'dark' | 'salesforce';

interface Payload {
  theme?: Theme;
  recordId?: string;
  name?: string | null;
  industry?: string | null;
  type?: string | null;
  website?: string | null;
}

export default function ThemeTokens() {
  const [payload, setPayload] = useState<Payload>({});

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    getViewSDK().then(sdk => {
      if (cancelled) return;
      const ui = sdk.getUiState?.();
      if (!ui) return;
      setPayload(ui.state.props as Payload);
      unsubscribe = ui.subscribe(next => setPayload(next.props as Payload));
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const { theme = 'light', name, industry, type, website } = payload;
  const connected = Boolean(payload.recordId);

  // Setting the class name on the wrapper is all that changes; the CSS
  // variables cascade to every child.
  return (
    <div className={`${theme} p-1`}>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">{name ?? 'Account'}</CardTitle>
          <CardDescription>
            {connected
              ? `Guest is in ${theme} mode — host sent it.`
              : 'Waiting for host…'}
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
        href="https://github.com/trailheadapps/multiframework-recipes/blob/main/force-app/main/react-recipes/uiBundles/reactRecipes/src/recipes/embedding/ThemeTokens.tsx"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-primary mt-3 inline-flex items-center gap-1 text-xs"
      >
        Guest (ThemeTokens.tsx)
        <ExternalLink className="size-3" aria-hidden />
      </a>
    </div>
  );
}

function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

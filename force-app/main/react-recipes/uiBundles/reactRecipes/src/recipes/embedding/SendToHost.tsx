/**
 * Send To Host — Account scoring matrix
 *
 * A 3×3 grid over engagement × fit. Each cell maps to a (Rating, Type)
 * pair. Clicking fires a `score` CustomEvent via viewSDK.dispatchEvent;
 * the host reads `rating` and `type` off the detail and writes them with
 * updateRecord.
 */
import { useEffect, useState } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
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

type Engagement = 'low' | 'medium' | 'high';
type Fit = 'poor' | 'partial' | 'strong';
type Rating = 'Hot' | 'Warm' | 'Cold';

interface Cell {
  rating: Rating;
  type: string;
}

interface HostProps {
  recordId?: string;
  rating?: Rating | null;
  type?: string | null;
}

// Rows: engagement (high → low). Cols: fit (poor → strong).
// High engagement + strong fit → Hot; low + poor → Cold; middle band → Warm.
const MATRIX: Record<Engagement, Record<Fit, Cell>> = {
  high: {
    poor: { rating: 'Warm', type: 'Prospect' },
    partial: { rating: 'Warm', type: 'Customer - Channel' },
    strong: { rating: 'Hot', type: 'Customer - Direct' },
  },
  medium: {
    poor: { rating: 'Cold', type: 'Prospect' },
    partial: { rating: 'Warm', type: 'Customer - Channel' },
    strong: { rating: 'Warm', type: 'Customer - Direct' },
  },
  low: {
    poor: { rating: 'Cold', type: 'Prospect' },
    partial: { rating: 'Cold', type: 'Customer - Channel' },
    strong: { rating: 'Warm', type: 'Technology Partner' },
  },
};

const ENGAGEMENTS: Engagement[] = ['high', 'medium', 'low'];
const FITS: Fit[] = ['poor', 'partial', 'strong'];

const RATING_STYLE: Record<Rating, string> = {
  Hot: 'bg-red-100 text-red-900 hover:bg-red-200 dark:bg-red-950 dark:text-red-100',
  Warm: 'bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-100',
  Cold: 'bg-sky-100 text-sky-900 hover:bg-sky-200 dark:bg-sky-950 dark:text-sky-100',
};

export default function SendToHost() {
  const [host, setHost] = useState<HostProps>({});

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    getViewSDK().then(sdk => {
      if (cancelled) return;
      const ui = sdk.getUiState?.();
      if (!ui) return;
      setHost(ui.state.props as HostProps);
      unsubscribe = ui.subscribe(next => setHost(next.props as HostProps));
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const connected = Boolean(host.recordId);

  async function handleClick(engagement: Engagement, fit: Fit) {
    if (!connected) return;
    const { rating, type } = MATRIX[engagement][fit];
    const sdk = await getViewSDK();
    sdk.dispatchEvent?.(
      new CustomEvent('score', {
        detail: { rating, type },
        bubbles: true,
      })
    );
  }

  return (
    <div className="p-4">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="size-4" aria-hidden />
            Score this Account
          </CardTitle>
          <CardDescription>
            {connected
              ? 'Pick a cell to update Rating and Type.'
              : 'Drop this component on an Account record page to enable scoring.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connected && (
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span>Current:</span>
              <Badge variant="outline" className="font-normal">
                {host.rating ?? 'Unrated'}
              </Badge>
              <Badge variant="outline" className="font-normal">
                {host.type ?? 'No Type'}
              </Badge>
            </div>
          )}

          <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-1.5 text-xs">
            <div />
            {FITS.map(fit => (
              <div
                key={fit}
                className="text-muted-foreground pb-1 text-center font-medium capitalize"
              >
                {fit} fit
              </div>
            ))}

            {ENGAGEMENTS.map(engagement => (
              <div key={engagement} className="contents">
                <div className="text-muted-foreground flex items-center pr-2 text-right font-medium capitalize">
                  {engagement}
                </div>
                {FITS.map(fit => {
                  const cell = MATRIX[engagement][fit];
                  return (
                    <button
                      key={fit}
                      type="button"
                      disabled={!connected}
                      onClick={() => handleClick(engagement, fit)}
                      aria-label={`Score ${engagement} engagement, ${fit} fit — sets Rating to ${cell.rating} and Type to ${cell.type}`}
                      className={cn(
                        'ring-foreground/10 flex flex-col items-center gap-1 rounded-md px-2 py-3 text-xs font-medium ring-1 transition',
                        'focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        RATING_STYLE[cell.rating]
                      )}
                    >
                      <span className="text-sm font-semibold">
                        {cell.rating}
                      </span>
                      <span className="opacity-70">{cell.type}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <a
        href="https://github.com/trailheadapps/multiframework-recipes/blob/main/force-app/main/react-recipes/uiBundles/reactRecipes/src/recipes/embedding/SendToHost.tsx"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-primary mt-3 inline-flex items-center gap-1 text-xs"
      >
        Guest (SendToHost.tsx)
        <ExternalLink className="size-3" aria-hidden />
      </a>
    </div>
  );
}

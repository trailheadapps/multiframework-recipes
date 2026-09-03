/**
 * Receive Event — live stock quote
 *
 * The mirror of SendToHost: here the host pushes an event *down* to the
 * guest. The LWC dispatches a `refreshticker` event on
 * <lightning-ui-embedding>; the guest hears it through
 * viewSDK.addEventListener() and re-pulls.
 *
 * Why an event and not ui-state? Two channels, two jobs:
 *   - ui-state carries the Account's `tickerSymbol` — a Salesforce field
 *     the host owns and pushes (same as every other recipe).
 *   - the share price is NOT in Salesforce. Only the guest can fetch it,
 *     so the host can't push it — it can only fire a `refreshticker` event
 *     that says "re-pull your own data now."
 *
 * This is fire-and-forget: the host doesn't wait for a result. If the host
 * needed an answer ("did you accept this?"), the guest would have to dispatch
 * its own reply event — there's no synchronous return value across the bridge,
 * so a dispatched event can't hand data back to its sender. A `cancelable`
 * event doesn't help either: `preventDefault()` never reaches the host, because
 * the guest receives a fresh, non-cancelable copy of the event.
 *
 * @see ReadHostData — receiving host-owned fields via ui-state
 * @see SendToHost — dispatching events the other direction (guest → host)
 */
import { useEffect, useRef, useState } from 'react';
import { ExternalLink, TrendingUp } from 'lucide-react';
import { getViewSDK } from '@salesforce/platform-sdk';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface AccountProps {
  recordId?: string;
  name?: string | null;
  tickerSymbol?: string | null;
}

interface Quote {
  price: number;
  asOf: string;
}

export default function ReceiveEvent() {
  const [account, setAccount] = useState<AccountProps>({});
  const [quote, setQuote] = useState<Quote | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // The refresh listener closes over this ref so it always re-pulls the
  // current ticker without re-subscribing every time ui-state changes.
  const tickerRef = useRef<string | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    // Apply host props and, when the ticker changes, seed a fresh quote.
    const applyProps = (props: AccountProps) => {
      setAccount(props);
      const symbol = props.tickerSymbol ?? null;
      if (symbol && symbol !== tickerRef.current) {
        tickerRef.current = symbol;
        fetchQuote(symbol).then(price =>
          setQuote({ price, asOf: new Date().toLocaleTimeString() })
        );
      }
    };

    getViewSDK().then(sdk => {
      if (cancelled) return;

      // ui-state: which company are we looking at?
      const ui = sdk.getUiState?.();
      if (ui) {
        applyProps(ui.state.props as AccountProps);
        cleanup = ui.subscribe(next => applyProps(next.props as AccountProps));
      }

      // Host → guest: the LWC fires `refreshticker`; re-pull the quote.
      const onRefresh = () => {
        const symbol = tickerRef.current;
        if (!symbol) return;
        fetchQuote(symbol).then(price => {
          setQuote({ price, asOf: new Date().toLocaleTimeString() });
          setRefreshCount(c => c + 1);
        });
      };
      sdk.addEventListener?.('refreshticker', onRefresh);

      const off = cleanup;
      cleanup = () => {
        off?.();
        sdk.removeEventListener?.('refreshticker', onRefresh);
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  const connected = Boolean(account.recordId);
  const { name, tickerSymbol } = account;

  return (
    <div className="p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="size-4" aria-hidden />
            {tickerSymbol ?? 'Stock quote'}
          </CardTitle>
          <CardDescription>
            {connected
              ? tickerSymbol
                ? `Live quote for ${name ?? 'this Account'}. The host fires a refreshticker event via viewSDK.addEventListener; the guest re-pulls the price.`
                : 'This Account has no ticker symbol.'
              : 'Drop this component on an Account record page to see a quote.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tickerSymbol && quote && (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tabular-nums">
                ${quote.price.toFixed(2)}
              </span>
              <span className="text-muted-foreground text-xs">
                as of {quote.asOf}
              </span>
            </div>
          )}

          {tickerSymbol && (
            <p className="text-muted-foreground text-xs">
              {refreshCount} refresh{refreshCount === 1 ? '' : 'es'} received
              from the host
            </p>
          )}
        </CardContent>
      </Card>
      <a
        href="https://github.com/trailheadapps/multiframework-recipes/blob/main/force-app/main/react-recipes/uiBundles/reactRecipes/src/recipes/embedding/ReceiveEvent.tsx"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-primary mt-3 inline-flex items-center gap-1 text-xs"
      >
        Guest (ReceiveEvent.tsx)
        <ExternalLink className="size-3" aria-hidden />
      </a>
    </div>
  );
}

// Stand-in for a real market feed. A production guest would fetch() its own
// quote API here; we derive a stable base price from the symbol and add a
// little jitter so each host refresh visibly moves the number.
async function fetchQuote(symbol: string): Promise<number> {
  const base = [...symbol].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 500;
  const jitter = (Math.random() - 0.5) * 4;
  return Math.max(1, base + jitter);
}

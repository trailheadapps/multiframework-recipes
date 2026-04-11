/**
 * Account Card — shadcn/ui
 *
 * Same Account data displayed using shadcn/ui Card components and Tailwind.
 * Uses a neutral design system built on Radix UI primitives — best for
 * custom UIs that don't need to match the Salesforce look and feel.
 *
 * @see AccountCardDSR — same card with design-system-react components
 */
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useFirstAccount } from '@/api/account';

export default function AccountCardShadcn() {
  const { account, loading, error } = useFirstAccount();

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!account)
    return <p className="text-sm text-muted-foreground">No account found.</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{account.Name?.value}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Industry</dt>
          <dd>{account.Industry?.value ?? '—'}</dd>

          <dt className="text-muted-foreground">Annual Revenue</dt>
          <dd>{formatRevenue(account.AnnualRevenue?.value)}</dd>
        </dl>
      </CardContent>
      <CardFooter>
        <a href="#" className="text-sm text-primary hover:underline">
          View Account
        </a>
      </CardFooter>
    </Card>
  );
}

function formatRevenue(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

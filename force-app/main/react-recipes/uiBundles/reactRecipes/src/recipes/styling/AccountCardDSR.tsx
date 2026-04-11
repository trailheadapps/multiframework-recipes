/**
 * Account Card — SLDS React (design-system-react)
 *
 * Same Account data rendered with the Card component from design-system-react.
 * DSR generates the correct SLDS markup automatically — this is the closest
 * analogy to LWC's approach where a component abstracts the markup and you
 * pass props. Less markup to write, less control over the generated HTML.
 *
 * @see IconsSLDS — SLDS icon sprites
 */
import { Card } from '@salesforce/design-system-react';
import { useFirstAccount } from '@/api/account';

export default function AccountCardDSR() {
  const { account, loading, error } = useFirstAccount();

  if (loading) return <p className="slds-text-body_regular">Loading…</p>;
  if (error) return <p className="slds-text-color_error">{error}</p>;
  if (!account)
    return <p className="slds-text-color_weak">No account found.</p>;

  return (
    <Card
      heading={account.Name?.value ?? ''}
      bodyClassName="slds-card__body_inner"
      footer={
        <a className="slds-card__footer-action" href="#">
          View Account
        </a>
      }
    >
      <dl className="slds-list_horizontal slds-wrap">
        <dt
          className="slds-item_label slds-text-color_weak slds-truncate"
          title="Industry"
        >
          Industry
        </dt>
        <dd className="slds-item_detail slds-truncate">
          {account.Industry?.value ?? '—'}
        </dd>

        <dt
          className="slds-item_label slds-text-color_weak slds-truncate"
          title="Annual Revenue"
        >
          Annual Revenue
        </dt>
        <dd className="slds-item_detail slds-truncate">
          {formatRevenue(account.AnnualRevenue?.value)}
        </dd>
      </dl>
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

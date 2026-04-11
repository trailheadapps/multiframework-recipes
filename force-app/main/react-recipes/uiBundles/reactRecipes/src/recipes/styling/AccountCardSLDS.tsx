/**
 * Account Card — SLDS Blueprint
 *
 * Displays Account data using SLDS blueprint CSS classes on plain JSX markup.
 * The manual equivalent of <lightning-card> -- you own the markup structure.
 *
 * @see AccountCardShadcn — same card with shadcn/ui components
 */
import { useFirstAccount } from '@/api/account';

export default function AccountCardSLDS() {
  const { account, loading, error } = useFirstAccount();

  if (loading) return <p className="slds-text-body_regular">Loading…</p>;
  if (error) return <p className="slds-text-color_error">{error}</p>;
  if (!account)
    return <p className="slds-text-color_weak">No account found.</p>;

  return (
    <article className="slds-card">
      {/* Header: icon + title */}
      <div className="slds-card__header slds-grid">
        <header className="slds-media slds-media_center slds-has-flexi-truncate">
          <div className="slds-media__figure">
            {/* slds-icon-standard-account applies the object color background.
                Each standard object has its own class: slds-icon-standard-contact, etc. */}
            <span
              className="slds-icon_container slds-icon-standard-account"
              title="Account"
            >
              <svg className="slds-icon slds-icon_small" aria-hidden="true">
                <use href="/assets/icons/standard-sprite/svg/symbols.svg#account" />
              </svg>
              <span className="slds-assistive-text">Account</span>
            </span>
          </div>
          <div className="slds-media__body">
            <h2 className="slds-card__header-title">
              <span className="slds-truncate" title={account.Name?.value ?? ''}>
                {account.Name?.value}
              </span>
            </h2>
          </div>
        </header>
      </div>

      {/* Body: key/value field list */}
      <div className="slds-card__body slds-card__body_inner">
        {/* slds-list_horizontal slds-wrap: SLDS pattern for key/value field detail layout */}
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
      </div>

      {/* Footer */}
      <footer className="slds-card__footer">
        <a className="slds-card__footer-action" href="#">
          View Account
        </a>
      </footer>
    </article>
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

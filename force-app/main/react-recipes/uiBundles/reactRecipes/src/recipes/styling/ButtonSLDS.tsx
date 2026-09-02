/**
 * SLDS Button — Blueprint CSS Classes
 *
 * All standard SLDS button variants using slds-button classes applied directly
 * to <button> elements — the manual equivalent of <lightning-button> -- you
 * own the markup.
 *
 * @see ButtonShadcn — same buttons with shadcn/ui and Tailwind
 */

const VARIANTS = [
  { label: 'Neutral', className: 'slds-button_neutral' },
  { label: 'Brand', className: 'slds-button_brand' },
  { label: 'Outline Brand', className: 'slds-button_outline-brand' },
  { label: 'Destructive', className: 'slds-button_destructive' },
  { label: 'Text Destructive', className: 'slds-button_text-destructive' },
  { label: 'Success', className: 'slds-button_success' },
];

export default function ButtonSLDS() {
  return (
    <div>
      {/* Variants */}
      <section className="slds-m-bottom_medium">
        <h3 className="slds-text-heading_small slds-m-bottom_small">
          Variants
        </h3>
        <div className="slds-grid slds-wrap">
          {VARIANTS.map(({ label, className }) => (
            <button
              key={label}
              className={`slds-button ${className} slds-m-right_x-small slds-m-bottom_x-small`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Disabled */}
      <section className="slds-m-bottom_medium">
        <h3 className="slds-text-heading_small slds-m-bottom_small">
          Disabled
        </h3>
        <div className="slds-grid slds-wrap">
          <button
            className="slds-button slds-button_neutral slds-m-right_x-small slds-m-bottom_x-small"
            disabled
          >
            Neutral
          </button>
          <button
            className="slds-button slds-button_brand slds-m-right_x-small slds-m-bottom_x-small"
            disabled
          >
            Brand
          </button>
        </div>
      </section>

      {/* Icon buttons */}
      <section>
        <h3 className="slds-text-heading_small slds-m-bottom_small">
          Icon Buttons
        </h3>
        <div className="slds-grid slds-wrap slds-grid_vertical-align-center">
          {/* Icon-only */}
          <button
            className="slds-button slds-button_icon slds-button_icon-border-filled recipes-buttonIcon-lift slds-m-right_x-small slds-m-bottom_x-small"
            title="Settings"
          >
            <svg className="slds-button__icon" aria-hidden="true">
              <use href="/assets/icons/utility-sprite/svg/symbols.svg#settings" />
            </svg>
            <span className="slds-assistive-text">Settings</span>
          </button>

          {/* Icon-only, brand */}
          <button
            className="slds-button slds-button_icon slds-button_icon-brand slds-m-right_x-small slds-m-bottom_x-small"
            title="Add"
          >
            <svg className="slds-button__icon" aria-hidden="true">
              <use href="/assets/icons/utility-sprite/svg/symbols.svg#add" />
            </svg>
            <span className="slds-assistive-text">Add</span>
          </button>

          {/* Label + icon */}
          <button className="slds-button slds-button_neutral slds-m-right_x-small slds-m-bottom_x-small">
            <svg
              className="slds-button__icon slds-button__icon_left"
              aria-hidden="true"
            >
              <use href="/assets/icons/utility-sprite/svg/symbols.svg#add" />
            </svg>
            New Record
          </button>

          <button className="slds-button slds-button_brand slds-m-right_x-small slds-m-bottom_x-small">
            <svg
              className="slds-button__icon slds-button__icon_left"
              aria-hidden="true"
            >
              <use href="/assets/icons/utility-sprite/svg/symbols.svg#upload" />
            </svg>
            Upload
          </button>
        </div>
      </section>
    </div>
  );
}

/**
 * SLDS Button — design-system-react
 *
 * Same variants as ButtonSLDS using the Button component from design-system-react,
 * which generates the correct slds-button markup automatically.
 *
 * @see AccountCardSLDS — SLDS card layout with blueprint CSS
 */
import { Button } from '@salesforce/design-system-react';

const VARIANTS: { label: string; variant: string }[] = [
  { label: 'Neutral', variant: 'neutral' },
  { label: 'Brand', variant: 'brand' },
  { label: 'Outline Brand', variant: 'outline-brand' },
  { label: 'Destructive', variant: 'destructive' },
  { label: 'Text Destructive', variant: 'text-destructive' },
  { label: 'Success', variant: 'success' },
];

export default function ButtonDSR() {
  return (
    <div>
      {/* Variants */}
      <section className="slds-m-bottom_medium">
        <h3 className="slds-text-heading_small slds-m-bottom_small">
          Variants
        </h3>
        <div className="slds-button-group-row">
          {VARIANTS.map(({ label, variant }) => (
            <Button key={label} label={label} variant={variant} />
          ))}
        </div>
      </section>

      {/* Disabled */}
      <section className="slds-m-bottom_medium">
        <h3 className="slds-text-heading_small slds-m-bottom_small">
          Disabled
        </h3>
        <div className="slds-button-group-row">
          <Button label="Neutral" variant="neutral" disabled />
          <Button label="Brand" variant="brand" disabled />
        </div>
      </section>

      {/* With icon */}
      <section>
        <h3 className="slds-text-heading_small slds-m-bottom_small">
          With Icon
        </h3>
        <div className="slds-button-group-row">
          <Button
            label="New Record"
            variant="neutral"
            iconCategory="utility"
            iconName="add"
            iconPosition="left"
          />
          <Button
            label="Upload"
            variant="brand"
            iconCategory="utility"
            iconName="upload"
            iconPosition="left"
          />
        </div>
      </section>
    </div>
  );
}

import { ChangeDetectionStrategy, Component } from '@angular/core';

const VARIANTS = [
	{ label: 'Neutral', className: 'slds-button_neutral' },
	{ label: 'Brand', className: 'slds-button_brand' },
	{ label: 'Outline Brand', className: 'slds-button_outline-brand' },
	{ label: 'Destructive', className: 'slds-button_destructive' },
	{ label: 'Text Destructive', className: 'slds-button_text-destructive' },
	{ label: 'Success', className: 'slds-button_success' },
];

/**
 * SLDS Button — Blueprint CSS Classes
 *
 * Standard SLDS button variants applied as `slds-button_*` classes on plain
 * <button> elements — the manual equivalent of <lightning-button>, where you own
 * the markup. Icons come from the SLDS utility sprite via SVG <use>.
 *
 * @see ButtonShadcnComponent — the same buttons with the app's spartan-ng button
 */
@Component({
	selector: 'app-button-slds',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './button-slds.html',
})
export class ButtonSldsComponent {
	protected readonly variants = VARIANTS;
}

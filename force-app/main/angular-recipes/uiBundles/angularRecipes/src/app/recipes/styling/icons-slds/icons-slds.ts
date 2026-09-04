import { ChangeDetectionStrategy, Component } from '@angular/core';

interface IconCategory {
	label: string;
	sprite: string;
	standard: boolean;
	names: string[];
}

// SLDS icons live in SVG sprite sheets under /assets/icons. Reference them with
// <use href="/assets/icons/{sprite}/svg/symbols.svg#{name}">. Only the Utility
// and Standard sprites ship with this bundle; the Action sprite is omitted (its
// symbols.svg isn't bundled, so those refs would 404).
const CATEGORIES: IconCategory[] = [
	{
		label: 'Utility',
		sprite: 'utility-sprite',
		standard: false,
		names: ['home', 'settings', 'add', 'delete', 'search', 'edit'],
	},
	{
		label: 'Standard',
		sprite: 'standard-sprite',
		standard: true,
		names: ['account', 'contact', 'opportunity', 'lead', 'case', 'task'],
	},
];

/**
 * SLDS Icons — SVG Sprite References
 *
 * SLDS icons are referenced from sprite sheets rather than imported as
 * components. Standard icons add a per-object color class
 * (slds-icon-standard-<name>); there's no <lightning-icon> here — you own the
 * markup.
 *
 * @see IconsLucideComponent — the same idea with individual Lucide components
 */
@Component({
	selector: 'app-icons-slds',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './icons-slds.html',
})
export class IconsSldsComponent {
	protected readonly categories = CATEGORIES;

	protected containerClass(category: IconCategory, name: string): string {
		return category.standard
			? `slds-icon_container slds-icon-standard-${name}`
			: 'slds-icon_container';
	}

	protected href(category: IconCategory, name: string): string {
		return `/assets/icons/${category.sprite}/svg/symbols.svg#${name}`;
	}
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
	lucideArrowDown,
	lucideArrowUp,
	lucideChevronDown,
	lucideChevronRight,
	lucideCircleAlert,
	lucideFileQuestion,
	lucideListFilter,
	lucideLogIn,
	lucideLogOut,
	lucidePlus,
	lucideSearch,
	lucideSearchX,
	lucideTrash2,
	lucideUpload,
	lucideUser,
	lucideUserPen,
	lucideUserPlus,
	lucideX,
} from '@ng-icons/lucide';

export const APP_ICONS = {
	error: lucideCircleAlert,
	close: lucideX,
	person: lucideUser,
	login: lucideLogIn,
	logout: lucideLogOut,
	editProfile: lucideUserPen,
	personAdd: lucideUserPlus,
	search: lucideSearch,
	filter: lucideListFilter,
	chevronRight: lucideChevronRight,
	chevronDown: lucideChevronDown,
	arrowUp: lucideArrowUp,
	arrowDown: lucideArrowDown,
	noResults: lucideSearchX,
	notFound: lucideFileQuestion,
	add: lucidePlus,
	delete: lucideTrash2,
	upload: lucideUpload,
} as const;

export type AppIconName = keyof typeof APP_ICONS;

@Component({
	selector: 'app-icon',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [NgIcon],
	providers: [provideIcons(APP_ICONS)],
	host: {
		'[class]': 'classes()',
		'[attr.aria-label]': 'ariaLabel()',
		'[attr.aria-hidden]': 'ariaLabel() ? null : true',
	},
	template: '<ng-icon [name]="name()" [size]="size()" />',
})
export class IconComponent {
	readonly name = input.required<AppIconName>();
	readonly size = input<string>('1rem');
	readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
	// Non-size utilities (color, margin) still pass through to the host.
	readonly classes = input<string>('', { alias: 'class' });
}

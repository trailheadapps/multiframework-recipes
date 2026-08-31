import {
	ChangeDetectionStrategy,
	Component,
	booleanAttribute,
	computed,
	input,
	output,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/styles/button';
import { APP_ICONS, type AppIconName } from '../icon/icon';
import { SpinnerComponent } from '../spinner/spinner';

export type AppButtonAppearance = 'filled' | 'outlined' | 'text' | 'destructive';
export type AppButtonSize =
	'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';

const APPEARANCE_TO_VARIANT: Record<AppButtonAppearance, string> = {
	filled: 'default',
	outlined: 'outline',
	text: 'ghost',
	destructive: 'destructive',
};

@Component({
	selector: 'app-button',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [HlmButtonImports, NgIcon, SpinnerComponent],
	providers: [provideIcons(APP_ICONS)],
	templateUrl: './button.html',
})
export class ButtonComponent {
	readonly appearance = input<AppButtonAppearance>('filled');
	readonly size = input<AppButtonSize>('default');
	readonly type = input<'button' | 'submit' | 'reset'>('button');
	readonly disabled = input(false, { transform: booleanAttribute });
	// While loading the button is disabled and shows a spinner; loadingLabel
	// replaces the content (empty label => spinner only).
	readonly loading = input(false, { transform: booleanAttribute });
	readonly loadingLabel = input<string>('');
	readonly ariaLabel = input<string>();
	readonly ariaExpanded = input<boolean>();
	readonly classes = input<string>('', { alias: 'class' });
	readonly icon = input<AppIconName | ''>('');
	readonly iconEnd = input<AppIconName | ''>('');
	readonly clicked = output<MouseEvent>();

	protected readonly hlmVariant = computed(
		() =>
			APPEARANCE_TO_VARIANT[this.appearance()] as 'default' | 'outline' | 'ghost' | 'destructive',
	);
}

export const ButtonImports = [ButtonComponent] as const;

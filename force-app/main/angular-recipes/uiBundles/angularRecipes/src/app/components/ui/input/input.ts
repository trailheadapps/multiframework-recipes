import {
	ChangeDetectionStrategy,
	Component,
	booleanAttribute,
	computed,
	input,
	model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HlmInputGroupImports } from '@spartan-ng/styles/input-group';
import { HlmLabelImports } from '@spartan-ng/styles/label';
import type { AppFieldSize } from '../field-size';
import type { AppFieldAppearance } from '../field-appearance';
import { IconComponent, type AppIconName } from '../icon/icon';

const SIZE_CLASSES: Record<AppFieldSize, string> = {
	sm: 'h-6 text-xs',
	default: 'h-8',
	lg: 'h-10',
};

const APPEARANCE_CLASSES: Record<AppFieldAppearance, string> = {
	outline: '',
	fill: 'border-transparent bg-muted',
};

@Component({
	selector: 'app-input',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [FormsModule, HlmInputGroupImports, HlmLabelImports, IconComponent],
	host: { class: 'block min-w-0' },
	templateUrl: './input.html',
})
export class InputComponent {
	readonly value = model<string>('');
	readonly placeholder = input<string>('');
	readonly label = input<string>('');
	readonly type = input<string>('text');
	readonly disabled = input(false, { transform: booleanAttribute });
	readonly appearance = input<AppFieldAppearance>('outline');
	readonly error = input(false, { transform: booleanAttribute });
	readonly errorMessage = input<string>('');
	readonly size = input<AppFieldSize>('default');
	readonly id = input<string>('');
	readonly ariaDescribedby = input<string>('');
	// Accessible name for inputs with no visible <label> (e.g. an icon-only
	// search box); harmless when a label is present.
	readonly ariaLabel = input<string>('');
	// Optional leading/trailing icons. When set the input renders inside an
	// input-group so the icon sits inside the shared border.
	readonly icon = input<AppIconName | ''>('');
	readonly iconEnd = input<AppIconName | ''>('');

	private static _uid = 0;
	private readonly _autoId = `app-input-${InputComponent._uid++}`;
	protected readonly resolvedId = computed(() => this.id() || this._autoId);
	protected readonly errorId = computed(() => `${this.resolvedId()}-error`);

	// Link the error message to the input via aria-describedby (merged with any
	// caller-supplied ids) so screen readers announce it; null when absent.
	protected readonly describedBy = computed(() => {
		const ids = [this.ariaDescribedby(), this.error() && this.errorMessage() ? this.errorId() : '']
			.filter(Boolean)
			.join(' ');
		return ids || null;
	});

	// Size + appearance apply to the input-group wrapper, which owns the border.
	protected readonly groupClasses = computed(() =>
		[SIZE_CLASSES[this.size()], APPEARANCE_CLASSES[this.appearance()]].filter(Boolean).join(' '),
	);
}

export const InputImports = [InputComponent] as const;

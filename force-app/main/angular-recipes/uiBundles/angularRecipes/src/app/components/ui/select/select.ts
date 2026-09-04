import {
	ChangeDetectionStrategy,
	Component,
	booleanAttribute,
	computed,
	input,
	model,
} from '@angular/core';
import { HlmSelectImports } from '@spartan-ng/styles/select';
import { HlmLabelImports } from '@spartan-ng/styles/label';
import type { AppFieldSize } from '../field-size';
import type { AppFieldAppearance } from '../field-appearance';

export interface AppSelectOption {
	value: string;
	label: string;
}

@Component({
	selector: 'app-select',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [HlmSelectImports, HlmLabelImports],
	host: { class: 'block min-w-0' },
	templateUrl: './select.html',
})
export class SelectComponent {
	readonly value = model<string>('');
	readonly values = model<readonly string[]>([]);
	readonly multiple = input(false, { transform: booleanAttribute });
	readonly options = input<readonly AppSelectOption[]>([]);
	readonly placeholder = input<string>('');
	readonly label = input<string>('');
	readonly disabled = input(false, { transform: booleanAttribute });
	readonly appearance = input<AppFieldAppearance>('outline');
	readonly size = input<AppFieldSize>('default');
	readonly id = input<string>('');
	readonly ariaLabel = input<string>('');

	private static _uid = 0;
	private readonly autoId = `app-select-${SelectComponent._uid++}`;
	// Forward a caller-supplied id (e.g. an app-field htmlFor target) to the
	// trigger button so an external <label for="..."> associates with it.
	protected readonly resolvedId = computed(() => this.id() || this.autoId);

	protected readonly itemToString = (value: string): string => {
		return this.options().find((o) => o.value === value)?.label ?? value;
	};

	protected readonly triggerClasses = computed(() => {
		if (this.appearance() === 'fill') return 'border-transparent bg-muted';
		return '';
	});

	protected onSingleChange(event: string | null | undefined): void {
		this.value.set(event ?? '');
	}

	protected onMultiChange(event: string[] | readonly string[] | null | undefined): void {
		this.values.set(event ?? []);
	}
}

export const SelectImports = [SelectComponent] as const;

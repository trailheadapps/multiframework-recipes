import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HlmField, HlmFieldImports } from '@spartan-ng/styles/field';

@Component({
	selector: 'app-field',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [HlmFieldImports],
	hostDirectives: [HlmField],
	host: {
		'data-slot': 'field',
		'[attr.data-invalid]': 'error() ? true : null',
	},
	templateUrl: './field.html',
})
export class FieldComponent {
	readonly label = input<string>('');
	readonly description = input<string>('');
	readonly error = input<string | null>(null);
	readonly required = input(false, { transform: booleanAttribute });
	readonly htmlFor = input<string | null>(null);
}

export const FieldImports = [FieldComponent] as const;

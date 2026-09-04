import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HlmLabelImports } from '@spartan-ng/styles/label';

@Component({
	selector: 'app-label',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [HlmLabelImports],
	template: `
		<label hlmLabel [for]="for() ?? undefined" class="mb-1.5 block"><ng-content /></label>
	`,
})
export class LabelComponent {
	readonly for = input<string | null | undefined>(undefined);
}

export const LabelImports = [LabelComponent] as const;

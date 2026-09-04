import type { BooleanInput } from '@angular/cdk/coercion';
import {
	booleanAttribute,
	ChangeDetectionStrategy,
	Component,
	computed,
	input,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { BrnFieldControlDescribedBy } from '@spartan-ng/brain/field';
import { BrnSelectTrigger } from '@spartan-ng/brain/select';
import { hlm } from '@spartan-ng/styles/utils';
import type { ClassValue } from 'clsx';

@Component({
	selector: 'hlm-select-trigger',
	imports: [NgIcon, BrnSelectTrigger, BrnFieldControlDescribedBy],
	providers: [provideIcons({ lucideChevronDown })],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { class: 'block' },
	template: `
		<button
			brnSelectTrigger
			brnFieldControlDescribedBy
			[forceInvalid]="forceInvalid()"
			[id]="buttonId()"
			[class]="_computedClass()"
			[attr.data-size]="size()"
			data-slot="select-trigger"
		>
			<ng-content />
			<ng-icon
				name="lucideChevronDown"
				class="text-muted-foreground text-[length:--spacing(4)] ms-auto"
			/>
		</button>
	`,
})
export class HlmSelectTrigger {
	private static _id = 0;

	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() =>
		hlm(
			'border-input data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 data-[matches-spartan-invalid=true]:ring-destructive/20 dark:data-[matches-spartan-invalid=true]:ring-destructive/40 data-[matches-spartan-invalid=true]:border-destructive dark:data-[matches-spartan-invalid=true]:border-destructive/50 gap-1.5 rounded-lg border bg-transparent py-2 ps-2.5 pe-2 text-sm transition-colors focus-visible:ring-3 data-[matches-spartan-invalid=true]:ring-3 data-[size=default]:h-8 data-[size=sm]:h-6 data-[size=sm]:text-xs data-[size=sm]:rounded-[min(var(--radius-md),10px)] data-[size=lg]:h-10 *:data-[slot=select-value]:gap-1.5 flex w-full items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0',
			this.userClass(),
		),
	);

	public readonly buttonId = input<string>(`hlm-select-trigger-${HlmSelectTrigger._id++}`);

	public readonly size = input<'default' | 'sm' | 'lg'>('default');

	/** Whether to force the trigger into an invalid state. */
	public readonly forceInvalid = input<boolean, BooleanInput>(false, {
		transform: booleanAttribute,
	});
}

import { Directive, input } from '@angular/core';
import { HlmButton, provideBrnButtonConfig } from '@spartan-ng/styles/button';
import { classes } from '@spartan-ng/styles/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const inputGroupButtonVariants = cva('gap-2 text-sm flex items-center shadow-none', {
	variants: {
		size: {
			xs: "h-6 gap-1 rounded-[calc(var(--radius)-3px)] px-1.5 [&>ng-icon:not([class*='text-'])]:text-[length:--spacing(3.5)]",
			sm: '',
			'icon-xs': 'size-6 rounded-[calc(var(--radius)-3px)] p-0 has-[>ng-icon]:p-0',
			'icon-sm': 'size-8 p-0 has-[>ng-icon]:p-0',
		},
	},
	defaultVariants: {
		size: 'xs',
	},
});

type InputGroupButtonVariants = VariantProps<typeof inputGroupButtonVariants>;

@Directive({
	selector: 'button[hlmInputGroupButton]',
	providers: [
		provideBrnButtonConfig({
			variant: 'ghost',
		}),
	],
	hostDirectives: [
		{
			directive: HlmButton,
			inputs: ['variant'],
		},
	],
	host: {
		'[attr.data-size]': 'size()',
		'[type]': 'type()',
	},
})
export class HlmInputGroupButton {
	public readonly size = input<InputGroupButtonVariants['size']>('xs');
	public readonly type = input<'button' | 'submit' | 'reset'>('button');

	constructor() {
		classes(() => inputGroupButtonVariants({ size: this.size() }));
	}
}

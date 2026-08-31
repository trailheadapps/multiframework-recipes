import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/styles/utils';

@Directive({
	selector: '[hlmCardTitle]',
	host: { 'data-slot': 'card-title' },
})
export class HlmCardTitle {
	constructor() {
		classes(() => 'text-base leading-snug font-medium group-data-[size=sm]/card:text-sm');
	}
}
